<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'car_model_id',
    'gen',
    'name',
    'start_year',
    'end_year',
])]
class CarGeneration extends Model
{
    /**
     * @return BelongsTo<CarModel, CarGeneration>
     */
    public function carModel(): BelongsTo
    {
        return $this->belongsTo(CarModel::class, 'car_model_id');
    }

    /**
     * Человекочитаемый период: "2007–2013" или "2021–н.в."
     */
    public function getPeriodAttribute(): string
    {
        $end = $this->end_year ? (string) $this->end_year : 'н.в.';

        $start = $this->start_year ? (string) $this->start_year : '—';

        return $start.'–'.$end;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'start_year' => 'integer',
            'end_year' => 'integer',
        ];
    }

    /**
     * @return array<int, array{id:int,name:string,gen:?string,start_year:?int,end_year:?int,period:string,label:string}>
     */
    public static function forFrontend(int $modelId): array
    {
        return self::query()
            ->where('car_model_id', $modelId)
            ->orderBy('start_year')
            ->get()
            ->map(fn (self $g) => [
                'id' => $g->id,
                'name' => $g->name,
                'gen' => $g->gen,
                'start_year' => $g->start_year,
                'end_year' => $g->end_year,
                'period' => $g->period,
                'label' => $g->name.' ('.$g->period.')',
            ])
            ->toArray();
    }
}
