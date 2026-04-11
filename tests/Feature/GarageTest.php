<?php

use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('garage.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit their garage', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('garage.index'));
    $response->assertOk();
});

test('garage index lists sold cars for former owner', function () {
    $currentOwner = User::factory()->create();
    $formerOwner = User::factory()->create();

    $car = Car::factory()->create([
        'user_id' => $currentOwner->id,
    ]);

    CarOwnership::factory()->create([
        'car_id' => $car->id,
        'user_id' => $formerOwner->id,
        'owned_from' => now()->subMonths(3),
        'owned_until' => now()->subMonth(),
    ]);

    $this->actingAs($formerOwner);

    $this->get(route('garage.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('garage/index')
            ->has('previousCars', 1)
            ->where('previousCars.0.car.id', $car->id)
            ->has('previousCars.0.owned_from')
            ->has('previousCars.0.owned_until'));
});

test('garage index does not list sold cars when user still owns the car', function () {
    $owner = User::factory()->create();

    $car = Car::factory()->create([
        'user_id' => $owner->id,
    ]);

    CarOwnership::factory()->create([
        'car_id' => $car->id,
        'user_id' => $owner->id,
        'owned_from' => now()->subMonths(2),
        'owned_until' => now()->subMonth(),
    ]);

    $this->actingAs($owner);

    $this->get(route('garage.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('garage/index')
            ->has('previousCars', 0));
});

test('current owner can view car page', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create([
        'user_id' => $user->id,
    ]);

    $this->actingAs($user);

    $response = $this->get(route('garage.show', $car));
    $response->assertOk();
});

test('former owner can view car page', function () {
    $currentOwner = User::factory()->create();
    $formerOwner = User::factory()->create();

    $car = Car::factory()->create([
        'user_id' => $currentOwner->id,
    ]);

    CarOwnership::factory()->create([
        'car_id' => $car->id,
        'user_id' => $formerOwner->id,
        'owned_from' => now()->subMonths(3),
        'owned_until' => now()->subMonth(),
    ]);

    $this->actingAs($formerOwner);

    $response = $this->get(route('garage.show', $car));
    $response->assertOk();
});

test('unrelated user cannot view car page', function () {
    $currentOwner = User::factory()->create();
    $stranger = User::factory()->create();

    $car = Car::factory()->create([
        'user_id' => $currentOwner->id,
    ]);

    $this->actingAs($stranger);

    $response = $this->get(route('garage.show', $car));
    $response->assertForbidden();
});
