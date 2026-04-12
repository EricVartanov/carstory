<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarRequest;
use App\Http\Requests\UpdateCarRequest;
use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
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
            ->with([
                'entries' => fn ($query) => $query->latest('date')->limit(1),
            ])
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

        $previousCars = CarOwnership::query()
            ->where('user_id', $user->id)
            ->whereNotNull('owned_until')
            ->with([
                'car' => fn ($query) => $query->with([
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

        DB::transaction(function () use ($validated, $request): void {
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
        });

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

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => 'Данные автомобиля обновлены.',
        ]);

        return to_route('garage.show', $car);
    }
}
