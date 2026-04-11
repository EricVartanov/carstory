<?php

namespace App\Models;

use Database\Factories\EntryPhotoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

#[Fillable([
    'entry_id',
    'path',
    'original_name',
    'order',
])]
class EntryPhoto extends Model
{
    /** @use HasFactory<EntryPhotoFactory> */
    use HasFactory;

    /**
     * @var array<int, string>
     */
    protected $appends = ['url'];

    /**
     * @return BelongsTo<Entry, EntryPhoto>
     */
    public function entry(): BelongsTo
    {
        return $this->belongsTo(Entry::class);
    }

    public function getUrlAttribute(): string
    {
        return Storage::disk('public')->url($this->path);
    }
}
