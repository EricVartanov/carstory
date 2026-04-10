<?php

use App\Models\CarBrand;
use App\Models\CarModel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\Fluent\AssertableJson;

uses(RefreshDatabase::class);

it('returns brands for autocomplete without auth', function () {
    CarBrand::create(['name' => 'Toyota']);
    CarBrand::create(['name' => 'Volkswagen']);
    CarBrand::create(['name' => 'BMW']);

    $this->getJson('/api/car-catalog/brands?search=To')
        ->assertSuccessful()
        ->assertJson(fn (AssertableJson $json) => $json
            ->whereType('0.id', 'integer')
            ->where('0.name', 'Toyota')
            ->etc()
        );
});

it('returns models scoped to brand without auth', function () {
    $toyota = CarBrand::create(['name' => 'Toyota']);
    $vw = CarBrand::create(['name' => 'Volkswagen']);

    CarModel::create(['car_brand_id' => $toyota->id, 'name' => 'Camry']);
    CarModel::create(['car_brand_id' => $toyota->id, 'name' => 'Corolla']);
    CarModel::create(['car_brand_id' => $vw->id, 'name' => 'Golf']);

    $this->getJson('/api/car-catalog/models?brand_id='.$toyota->id.'&search=Ca')
        ->assertSuccessful()
        ->assertJson(fn (AssertableJson $json) => $json
            ->where('0.name', 'Camry')
            ->etc()
        );
});
