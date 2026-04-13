<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read int $id
 */
class CarResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'brand' => $this->brand,
            'model' => $this->model,
            'car_brand_id' => $this->car_brand_id,
            'car_model_id' => $this->car_model_id,
            'year' => $this->year,
            'color' => $this->color?->value,
            'plate' => $this->plate,
            'cover_photo' => $this->cover_photo,
            'is_archived' => $this->is_archived,
            'archived_at' => $this->archived_at?->toIso8601String(),
            'vin' => $this->vin,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
