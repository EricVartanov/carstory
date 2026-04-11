<?php

use App\Models\Car;
use App\Models\Entry;
use App\Models\EntryPhoto;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('current owner can create an entry with photos', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $car = Car::factory()->create([
        'user_id' => $user->id,
    ]);

    $this->actingAs($user);

    $response = $this->post(route('entries.store', $car), [
        'date' => now()->toDateString(),
        'mileage' => 25_000,
        'type' => 'service',
        'title' => 'Замена масла',
        'body' => 'Поменял масло и фильтр.',
        'amount' => 3000,
        'currency' => 'RUB',
        'photos' => [
            UploadedFile::fake()->image('one.jpg'),
            UploadedFile::fake()->image('two.jpg'),
        ],
    ]);

    $response->assertRedirect(route('garage.show', $car));

    $entry = Entry::query()->where('car_id', $car->id)->firstOrFail();
    expect($entry->type)->toBe('service');

    $photos = EntryPhoto::query()->where('entry_id', $entry->id)->orderBy('order')->get();
    expect($photos)->toHaveCount(2);

    foreach ($photos as $photo) {
        Storage::disk('public')->assertExists($photo->path);
    }
});

test('non owner cannot create an entry', function () {
    Storage::fake('public');

    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    $car = Car::factory()->create([
        'user_id' => $owner->id,
    ]);

    $this->actingAs($otherUser);

    $response = $this->post(route('entries.store', $car), [
        'date' => now()->toDateString(),
        'type' => 'note',
    ]);

    $response->assertForbidden();
});

test('current owner can update an entry', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create([
        'user_id' => $user->id,
    ]);

    $entry = Entry::create([
        'car_id' => $car->id,
        'user_id' => $user->id,
        'date' => now()->subDay()->toDateString(),
        'type' => 'note',
        'title' => null,
        'body' => null,
        'currency' => 'RUB',
    ]);

    $this->actingAs($user);

    $response = $this->patch(route('entries.update', [$car, $entry]), [
        'date' => now()->toDateString(),
        'mileage' => 10_000,
        'type' => 'note',
        'title' => 'Обновил запись',
        'body' => 'Новый текст',
        'amount' => 0,
        'currency' => 'RUB',
    ]);

    $response->assertRedirect(route('garage.show', $car));

    $entry->refresh();
    expect($entry->title)->toBe('Обновил запись');
    expect($entry->mileage)->toBe(10_000);
});

test('current owner cannot update another users entry on their car', function () {
    $owner = User::factory()->create();
    $author = User::factory()->create();
    $car = Car::factory()->create([
        'user_id' => $owner->id,
    ]);

    $entry = Entry::create([
        'car_id' => $car->id,
        'user_id' => $author->id,
        'date' => now()->subDay()->toDateString(),
        'type' => 'note',
        'title' => 'Чужая запись',
        'body' => null,
        'currency' => 'RUB',
    ]);

    $this->actingAs($owner);

    $response = $this->patch(route('entries.update', [$car, $entry]), [
        'date' => now()->toDateString(),
        'type' => 'note',
        'title' => 'Пытаюсь изменить',
        'currency' => 'RUB',
    ]);

    $response->assertForbidden();
    expect($entry->refresh()->title)->toBe('Чужая запись');
});

test('current owner cannot delete another users entry on their car', function () {
    $owner = User::factory()->create();
    $author = User::factory()->create();
    $car = Car::factory()->create([
        'user_id' => $owner->id,
    ]);

    $entry = Entry::create([
        'car_id' => $car->id,
        'user_id' => $author->id,
        'date' => now()->toDateString(),
        'type' => 'note',
        'title' => null,
        'body' => null,
        'currency' => 'RUB',
    ]);

    $this->actingAs($owner);

    $this->delete(route('entries.destroy', [$car, $entry]))->assertForbidden();

    expect(Entry::query()->whereKey($entry->id)->exists())->toBeTrue();
});

test('current owner can delete an entry and its photos', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $car = Car::factory()->create([
        'user_id' => $user->id,
    ]);

    $entry = Entry::create([
        'car_id' => $car->id,
        'user_id' => $user->id,
        'date' => now()->toDateString(),
        'type' => 'note',
        'title' => null,
        'body' => null,
        'currency' => 'RUB',
    ]);

    $path = Storage::disk('public')->putFile("entries/{$entry->id}", UploadedFile::fake()->image('to-delete.jpg'));
    $photo = EntryPhoto::create([
        'entry_id' => $entry->id,
        'path' => $path,
        'original_name' => 'to-delete.jpg',
        'order' => 0,
    ]);

    Storage::disk('public')->assertExists($photo->path);

    $this->actingAs($user);

    $response = $this->delete(route('entries.destroy', [$car, $entry]));
    $response->assertRedirect(route('garage.show', $car));

    expect(Entry::query()->whereKey($entry->id)->exists())->toBeFalse();
    expect(EntryPhoto::query()->whereKey($photo->id)->exists())->toBeFalse();

    Storage::disk('public')->assertMissing($path);
});
