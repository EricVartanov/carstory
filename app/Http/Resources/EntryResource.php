<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'car_id' => $this->car_id,
            'user_id' => $this->user_id,
            'date' => $this->date?->format('Y-m-d'),
            'mileage' => $this->mileage,
            'type' => $this->type?->value,
            'title' => $this->title,
            'body' => $this->body,
            'amount' => $this->amount,
            'currency' => $this->currency?->value,
            'location' => $this->location,
            'photos' => $this->whenLoaded('photos', fn () => $this->photos->map(
                static fn ($photo) => [
                    'id' => $photo->id,
                    'url' => '/storage/'.$photo->path,
                    'path' => $photo->path,
                ],
            )),
        ];
    }
}
