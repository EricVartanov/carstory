<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCarRequest;
use App\Models\Car;
use App\Models\CarOwnership;
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
        $cars = Car::query()
            ->where('user_id', auth()->id())
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

        return Inertia::render('garage/index', [
            'cars' => $cars,
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
     * Store a newly created car in storage.
     */
    public function store(StoreCarRequest $request): RedirectResponse
    {
        $this->authorize('create', Car::class);

        $validated = $request->validated();

        DB::transaction(function () use ($validated, $request): void {
            $car = Car::create([
                'user_id' => $request->user()->id,
                'car_brand_id' => $validated['car_brand_id'] ?? null,
                'car_model_id' => $validated['car_model_id'] ?? null,
                'brand' => $validated['brand'],
                'model' => $validated['model'],
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
            'message' => __('Car added.'),
        ]);

        return to_route('garage.index');
    }
}
