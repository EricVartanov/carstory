<?php

namespace Database\Seeders;

use App\Models\CarBrand;
use App\Models\CarGeneration;
use App\Models\CarModel;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CarCatalogSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        CarGeneration::truncate();
        CarModel::truncate();
        CarBrand::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        $path = database_path('seeders/data/gen_json.json');
        $data = json_decode(file_get_contents($path), true);

        $brandCache = [];
        $modelCache = [];
        $brandCount = 0;
        $modelCount = 0;
        $genCount = 0;

        foreach ($data as $row) {
            $brandName = trim($row['brand']);
            $modelName = trim($row['model']);
            $genNum = $row['gen'] ?? null;
            $modName = trim($row['mod']);
            $startYear = ! empty($row['start_year']) ? (int) $row['start_year'] : null;
            $endYear = ! empty($row['end_year']) ? (int) $row['end_year'] : null;

            if (! isset($brandCache[$brandName])) {
                $brand = CarBrand::firstOrCreate(['name' => $brandName]);
                if ($brand->wasRecentlyCreated) {
                    $brandCount++;
                }
                $brandCache[$brandName] = $brand->id;
            }
            $brandId = $brandCache[$brandName];

            $modelKey = $brandId.'_'.$modelName;
            if (! isset($modelCache[$modelKey])) {
                $model = CarModel::firstOrCreate([
                    'car_brand_id' => $brandId,
                    'name' => $modelName,
                ]);
                if ($model->wasRecentlyCreated) {
                    $modelCount++;
                }
                $modelCache[$modelKey] = $model->id;
            }
            $modelId = $modelCache[$modelKey];

            CarGeneration::firstOrCreate(
                [
                    'car_model_id' => $modelId,
                    'name' => $modName,
                ],
                [
                    'gen' => $genNum,
                    'start_year' => $startYear,
                    'end_year' => $endYear,
                ]
            );
            $genCount++;
        }

        $this->command->info("✓ Марок: {$brandCount}");
        $this->command->info("✓ Моделей: {$modelCount}");
        $this->command->info("✓ Поколений: {$genCount}");
    }
}
