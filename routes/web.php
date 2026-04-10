<?php

use App\Http\Controllers\Api\CarCatalogController;
use App\Http\Controllers\GarageController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::prefix('api')->group(function () {
    Route::get('car-catalog/brands', [CarCatalogController::class, 'brands'])->name('car-catalog.brands');
    Route::get('car-catalog/models', [CarCatalogController::class, 'models'])->name('car-catalog.models');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('garage', [GarageController::class, 'index'])->name('garage.index');
    Route::get('garage/create', [GarageController::class, 'create'])->name('garage.create');
    Route::post('garage', [GarageController::class, 'store'])->name('garage.store');
});

require __DIR__.'/settings.php';
