<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'type',
    'name',
    'car_brand_id',
    'status',
])]
class CarCatalogSuggestion extends Model
{
    /**
     * @return BelongsTo<CarBrand, CarCatalogSuggestion>
     */
    public function carBrand(): BelongsTo
    {
        return $this->belongsTo(CarBrand::class, 'car_brand_id');
    }
}
