<?php

use App\Models\CarBrand;
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
