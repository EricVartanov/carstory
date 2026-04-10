<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCarRequest extends FormRequest
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
        return [
            'car_brand_id' => ['nullable', 'integer', 'exists:car_brands,id'],
            'car_model_id' => ['nullable', 'integer', 'exists:car_models,id'],
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1886', 'max:2100'],
            'vin' => ['nullable', 'string', 'size:17', 'unique:cars,vin'],
            'plate' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
        ];
    }
}
