<?php

namespace App\Http\Requests\Branch;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBranchRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'currency' => 'nullable|string|max:10',
            'tax' => 'nullable|numeric|min:0',
            'lat' => 'nullable|numeric',
            'long' => 'nullable|numeric',
            'radius' => 'nullable|numeric|min:0',
            'intro_type' => 'nullable|string|max:50',
            'cover_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'logo_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'languages' => 'nullable|array|min:1',
            'languages.*' => 'required|exists:languages,id',
        ];
    }
}
