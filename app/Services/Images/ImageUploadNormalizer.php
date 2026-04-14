<?php

namespace App\Services\Images;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class ImageUploadNormalizer
{
    /**
     * MIME types that should be transcoded to JPEG.
     *
     * @var array<int, string>
     */
    private const HEIC_MIMES = [
        'image/heic',
        'image/heif',
        'image/heic-sequence',
        'image/heif-sequence',
    ];

    public function __construct(
        private readonly ImageTranscoder $transcoder,
    ) {
    }

    public function normalize(UploadedFile $file): UploadedFile
    {
        $mime = strtolower((string) $file->getMimeType());

        if (in_array($mime, self::HEIC_MIMES, true)) {
            return $this->transcoder->toJpeg($file);
        }

        // Some clients send HEIC as application/octet-stream; fall back to extension.
        $extension = strtolower($file->getClientOriginalExtension());

        if ($mime === 'application/octet-stream' && Str::of($extension)->trim()->lower()->is(['heic', 'heif'])) {
            return $this->transcoder->toJpeg($file);
        }

        return $file;
    }
}

