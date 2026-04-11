<?php

use App\Mail\TransferInvitation;
use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\CarTransfer;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

test('owner can open transfer page and pending transfer is created', function () {
    $owner = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);
    CarOwnership::factory()->create([
        'car_id' => $car->id,
        'user_id' => $owner->id,
        'owned_from' => now()->subMonth(),
        'owned_until' => null,
    ]);

    $this->actingAs($owner);

    $response = $this->get(route('transfer.create', $car));

    $response->assertOk();
    $response->assertInertia(fn (Assert $page) => $page
        ->component('transfer/show')
        ->has('transfer')
        ->has('transferUrl'));

    expect(CarTransfer::query()->where('car_id', $car->id)->where('status', 'pending')->count())->toBe(1);
});

test('second visit to transfer create reuses same pending transfer', function () {
    $owner = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($owner);

    $this->get(route('transfer.create', $car));
    $token1 = CarTransfer::query()->where('car_id', $car->id)->where('status', 'pending')->value('token');

    $this->get(route('transfer.create', $car));
    $token2 = CarTransfer::query()->where('car_id', $car->id)->where('status', 'pending')->value('token');

    expect($token1)->toBe($token2);
});

test('non owner cannot open transfer create', function () {
    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($stranger);

    $this->get(route('transfer.create', $car))->assertForbidden();
});

test('accept with invalid token redirects to garage', function () {
    $user = User::factory()->create();
    $token = str_repeat('x', 64);

    $this->actingAs($user);

    $this->get(route('transfer.accept', ['token' => $token]))
        ->assertRedirect(route('garage.index'));
});

test('accept with expired token cancels transfer and redirects', function () {
    $owner = User::factory()->create();
    $buyer = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);
    $transfer = CarTransfer::factory()
        ->for($car)
        ->for($owner, 'fromUser')
        ->expired()
        ->create();

    $this->actingAs($buyer);

    $this->get(route('transfer.accept', ['token' => $transfer->token]))
        ->assertRedirect(route('garage.index'));

    expect($transfer->refresh()->status)->toBe('cancelled');
});

test('owner cannot accept their own transfer link', function () {
    $owner = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);
    $transfer = CarTransfer::factory()
        ->for($car)
        ->for($owner, 'fromUser')
        ->create();

    $this->actingAs($owner);

    $this->get(route('transfer.accept', ['token' => $transfer->token]))
        ->assertRedirect(route('garage.index'));
});

test('buyer can view accept page for valid pending transfer', function () {
    $owner = User::factory()->create();
    $buyer = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);
    $transfer = CarTransfer::factory()
        ->for($car)
        ->for($owner, 'fromUser')
        ->create();

    $this->actingAs($buyer);

    $this->get(route('transfer.accept', ['token' => $transfer->token]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('transfer/accept')
            ->where('token', $transfer->token));
});

test('confirm transfers car ownership and marks transfer accepted', function () {
    $owner = User::factory()->create();
    $buyer = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);
    CarOwnership::factory()->create([
        'car_id' => $car->id,
        'user_id' => $owner->id,
        'owned_from' => now()->subMonths(2),
        'owned_until' => null,
    ]);

    $transfer = CarTransfer::factory()
        ->for($car)
        ->for($owner, 'fromUser')
        ->create();

    $this->actingAs($buyer);

    $this->post(route('transfer.confirm', ['token' => $transfer->token]))
        ->assertRedirect(route('garage.show', $car));

    $car->refresh();
    expect($car->user_id)->toBe($buyer->id);

    $transfer->refresh();
    expect($transfer->status)->toBe('accepted');
    expect($transfer->to_user_id)->toBe($buyer->id);

    $openOwnership = CarOwnership::query()
        ->where('car_id', $car->id)
        ->whereNull('owned_until')
        ->firstOrFail();
    expect($openOwnership->user_id)->toBe($buyer->id);

    $previousOwnership = CarOwnership::query()
        ->where('car_id', $car->id)
        ->where('user_id', $owner->id)
        ->whereNotNull('owned_until')
        ->first();
    expect($previousOwnership)->not->toBeNull();
});

test('owner can cancel pending transfer', function () {
    $owner = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);
    CarTransfer::factory()
        ->for($car)
        ->for($owner, 'fromUser')
        ->create();

    $this->actingAs($owner);

    $this->delete(route('transfer.cancel', $car))
        ->assertRedirect(route('garage.show', $car));

    expect(CarTransfer::query()->where('car_id', $car->id)->where('status', 'cancelled')->count())->toBe(1);
});

test('regenerate replaces pending transfer with a new one', function () {
    $owner = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);
    $old = CarTransfer::factory()
        ->for($car)
        ->for($owner, 'fromUser')
        ->create();
    $oldToken = $old->token;

    $this->actingAs($owner);

    $this->post(route('transfer.regenerate', $car))
        ->assertRedirect(route('transfer.create', $car));

    expect($old->refresh()->status)->toBe('cancelled');

    $this->get(route('transfer.create', $car))->assertOk();

    $new = CarTransfer::query()->where('car_id', $car->id)->where('status', 'pending')->firstOrFail();
    expect($new->token)->not->toBe($oldToken);
});

test('send email queues transfer invitation', function () {
    Mail::fake();

    $owner = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($owner);

    $this->post(route('transfer.send-email', $car), [
        'email' => 'recipient@example.com',
    ])->assertRedirect();

    Mail::assertQueued(TransferInvitation::class);
});

test('stranger cannot send transfer email', function () {
    Mail::fake();

    $owner = User::factory()->create();
    $stranger = User::factory()->create();
    $car = Car::factory()->create(['user_id' => $owner->id]);

    $this->actingAs($stranger);

    $this->post(route('transfer.send-email', $car), [
        'email' => 'any@example.com',
    ])->assertForbidden();

    Mail::assertNothingQueued();
});
