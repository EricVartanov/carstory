<?php

use App\Http\Controllers\Api\CarCatalogController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\CarTransferController;
use App\Http\Controllers\EntryController;
use App\Http\Controllers\GarageController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [WelcomeController::class, 'index'])->name('welcome');

Route::prefix('api')->group(function () {
    Route::get('car-catalog/brands', [CarCatalogController::class, 'brands'])->name('car-catalog.brands');
    Route::get('car-catalog/models', [CarCatalogController::class, 'models'])->name('car-catalog.models');
    Route::get('car-catalog/generations', [CarCatalogController::class, 'generations'])->name('car-catalog.generations');
    Route::post('car-catalog/suggest', [CarCatalogController::class, 'suggest'])->name('car-catalog.suggest');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('api')->group(function () {
        Route::post('upload/temp', [UploadController::class, 'temp'])->name('upload.temp');
        Route::delete('upload/temp', [UploadController::class, 'deleteTemp'])->name('upload.delete-temp');
    });

    Route::get('garage', [GarageController::class, 'index'])->name('garage.index');
    Route::get('garage/create', [GarageController::class, 'create'])->name('garage.create');
    Route::post('garage', [GarageController::class, 'store'])->name('garage.store');
    Route::get('garage/{car}/edit', [GarageController::class, 'edit'])
        ->name('garage.edit')
        ->withTrashed();
    Route::patch('garage/{car}', [GarageController::class, 'update'])
        ->name('garage.update')
        ->withTrashed();
    Route::post('garage/{car}/cover', [GarageController::class, 'updateCover'])
        ->name('garage.update-cover')
        ->withTrashed();
    Route::post('garage/{car}/archive', [GarageController::class, 'archive'])
        ->name('garage.archive')
        ->withTrashed();
    Route::post('garage/{car}/unarchive', [GarageController::class, 'unarchive'])
        ->name('garage.unarchive')
        ->withTrashed();
    Route::delete('garage/{car}/permanent', [GarageController::class, 'destroyPermanent'])
        ->name('garage.destroy-permanent')
        ->withTrashed();
    Route::get('garage/{car}', [GarageController::class, 'show'])
        ->name('garage.show')
        ->withTrashed();

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
