<?php

namespace App\Http\Requests;

use App\Enums\CarColor;
use App\Models\Car;
use App\Models\CarGeneration;
use App\Models\CarModel;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateCarRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Car $car */
        $car = $this->route('car');

        return [
            'brand_id' => ['nullable', 'integer', 'exists:car_brands,id'],
            'brand_name' => ['required', 'string', 'max:255'],
            'model_id' => ['nullable', 'integer', 'exists:car_models,id'],
            'model_name' => ['required', 'string', 'max:255'],
            'car_generation_id' => ['nullable', 'integer', 'exists:car_generations,id'],
            'year' => ['required', 'integer', 'min:1886', 'max:2100'],
            'vin' => [
                'nullable',
                'string',
                'size:17',
                Rule::unique('cars', 'vin')->ignore($car->id),
            ],
            'plate' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', Rule::enum(CarColor::class)],
            'cover_photo' => ['nullable', 'image', 'max:5120'],
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $brandId = $this->input('brand_id');
            $modelId = $this->input('model_id');
            $generationId = $this->input('car_generation_id');

            if ($modelId && ! $brandId) {
                $validator->errors()->add(
                    'brand_id',
                    'Марка обязательна при выборе модели из каталога.',
                );
            }

            if ($modelId && $brandId && ! CarModel::query()->whereKey($modelId)->where('car_brand_id', $brandId)->exists()) {
                $validator->errors()->add(
                    'model_id',
                    'Модель не относится к выбранной марке.',
                );
            }

            if ($generationId && ! $modelId) {
                $validator->errors()->add(
                    'model_id',
                    'Модель обязательна при выборе поколения.',
                );
            }

            if ($generationId && $modelId && ! CarGeneration::query()->whereKey($generationId)->where('car_model_id', $modelId)->exists()) {
                $validator->errors()->add(
                    'car_generation_id',
                    'Поколение не относится к выбранной модели.',
                );
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('vin') && $this->input('vin') === '') {
            $this->merge(['vin' => null]);
        }

        if ($this->has('color') && $this->input('color') === '') {
            $this->merge(['color' => null]);
        }
    }
}
