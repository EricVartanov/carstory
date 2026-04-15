<?php

use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\Entry;
use App\Models\User;
use App\Services\Images\ImageTranscoder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('profile page includes user statistics', function () {
    $user = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $user->id]);
    Car::factory()->create(['user_id' => $user->id]);

    Entry::query()->create([
        'car_id' => $car->id,
        'user_id' => $user->id,
        'date' => now()->toDateString(),
        'mileage' => 10_000,
        'type' => 'note',
        'title' => 'Тест',
        'body' => null,
        'amount' => null,
        'currency' => 'RUB',
        'location' => null,
    ]);

    CarOwnership::query()->create([
        'car_id' => $car->id,
        'user_id' => $user->id,
        'owned_from' => now()->subYear(),
        'owned_until' => now()->subMonth(),
    ]);

    $this
        ->actingAs($user)
        ->get(route('profile.edit'))
        ->assertInertia(fn ($page) => $page
            ->component('settings/profile')
            ->where('stats.total_cars', 2)
            ->where('stats.total_entries', 1)
            ->where('stats.previous_cars', 1));
});

test('profile information can be updated', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test User');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();
});

test('profile avatar can be uploaded and stored on public disk', function () {
    Storage::fake('public');

    $user = User::factory()->create();

    $file = UploadedFile::fake()->image('avatar.jpg', 100, 100);

    $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->post(route('profile.avatar'), [
            'avatar' => $file,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->avatar)->not->toBeNull()
        ->and(Storage::disk('public')->exists($user->avatar))->toBeTrue();
});

test('profile avatar endpoint rejects HEIC (use temp upload instead)', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('avatar.heic', 200, 'image/heic');

    $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->post(route('profile.avatar'), [
            'avatar' => $file,
        ])
        ->assertSessionHasErrors('avatar')
        ->assertRedirect(route('profile.edit'));
});

test('profile avatar accepts HEIC and stores transcoded jpeg', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('avatar.heic', 200, 'image/heic');

    app()->bind(ImageTranscoder::class, fn () => new class implements ImageTranscoder
    {
        public function toJpeg(UploadedFile $file, int $quality = 85): UploadedFile
        {
            return UploadedFile::fake()->image('converted.jpg', 100, 100);
        }
    });

    $this
        ->actingAs($user)
        ->post(route('upload.temp'), [
            'file' => $file,
        ], [
            'Accept' => 'application/json',
        ])
        ->assertOk()
        ->assertJsonStructure(['temp_path', 'url']);
});

test('email verification status is unchanged when the email address is unchanged', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'name' => 'Test User',
            'email' => $user->email,
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    expect($user->refresh()->email_verified_at)->not->toBeNull();
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('welcome'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});

test('correct password must be provided to delete account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->from(route('profile.edit'))
        ->delete(route('profile.destroy'), [
            'password' => 'wrong-password',
        ]);

    $response
        ->assertSessionHasErrors('password')
        ->assertRedirect(route('profile.edit'));

    expect($user->fresh())->not->toBeNull();
});
