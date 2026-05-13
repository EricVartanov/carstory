<?php

namespace App\Services\Images;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class TempImageStorage
{
    /**
     * Store uploaded image as oriented JPEG into public/temp/.
     */
    public function storeTempJpeg(UploadedFile $file, int $maxSide = 2000, int $quality = 90): string
    {
        $imagickClass = '\\Imagick';

        if (! class_exists($imagickClass)) {
            throw new RuntimeException('Imagick is not installed.');
        }

        $sourcePath = $file->getRealPath();

        if (! $sourcePath) {
            throw new RuntimeException('Unable to read uploaded file.');
        }

        $tempPath = 'temp/'.Str::uuid().'.jpg';

        /** @var object $imagick */
        $imagick = new $imagickClass();

        try {
            $imagick->readImage($sourcePath);

            // Flatten alpha onto white for JPEG output.
            if ($imagick->getImageAlphaChannel()) {
                $imagick = $imagick->mergeImageLayers(constant($imagickClass.'::LAYERMETHOD_FLATTEN'));
                $imagick->setImageBackgroundColor('white');
            }

            // iOS orientation and metadata size.
            $imagick->autoOrient();
            $imagick->stripImage();

            $width = (int) $imagick->getImageWidth();
            $height = (int) $imagick->getImageHeight();

            if ($width > 0 && $height > 0 && max($width, $height) > $maxSide) {
                $imagick->scaleImage($maxSide, $maxSide, true);
            }

            $imagick->setImageFormat('jpeg');
            $imagick->setImageCompression(constant($imagickClass.'::COMPRESSION_JPEG'));
            $imagick->setImageCompressionQuality(max(1, min(100, $quality)));

            $jpegBinary = $imagick->getImagesBlob();

            Storage::disk('public')->put($tempPath, $jpegBinary);
        } catch (\Throwable $e) {
            throw new RuntimeException('Unable to store temporary JPEG.', 0, $e);
        } finally {
            try {
                $imagick->clear();
                $imagick->destroy();
            } catch (\Throwable) {
                // ignore
            }
        }

        return $tempPath;
    }

    public function delete(string $path): void
    {
        Storage::disk('public')->delete($path);
    }

    public function cleanupOlderThan(int $seconds): int
    {
        $disk = Storage::disk('public');
        $now = time();

        $deleted = 0;

        foreach ($disk->files('temp') as $path) {
            $fullPath = $disk->path($path);
            $mtime = @filemtime($fullPath);

            if ($mtime !== false && $mtime < ($now - $seconds)) {
                $disk->delete($path);
                $deleted++;
            }
        }

        return $deleted;
    }
}

