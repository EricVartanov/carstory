<?php

namespace Database\Factories;

use App\Models\Car;
use App\Models\CarTransfer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<CarTransfer>
 */
class CarTransferFactory extends Factory
{
    protected $model = CarTransfer::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $owner = User::factory();

        return [
            'car_id' => Car::factory()->for($owner, 'user'),
            'from_user_id' => $owner,
            'to_user_id' => null,
            'token' => Str::random(64),
            'status' => 'pending',
            'expires_at' => now()->addDays(7),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes): array => [
            'expires_at' => now()->subDay(),
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'accepted',
            'to_user_id' => User::factory(),
        ]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'cancelled',
        ]);
    }
}
