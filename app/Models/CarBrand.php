<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
])]
class CarBrand extends Model
{
    /**
     * @return HasMany<CarModel, CarBrand>
     */
    public function models(): HasMany
    {
        return $this->hasMany(CarModel::class);
    }
}
