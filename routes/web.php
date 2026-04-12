<?php

use App\Http\Controllers\Api\CarCatalogController;
use App\Http\Controllers\CarTransferController;
use App\Http\Controllers\EntryController;
use App\Http\Controllers\GarageController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

Route::prefix('api')->group(function () {
    Route::get('car-catalog/brands', [CarCatalogController::class, 'brands'])->name('car-catalog.brands');
    Route::get('car-catalog/models', [CarCatalogController::class, 'models'])->name('car-catalog.models');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('garage', [GarageController::class, 'index'])->name('garage.index');
    Route::get('garage/create', [GarageController::class, 'create'])->name('garage.create');
    Route::get('garage/{car}', [GarageController::class, 'show'])->name('garage.show');
    Route::post('garage', [GarageController::class, 'store'])->name('garage.store');

    Route::scopeBindings()->group(function () {
        Route::post('garage/{car}/entries', [EntryController::class, 'store'])->name('entries.store');
        Route::patch('garage/{car}/entries/{entry}', [EntryController::class, 'update'])->name('entries.update');
        Route::delete('garage/{car}/entries/{entry}', [EntryController::class, 'destroy'])->name('entries.destroy');

        Route::get('garage/{car}/transfer', [CarTransferController::class, 'create'])->name('transfer.create');
        Route::post('garage/{car}/transfer/email', [CarTransferController::class, 'sendEmail'])->name('transfer.send-email');
        Route::post('garage/{car}/transfer/regenerate', [CarTransferController::class, 'regenerate'])->name('transfer.regenerate');
        Route::delete('garage/{car}/transfer', [CarTransferController::class, 'cancel'])->name('transfer.cancel');
    });

    Route::get('transfer/{token}', [CarTransferController::class, 'accept'])
        ->where('token', '[A-Za-z0-9]{64}')
        ->name('transfer.accept');
    Route::post('transfer/{token}', [CarTransferController::class, 'confirm'])
        ->where('token', '[A-Za-z0-9]{64}')
        ->name('transfer.confirm');
});

require __DIR__.'/settings.php';
