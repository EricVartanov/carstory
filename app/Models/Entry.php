<?php

namespace App\Models;

use App\Enums\Currency;
use App\Enums\EntryType;
use Database\Factories\EntryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'car_id',
    'user_id',
    'date',
    'mileage',
    'type',
    'title',
    'body',
    'amount',
    'currency',
    'location',
])]
class Entry extends Model
{
    /** @use HasFactory<EntryFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Car, Entry>
     */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /**
     * @return BelongsTo<User, Entry>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<EntryPhoto, Entry>
     */
    public function photos(): HasMany
    {
        return $this->hasMany(EntryPhoto::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'type' => EntryType::class,
            'amount' => 'decimal:2',
            'currency' => Currency::class,
            'location' => 'array',
        ];
    }
}
