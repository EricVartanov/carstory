<?php

namespace App\Services\Images;

use Illuminate\Http\UploadedFile;

interface ImageTranscoder
{
    /**
     * Transcode an uploaded image into a JPEG file.
     *
     * Implementations should throw if the source cannot be decoded.
     */
    public function toJpeg(UploadedFile $file, int $quality = 85): UploadedFile;
}

