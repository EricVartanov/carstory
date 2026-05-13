<?php

use App\Models\CarBrand;
use App\Models\CarGeneration;
use App\Models\CarModel;
use Illuminate\Testing\Fluent\AssertableJson;

it('returns all brands ordered by name without auth', function () {
    CarBrand::query()->create(['name' => 'Toyota']);
    CarBrand::query()->create(['name' => 'Volkswagen']);
    CarBrand::query()->create(['name' => 'BMW']);

    $this->getJson('/api/car-catalog/brands')
        ->assertSuccessful()
        ->assertJson(fn (AssertableJson $json) => $json
            ->whereType('0.id', 'integer')
            ->where('0.name', 'BMW')
            ->where('1.name', 'Toyota')
            ->where('2.name', 'Volkswagen')
            ->etc()
        );
});

it('returns all models for brand ordered by name without auth', function () {
    $toyota = CarBrand::query()->create(['name' => 'Toyota']);
    $vw = CarBrand::query()->create(['name' => 'Volkswagen']);

    CarModel::query()->create(['car_brand_id' => $toyota->id, 'name' => 'Camry']);
    CarModel::query()->create(['car_brand_id' => $toyota->id, 'name' => 'Corolla']);
    CarModel::query()->create(['car_brand_id' => $vw->id, 'name' => 'Golf']);

    $response = $this->getJson(
        '/api/car-catalog/models?brand_id='.$toyota->id,
    );

    $response->assertSuccessful();
    $names = collect($response->json())->pluck('name')->all();
    expect($names)->toBe(['Camry', 'Corolla']);
});

it('returns all generations for model ordered by start year without auth', function () {
    $brand = CarBrand::query()->create(['name' => 'Toyota']);
    $model = CarModel::query()->create(['car_brand_id' => $brand->id, 'name' => 'Camry']);

    CarGeneration::query()->create([
        'car_model_id' => $model->id,
        'name' => 'Camry V',
        'gen' => '5',
        'start_year' => 2001,
        'end_year' => 2006,
    ]);

    CarGeneration::query()->create([
        'car_model_id' => $model->id,
        'name' => 'Camry VII',
        'gen' => '7',
        'start_year' => 2017,
        'end_year' => null,
    ]);

    $this->getJson('/api/car-catalog/generations?model_id='.$model->id)
        ->assertSuccessful()
        ->assertJson(fn (AssertableJson $json) => $json
            ->where('0.name', 'Camry V')
            ->where('0.period', '2001–2006')
            ->where('1.name', 'Camry VII')
            ->where('1.period', '2017–н.в.')
            ->etc()
        );
});

it('requires model id for generations endpoint', function () {
    $this->getJson('/api/car-catalog/generations')->assertUnprocessable();
});
