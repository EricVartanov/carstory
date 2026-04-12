<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class GarageController extends Controller
{
    /**
     * Display a listing of the current user's cars.
     */
    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        $cars = Car::query()
            ->where('user_id', $user->id)
            ->where('is_archived', false)
            ->withoutTrashed()
            ->withLatestEntry()
            ->latest()
            ->get([
                'id',
                'brand',
                'model',
                'year',
                'vin',
                'plate',
                'color',
                'cover_photo',
                'created_at',
            ]);

        $archivedCars = Car::query()
            ->where('user_id', $user->id)
            ->where('is_archived', true)
            ->onlyTrashed()
            ->withLatestEntry()
            ->latest('archived_at')
            ->get([
                'id',
                'brand',
                'model',
                'year',
                'vin',
                'plate',
                'color',
                'cover_photo',
                'created_at',
                'archived_at',
            ]);

        $previousCars = CarOwnership::query()
            ->where('user_id', $user->id)
            ->whereNotNull('owned_until')
            ->with([
                'car' => fn ($query) => $query->withTrashed()->with([
                    'entries' => fn ($q) => $q->latest('date')->limit(1),
                ]),
            ])
            ->orderByDesc('owned_until')
            ->get()
            ->filter(fn (CarOwnership $ownership) => $ownership->car && $ownership->car->user_id !== $user->id)
            ->map(fn (CarOwnership $ownership) => [
                'car' => $ownership->car,
                'owned_from' => $ownership->owned_from->format('d.m.Y'),
                'owned_until' => $ownership->owned_until->format('d.m.Y'),
            ])
            ->values();

        return Inertia::render('garage/index', [
            'cars' => $cars,
            'archivedCars' => $archivedCars,
            'previousCars' => $previousCars,
        ]);
    }

    /**
     * Show the form for creating a new car.
     */
    public function create(): Response
    {
        return Inertia::render('garage/create');
    }

    /**
     * Show the form for editing the specified car.
     */
    public function edit(Car $car): Response
    {
        $this->authorize('update', $car);

        return Inertia::render('garage/edit', [
            'car' => [
                'id' => $car->id,
                'brand_id' => $car->car_brand_id,
                'brand_name' => $car->brand,
                'model_id' => $car->car_model_id,
                'model_name' => $car->model,
                'year' => (string) $car->year,
                'vin' => $car->vin ?? '',
                'plate' => $car->plate ?? '',
                'color' => $car->color ?? '',
                'cover_photo' => $car->cover_photo,
            ],
        ]);
    }

    /**
     * Display the specified car.
     */
    public function show(Car $car): Response
    {
        $this->authorize('view', $car);

        $car->load([
            'entries.photos',
            'ownerships.user',
            'pendingTransfer',
        ]);

        $car->setRelation(
            'entries',
            $car->entries()
                ->with('photos')
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->get()
        );

        $isCurrentOwner = $car->user_id === auth()->id();

        /** @var CarOwnership|null $myOwnership */
        $myOwnership = $car->ownerships->firstWhere('user_id', auth()->id());

        return Inertia::render('garage/show', [
            'car' => $car,
            'entries' => $car->entries,
            'ownerships' => $car->ownerships,
            'isCurrentOwner' => $isCurrentOwner,
            'myOwnership' => $myOwnership,
            'pendingTransfer' => $car->pendingTransfer,
        ]);
    }

    /**
     * Store a newly created car in storage.
     */
    public function store(StoreCarRequest $request): RedirectResponse
    {
        $this->authorize('create', Car::class);

        $validated = $request->validated();

        $car = DB::transaction(function () use ($validated, $request): Car {
            $car = Car::create([
                'user_id' => $request->user()->id,
                'car_brand_id' => $validated['brand_id'] ?? null,
                'car_model_id' => $validated['model_id'] ?? null,
                'brand' => $validated['brand_name'],
                'model' => $validated['model_name'],
                'year' => $validated['year'],
                'vin' => $validated['vin'] ?? null,
                'plate' => $validated['plate'] ?? null,
                'color' => $validated['color'] ?? null,
            ]);

            CarOwnership::create([
                'car_id' => $car->id,
                'user_id' => $request->user()->id,
                'owned_from' => now(),
                'owned_until' => null,
            ]);

            return $car;
        });

        if ($request->hasFile('cover_photo')) {
            $path = Storage::disk('public')->putFile('cars', $request->file('cover_photo'));
            $car->update(['cover_photo' => $path]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Машина добавлена.',
        ]);

        return to_route('garage.index');
    }

    /**
     * Update the specified car in storage.
     */
    public function update(UpdateCarRequest $request, Car $car): RedirectResponse
    {
        $this->authorize('update', $car);

        $validated = $request->validated();

        $car->update([
            'car_brand_id' => $validated['brand_id'] ?? null,
            'car_model_id' => $validated['model_id'] ?? null,
            'brand' => $validated['brand_name'],
            'model' => $validated['model_name'],
            'year' => $validated['year'],
            'vin' => $validated['vin'] ?? null,
            'plate' => $validated['plate'] ?? null,
            'color' => $validated['color'] ?? null,
        ]);

        if ($request->hasFile('cover_photo')) {
            if ($car->cover_photo) {
                Storage::disk('public')->delete($car->cover_photo);
            }

            $path = Storage::disk('public')->putFile('cars', $request->file('cover_photo'));
            $car->update(['cover_photo' => $path]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Данные автомобиля обновлены.',
        ]);

        return to_route('garage.show', $car);
    }

    /**
     * Update only the car cover photo.
     */
    public function updateCover(Request $request, Car $car): RedirectResponse
    {
        $this->authorize('update', $car);

        $request->validate([
            'cover_photo' => ['required', 'image', 'max:5120'],
        ]);

        if ($car->cover_photo) {
            Storage::disk('public')->delete($car->cover_photo);
        }

        $path = Storage::disk('public')->putFile('cars', $request->file('cover_photo'));
        $car->update(['cover_photo' => $path]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Фото обновлено.',
        ]);

        return back();
    }

    /**
     * Soft-delete the car and mark it archived.
     */
    public function archive(Car $car): RedirectResponse
    {
        $this->authorize('update', $car);

        abort_unless($car->user_id === auth()->id(), 403);

        if ($car->pendingTransfer !== null) {
            abort(403, 'Нельзя отправить в архив: ожидается передача автомобиля.');
        }

        $car->update([
            'is_archived' => true,
            'archived_at' => now(),
        ]);

        $car->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Автомобиль перемещён в архив',
        ]);

        return to_route('garage.index');
    }

    /**
     * Restore an archived car to the garage.
     */
    public function unarchive(Car $car): RedirectResponse
    {
        $this->authorize('restore', $car);

        abort_unless($car->user_id === auth()->id(), 403);

        $car->restore();

        $car->update([
            'is_archived' => false,
            'archived_at' => null,
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Автомобиль восстановлен из архива',
        ]);

        return to_route('garage.index');
    }

    /**
     * Permanently delete the car and its media.
     */
    public function destroyPermanent(Car $car): RedirectResponse
    {
        $this->authorize('forceDelete', $car);

        abort_unless($car->user_id === auth()->id(), 403);

        $car->load(['entries.photos']);

        foreach ($car->entries as $entry) {
            foreach ($entry->photos as $photo) {
                if ($photo->path) {
                    Storage::disk('public')->delete($photo->path);
                }
            }
        }

        if ($car->cover_photo) {
            Storage::disk('public')->delete($car->cover_photo);
        }

        $car->forceDelete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Автомобиль удалён',
        ]);

        return to_route('garage.index');
    }
}
