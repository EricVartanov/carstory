<?php

use App\Enums\CarColor;
use App\Models\Car;
use App\Models\CarBrand;
use App\Models\CarModel;
use App\Models\CarOwnership;
use App\Models\CarTransfer;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

test('owner can view garage edit page', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('garage.edit', $car))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('garage/edit')
            ->has('car'));
});

test('non owner cannot view garage edit page', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($stranger)
        ->get(route('garage.edit', $car))
        ->assertForbidden();
});

test('owner can store a car with catalog ids and color', function () {
    $user = User::factory()->create();
    $brand = CarBrand::query()->create(['name' => 'BrandX']);
    $model = CarModel::query()->create([
        'car_brand_id' => $brand->id,
        'name' => 'ModelY',
    ]);

    $this->actingAs($user)
        ->post(route('garage.store'), [
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'model_id' => $model->id,
            'model_name' => $model->name,
            'year' => 2020,
            'vin' => null,
            'plate' => null,
            'color' => 'blue',
        ])
        ->assertRedirect(route('garage.index'));

    $car = Car::query()->where('user_id', $user->id)->firstOrFail();
    expect($car->car_brand_id)->toBe($brand->id)
        ->and($car->car_model_id)->toBe($model->id)
        ->and($car->color)->toBe(CarColor::Blue);
});

test('owner can update a car and vin unique ignores same car', function () {
    $user = User::factory()->create();
    $brand = CarBrand::query()->create(['name' => 'B']);
    $model = CarModel::query()->create(['car_brand_id' => $brand->id, 'name' => 'M']);
    $car = Car::factory()->create([
        'user_id' => $user->id,
        'vin' => '1HGBH41JXMN109186',
        'car_brand_id' => $brand->id,
        'car_model_id' => $model->id,
        'brand' => $brand->name,
        'model' => $model->name,
        'color' => 'red',
    ]);

    $this->actingAs($user)
        ->patch(route('garage.update', $car), [
            'brand_id' => $brand->id,
            'brand_name' => $brand->name,
            'model_id' => $model->id,
            'model_name' => $model->name,
            'year' => 2019,
            'vin' => '1HGBH41JXMN109186',
            'plate' => 'A123BC77',
            'color' => 'silver',
        ])
        ->assertRedirect(route('garage.show', $car));

    $car->refresh();
    expect($car->year)->toBe(2019)
        ->and($car->plate)->toBe('A123BC77')
        ->and($car->color)->toBe(CarColor::Silver);
});

test('store rejects invalid car color id', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('garage.store'), [
            'brand_id' => null,
            'brand_name' => 'Custom',
            'model_id' => null,
            'model_name' => 'Custom',
            'year' => 2020,
            'vin' => null,
            'plate' => null,
            'color' => 'not-a-valid-color',
        ])
        ->assertSessionHasErrors('color');
});

test('garage index includes archived cars list', function () {
    $user = User::factory()->create();
    $active = Car::factory()->create(['user_id' => $user->id]);
    $archived = Car::factory()->create(['user_id' => $user->id]);
    $archived->update([
        'is_archived' => true,
        'archived_at' => now(),
    ]);
    $archived->delete();

    $this->actingAs($user)
        ->get(route('garage.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('garage/index')
            ->has('cars', 1)
            ->where('cars.0.id', $active->id)
            ->has('archivedCars', 1)
            ->where('archivedCars.0.id', $archived->id));
});

test('owner can archive car without pending transfer', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->post(route('garage.archive', $car))
        ->assertRedirect(route('garage.index'));

    $car->refresh();
    expect($car->trashed())->toBeTrue()
        ->and($car->is_archived)->toBeTrue()
        ->and($car->archived_at)->not->toBeNull();
});

test('owner cannot archive car with pending transfer', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $user->id]);
    CarTransfer::factory()->create([
        'car_id' => $car->id,
        'from_user_id' => $user->id,
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->post(route('garage.archive', $car))
        ->assertForbidden();

    expect($car->refresh()->trashed())->toBeFalse();
});

test('owner can unarchive car', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $user->id]);
    $car->update([
        'is_archived' => true,
        'archived_at' => now(),
    ]);
    $car->delete();

    $this->actingAs($user)
        ->post(route('garage.unarchive', $car))
        ->assertRedirect(route('garage.index'));

    $car->refresh();
    expect($car->trashed())->toBeFalse()
        ->and($car->is_archived)->toBeFalse()
        ->and($car->archived_at)->toBeNull();
});

test('owner can permanently delete archived car', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $user->id]);
    $car->update([
        'is_archived' => true,
        'archived_at' => now(),
    ]);
    $car->delete();

    $this->actingAs($user)
        ->delete(route('garage.destroy-permanent', $car))
        ->assertRedirect(route('garage.index'));

    expect(Car::withTrashed()->whereKey($car->id)->exists())->toBeFalse();
});

test('owner can view soft deleted car in garage show', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $user->id]);
    $car->update([
        'is_archived' => true,
        'archived_at' => now(),
    ]);
    $car->delete();

    $this->actingAs($user)
        ->get(route('garage.show', $car))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('garage/show')
            ->where('car.id', $car->id));
});

test('owner can update car cover photo via dedicated endpoint', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $user->id]);

    $oldFile = UploadedFile::fake()->image('old.jpg', 10, 10);
    $oldPath = Storage::disk('public')->putFile('cars', $oldFile);
    $car->update(['cover_photo' => $oldPath]);

    $newFile = UploadedFile::fake()->image('new.jpg', 10, 10);

    $this->actingAs($user)
        ->from(route('garage.show', $car))
        ->post(route('garage.update-cover', $car), [
            'cover_photo' => $newFile,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('garage.show', $car));

    $car->refresh();

    expect($car->cover_photo)->not->toBe($oldPath)
        ->and(Storage::disk('public')->exists($oldPath))->toBeFalse()
        ->and(Storage::disk('public')->exists((string) $car->cover_photo))->toBeTrue();
});

test('guest cannot update car cover photo', function () {
    Storage::fake('public');
    $car = Car::factory()->create();
    $file = UploadedFile::fake()->image('x.jpg', 10, 10);

    $this->post(route('garage.update-cover', $car), [
        'cover_photo' => $file,
    ])->assertRedirect(route('login'));
});

test('non owner cannot update car cover photo', function () {
    Storage::fake('public');
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);
    $file = UploadedFile::fake()->image('x.jpg', 10, 10);

    $this->actingAs($stranger)
        ->post(route('garage.update-cover', $car), [
            'cover_photo' => $file,
        ])
        ->assertForbidden();
});
