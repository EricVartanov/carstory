<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CarBrand;
use App\Models\CarModel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CarCatalogController extends Controller
{
    public function brands(Request $request): JsonResponse
    {
        $search = trim($request->string('search')->toString());

        $brands = CarBrand::query()
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->limit(10)
            ->get(['id', 'name']);

        return response()->json($brands);
    }

    public function models(Request $request): JsonResponse
    {
        $brandId = $request->integer('brand_id');
        $search = trim($request->string('search')->toString());

        $models = CarModel::query()
            ->where('car_brand_id', $brandId)
            ->when($search !== '', fn ($query) => $query->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->limit(20)
            ->get(['id', 'name']);

        return response()->json($models);
    }
}
