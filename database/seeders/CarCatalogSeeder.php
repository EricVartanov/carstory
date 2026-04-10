<?php

namespace Database\Seeders;

use App\Models\CarBrand;
use App\Models\CarModel;
use Illuminate\Database\Seeder;

class CarCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $catalog = [
            'Lada (АвтоВАЗ)' => ['Vesta', 'XRAY', 'Granta', 'Niva', 'Largus', '2107', '2114'],
            'UAZ' => ['Patriot', 'Hunter', 'Буханка', 'Pickup'],
            'Geely' => ['Atlas', 'Coolray', 'Emgrand', 'Tugella', 'Monjaro'],
            'Haval' => ['F7', 'Jolion', 'H6', 'F7x', 'Dargo'],
            'Chery' => ['Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5'],
            'Toyota' => ['Camry', 'Corolla', 'RAV4', 'Land Cruiser', 'Yaris', 'Prius', 'Hilux', 'Fortuner'],
            'Volkswagen' => ['Golf', 'Polo', 'Passat', 'Tiguan', 'Jetta', 'Touareg', 'Caddy'],
            'BMW' => ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X6', 'M3', 'M5'],
            'Mercedes-Benz' => ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'Sprinter'],
            'Audi' => ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'TT', 'RS6'],
            'Hyundai' => ['Solaris', 'Tucson', 'Santa Fe', 'Elantra', 'Creta', 'i30', 'i40'],
            'Kia' => ['Rio', 'Sportage', 'Sorento', 'Ceed', 'K5', 'Stinger', 'Carnival'],
            'Renault' => ['Logan', 'Sandero', 'Duster', 'Megane', 'Captur', 'Arkana'],
            'Nissan' => ['Qashqai', 'X-Trail', 'Almera', 'Patrol', 'Navara', 'Note', 'Juke'],
            'Ford' => ['Focus', 'Fiesta', 'Mondeo', 'Explorer', 'F-150', 'Kuga', 'Transit'],
            'Chevrolet' => ['Cruze', 'Spark', 'Equinox', 'Tahoe', 'Suburban', 'Trailblazer'],
            'Honda' => ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Jazz', 'Fit'],
            'Mazda' => ['3', '6', 'CX-5', 'CX-9', 'MX-5', '2', 'CX-3'],
            'Mitsubishi' => ['Outlander', 'Pajero', 'ASX', 'L200', 'Eclipse Cross', 'Galant'],
            'Skoda' => ['Octavia', 'Superb', 'Kodiaq', 'Fabia', 'Rapid', 'Karoq'],
            'Peugeot' => ['208', '308', '508', '3008', '5008', 'Partner', 'Boxer'],
            'Opel' => ['Astra', 'Insignia', 'Mokka', 'Corsa', 'Vectra', 'Zafira'],
        ];

        $createdBrands = 0;
        $createdModels = 0;

        foreach ($catalog as $brandName => $models) {
            $brand = CarBrand::firstOrCreate(['name' => $brandName]);
            if ($brand->wasRecentlyCreated) {
                $createdBrands++;
            }

            foreach ($models as $modelName) {
                $model = CarModel::firstOrCreate([
                    'car_brand_id' => $brand->id,
                    'name' => $modelName,
                ]);

                if ($model->wasRecentlyCreated) {
                    $createdModels++;
                }
            }
        }

        $this->command?->info("Создано {$createdBrands} марок и {$createdModels} моделей");
    }
}
