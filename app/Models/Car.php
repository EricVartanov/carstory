<?php

namespace App\Models;

use Database\Factories\CarFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'car_brand_id',
    'car_model_id',
    'brand',
    'model',
    'year',
    'vin',
    'plate',
    'color',
    'cover_photo',
])]
class Car extends Model
{
    /** @use HasFactory<CarFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<User, Car>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<CarOwnership, Car>
     */
    public function ownerships(): HasMany
    {
        return $this->hasMany(CarOwnership::class);
    }

    /**
     * @return BelongsTo<CarBrand, Car>
     */
    public function brandRef(): BelongsTo
    {
        return $this->belongsTo(CarBrand::class, 'car_brand_id');
    }

    /**
     * @return BelongsTo<CarModel, Car>
     */
    public function modelRef(): BelongsTo
    {
        return $this->belongsTo(CarModel::class, 'car_model_id');
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'year' => 'integer',
        ];
    }
}
