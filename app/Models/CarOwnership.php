<?php

namespace App\Models;

use Database\Factories\CarOwnershipFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'car_id',
    'user_id',
    'owned_from',
    'owned_until',
])]
class CarOwnership extends Model
{
    /** @use HasFactory<CarOwnershipFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Car, CarOwnership>
     */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /**
     * @return BelongsTo<User, CarOwnership>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'owned_from' => 'datetime',
            'owned_until' => 'datetime',
        ];
    }
}
