<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Images\ImageUploadNormalizer;
use App\Services\Images\TempImageStorage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    public function __construct(
        private readonly ImageUploadNormalizer $imageUploadNormalizer,
        private readonly TempImageStorage $tempImageStorage,
    ) {
    }

    public function temp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,heic,heif', 'max:20480'],
        ]);

        $file = $this->imageUploadNormalizer->normalize($validated['file']);

        $tempPath = $this->tempImageStorage->storeTempJpeg($file);

        return response()->json([
            'temp_path' => $tempPath,
            'url' => '/storage/'.$tempPath,
        ]);
    }

    public function deleteTemp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'temp_path' => ['required', 'string'],
        ]);

        $path = (string) $validated['temp_path'];

        if (! str_starts_with($path, 'temp/')) {
            return response()->json(['error' => 'Invalid path'], 422);
        }

        $this->tempImageStorage->delete($path);

        return response()->json(['ok' => true]);
    }
}

