<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Http\Resources\CarResource;
use App\Http\Resources\EntryResource;
use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\Entry;
use App\Models\User;
use App\Services\Images\ImageUploadNormalizer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class GarageController extends Controller
{
    public function __construct(
        private readonly ImageUploadNormalizer $imageUploadNormalizer,
    ) {
    }

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
            ->with(['generation'])
            ->latest()
            ->get([
                'id',
                'brand',
                'model',
                'car_generation_id',
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
            ->with(['generation'])
            ->latest('archived_at')
            ->get([
                'id',
                'brand',
                'model',
                'car_generation_id',
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
                    'generation',
                ]),
            ])
            ->orderByDesc('owned_until')
            ->get()
            ->filter(fn (CarOwnership $ownership) => $ownership->car && $ownership->car->user_id !== $user->id)
            ->map(fn (CarOwnership $ownership) => [
                'car' => (new CarResource($ownership->car))->resolve(),
                'owned_from' => $ownership->owned_from->format('d.m.Y'),
                'owned_until' => $ownership->owned_until->format('d.m.Y'),
            ])
            ->values();

        return Inertia::render('garage/index', [
            'cars' => $cars->map(fn (Car $car) => (new CarResource($car))->resolve())->values()->all(),
            'archivedCars' => $archivedCars->map(fn (Car $car) => (new CarResource($car))->resolve())->values()->all(),
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

        $car->load(['generation']);

        return Inertia::render('garage/edit', [
            'car' => [
                'id' => $car->id,
                'brand_id' => $car->car_brand_id,
                'brand_name' => $car->brand,
                'model_id' => $car->car_model_id,
                'model_name' => $car->model,
                'car_generation_id' => $car->car_generation_id,
                'generation' => $car->generation
                    ? [
                        'id' => $car->generation->id,
                        'name' => $car->generation->name,
                        'gen' => $car->generation->gen,
                        'start_year' => $car->generation->start_year,
                        'end_year' => $car->generation->end_year,
                        'period' => $car->generation->period,
                        'label' => $car->generation->name.' ('.$car->generation->period.')',
                    ]
                    : null,
                'year' => (string) $car->year,
                'vin' => $car->vin ?? '',
                'plate' => $car->plate ?? '',
                'color' => $car->color?->value ?? '',
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
            'generation',
        ]);

        $car->setRelation(
            'entries',
            $car->entries()
                ->with('photos')
                ->orderByDesc('date')
                ->orderByDesc('id')
                ->get()
        );

        $isCurrentOwner = $car->user_id === Auth::id();

        /** @var CarOwnership|null $myOwnership */
        $myOwnership = $car->ownerships->firstWhere('user_id', Auth::id());

        return Inertia::render('garage/show', [
            'car' => (new CarResource($car))->resolve(),
            'entries' => $car->entries->map(fn (Entry $entry) => (new EntryResource($entry))->resolve())->values()->all(),
            'ownerships' => $car->ownerships,
            'isCurrentOwner' => $isCurrentOwner,
            'myOwnership' => $myOwnership,
            'pendingTransfer' => $car->pendingTransfer
                ? [
                    'id' => $car->pendingTransfer->id,
                    'status' => $car->pendingTransfer->status->value,
                ]
                : null,
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
                'car_generation_id' => $validated['car_generation_id'] ?? null,
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
            try {
                $normalized = $this->imageUploadNormalizer->normalize($request->file('cover_photo'));
            } catch (\Throwable $e) {
                throw ValidationException::withMessages([
                    'cover_photo' => 'Не удалось обработать изображение. Попробуйте выбрать другое фото.',
                ]);
            }

            $path = Storage::disk('public')->putFile('cars', $normalized);
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
            'car_generation_id' => $validated['car_generation_id'] ?? null,
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

            try {
                $normalized = $this->imageUploadNormalizer->normalize($request->file('cover_photo'));
            } catch (\Throwable $e) {
                throw ValidationException::withMessages([
                    'cover_photo' => 'Не удалось обработать изображение. Попробуйте выбрать другое фото.',
                ]);
            }

            $path = Storage::disk('public')->putFile('cars', $normalized);
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
            'cover_photo' => [
                'required',
                'file',
                'max:5120',
                'mimetypes:image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,image/heic-sequence,image/heif-sequence',
            ],
        ]);

        if ($car->cover_photo) {
            Storage::disk('public')->delete($car->cover_photo);
        }

        try {
            $normalized = $this->imageUploadNormalizer->normalize($request->file('cover_photo'));
        } catch (\Throwable $e) {
            throw ValidationException::withMessages([
                'cover_photo' => 'Не удалось обработать изображение. Попробуйте выбрать другое фото.',
            ]);
        }

        $path = Storage::disk('public')->putFile('cars', $normalized);
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

        abort_unless($car->user_id === Auth::id(), 403);

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

        abort_unless($car->user_id === Auth::id(), 403);

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

        abort_unless($car->user_id === Auth::id(), 403);

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
