<?php

namespace App\Services\Images;

use Illuminate\Http\UploadedFile;
use RuntimeException;

class ImagickImageTranscoder implements ImageTranscoder
{
    public function toJpeg(UploadedFile $file, int $quality = 85): UploadedFile
    {
        $imagickClass = '\\Imagick';

        if (! class_exists($imagickClass)) {
            throw new RuntimeException('Imagick is not installed.');
        }

        $sourcePath = $file->getRealPath();

        if (! $sourcePath) {
            throw new RuntimeException('Unable to read uploaded file.');
        }

        $tmpPath = tempnam(sys_get_temp_dir(), 'img_');

        if ($tmpPath === false) {
            throw new RuntimeException('Unable to create temporary file.');
        }

        $jpegPath = $tmpPath.'.jpg';

        try {
            /** @var object $imagick */
            $imagick = new $imagickClass();
            $imagick->readImage($sourcePath);

            // Flatten alpha onto white for JPEG output.
            if ($imagick->getImageAlphaChannel()) {
                $imagick = $imagick->mergeImageLayers(constant($imagickClass.'::LAYERMETHOD_FLATTEN'));
                $imagick->setImageBackgroundColor('white');
            }

            $imagick->setImageFormat('jpeg');
            $imagick->setImageCompression(constant($imagickClass.'::COMPRESSION_JPEG'));
            $imagick->setImageCompressionQuality(max(1, min(100, $quality)));

            // Reduce metadata size and avoid orientation surprises.
            $imagick->autoOrient();
            $imagick->stripImage();

            if (! $imagick->writeImage($jpegPath)) {
                throw new RuntimeException('Failed to write JPEG output.');
            }

            $imagick->clear();
            $imagick->destroy();
        } catch (\Throwable $e) {
            @unlink($jpegPath);
            @unlink($tmpPath);

            throw new RuntimeException('Unable to transcode image to JPEG.', 0, $e);
        }

        @unlink($tmpPath);

        // Mark as "test" so Symfony allows local temp paths.
        $converted = new UploadedFile(
            $jpegPath,
            pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME).'.jpg',
            'image/jpeg',
            null,
            true,
        );

        register_shutdown_function(static function () use ($jpegPath): void {
            @unlink($jpegPath);
        });

        return $converted;
    }
}

