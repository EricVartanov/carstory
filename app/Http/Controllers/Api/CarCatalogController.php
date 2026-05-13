<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarBrand;
use App\Models\CarCatalogSuggestion;
use App\Models\CarGeneration;
use App\Models\CarModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CarCatalogController extends Controller
{
    public function brands(): JsonResponse
    {
        $brands = CarBrand::query()
            ->orderBy('name')
            ->limit(500)
            ->get(['id', 'name']);

        return response()->json($brands);
    }

    public function models(Request $request): JsonResponse
    {
        $brandId = $request->integer('brand_id');

        $models = CarModel::query()
            ->where('car_brand_id', $brandId)
            ->orderBy('name')
            ->get(['id', 'name']);

        return response()->json($models);
    }

    public function generations(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'model_id' => ['required', 'integer', 'exists:car_models,id'],
        ]);

        return response()->json(CarGeneration::forFrontend((int) $validated['model_id']));
    }

    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['brand', 'model'])],
            'name' => ['required', 'string', 'max:100'],
            'brand_id' => [
                Rule::requiredIf($request->input('type') === 'model'),
                'nullable',
                'integer',
                'exists:car_brands,id',
            ],
        ]);

        CarCatalogSuggestion::create([
            'type' => $validated['type'],
            'name' => $validated['name'],
            'car_brand_id' => $validated['brand_id'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'ok']);
    }
}
