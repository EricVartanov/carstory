<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\CarOwnership;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CarOwnership>
 */
class CarOwnershipFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'car_id' => Car::factory(),
            'user_id' => User::factory(),
            'owned_from' => now(),
            'owned_until' => null,
        ];
    }
}
