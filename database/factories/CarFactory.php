<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Car>
 */
class CarFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'brand' => $this->faker->randomElement([
                'Toyota',
                'Honda',
                'BMW',
                'Mercedes-Benz',
                'Volkswagen',
            ]),
            'model' => $this->faker->word(),
            'year' => $this->faker->numberBetween(1990, (int) date('Y')),
            'vin' => null,
            'plate' => $this->faker->optional()->bothify('A###AA##'),
            'color' => $this->faker->optional()->safeColorName(),
            'cover_photo' => null,
        ];
    }
}
