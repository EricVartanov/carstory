<?php

use App\Models\CarBrand;
use App\Models\CarCatalogSuggestion;
use App\Models\CarModel;

test('car catalog suggest stores brand proposal without authentication', function () {
    $this->postJson(route('car-catalog.suggest'), [
        'type' => 'brand',
        'name' => 'Новаямарка',
        'brand_id' => null,
    ])
        ->assertOk()
        ->assertJson(['message' => 'ok']);

    expect(CarCatalogSuggestion::query()->where('type', 'brand')->count())->toBe(1);
});

test('car catalog suggest requires brand id for model type', function () {
    $this->postJson(route('car-catalog.suggest'), [
        'type' => 'model',
        'name' => 'Новаямодель',
    ])->assertUnprocessable();
});

test('car catalog suggest stores model proposal with brand id', function () {
    $brand = CarBrand::query()->create(['name' => 'TestBrand']);

    $this->postJson(route('car-catalog.suggest'), [
        'type' => 'model',
        'name' => 'Новаямодель',
        'brand_id' => $brand->id,
    ])
        ->assertOk()
        ->assertJson(['message' => 'ok']);

    $row = CarCatalogSuggestion::query()->where('type', 'model')->firstOrFail();
    expect($row->car_brand_id)->toBe($brand->id);
});

test('car catalog brands returns all brands sorted by name', function () {
    CarBrand::query()->create(['name' => 'Zebra']);
    CarBrand::query()->create(['name' => 'Apple']);

    $response = $this->getJson(route('car-catalog.brands'));
    $response->assertOk();

    $names = collect($response->json())->pluck('name')->all();
    expect($names[0])->toBe('Apple');
    expect($names[1])->toBe('Zebra');
});

test('car catalog models returns all models for brand', function () {
    $brand = CarBrand::query()->create(['name' => 'B']);
    CarModel::query()->create(['car_brand_id' => $brand->id, 'name' => 'M1']);
    CarModel::query()->create(['car_brand_id' => $brand->id, 'name' => 'M2']);
    CarModel::query()->create(['car_brand_id' => $brand->id, 'name' => 'M3']);

    $response = $this->getJson(route('car-catalog.models', ['brand_id' => $brand->id]));
    $response->assertOk();
    expect($response->json())->toHaveCount(3);
});
