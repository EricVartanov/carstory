<?php

namespace App\Models;

use App\Enums\CarTransferStatus;
use Database\Factories\CarTransferFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'car_id',
    'from_user_id',
    'to_user_id',
    'token',
    'status',
    'expires_at',
])]
class CarTransfer extends Model
{
    /** @use HasFactory<CarTransferFactory> */
    use HasFactory;

    /**
     * @return BelongsTo<Car, CarTransfer>
     */
    public function car(): BelongsTo
    {
        return $this->belongsTo(Car::class);
    }

    /**
     * @return BelongsTo<User, CarTransfer>
     */
    public function fromUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_user_id');
    }

    /**
     * @return BelongsTo<User, CarTransfer>
     */
    public function toUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_user_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => CarTransferStatus::class,
            'expires_at' => 'datetime',
        ];
    }

    protected static function newFactory(): CarTransferFactory
    {
        return CarTransferFactory::new();
    }
}
