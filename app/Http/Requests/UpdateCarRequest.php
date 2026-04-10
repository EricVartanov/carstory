<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
        return [
            'brand' => ['required', 'string', 'max:255'],
            'model' => ['required', 'string', 'max:255'],
            'year' => ['required', 'integer', 'min:1886', 'max:2100'],
            'vin' => [
                'nullable',
                'string',
                'size:17',
                Rule::unique('cars', 'vin')->ignore($this->route('car')),
            ],
            'plate' => ['nullable', 'string', 'max:255'],
            'color' => ['nullable', 'string', 'max:255'],
        ];
    }
}
