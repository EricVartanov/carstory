<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests see the welcome landing page with stats', function () {
    $this->get(route('welcome'))
        ->assertOk()
        ->assertSee('/images/carstory-mark.png', false)
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('stats', fn (Assert $stats) => $stats
                ->where('cars', 0)
                ->where('entries', 0)
                ->where('transfers', 0))
            ->has('canRegister')
            ->has('siteUrl'));
});

test('authenticated users are redirected from welcome to garage', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('welcome'))
        ->assertRedirect(route('garage.index'));
});
