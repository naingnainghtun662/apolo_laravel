<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BranchResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'address' => $this->address,
            'currency' => $this->currency,
            'tax' => $this->tax,
            'lat' => $this->lat,
            'long' => $this->long,
            'radius' => $this->radius,
            'introType' => $this->intro_type,
            'coverImage' => $this->cover_image,
            'logoImage' => $this->logo_image,
            'languages' => LanguageResource::collection($this->whenLoaded('languages')),
            'tenantId' => $this->tenant_id,
            'createdAt' => $this->created_at,
            'updatedAt' => $this->updated_at,
            'deletedAt' => $this->deleted_at,
        ];
    }
}
