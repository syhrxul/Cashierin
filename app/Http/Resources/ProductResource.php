<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
            'category_id' => $this->category_id,
            'category_name' => $this->whenLoaded('category', fn() => $this->category->name),
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'stock' => (int) $this->stock,
            'sku' => $this->sku,
            'is_active' => (bool) $this->is_active,
            'discount' => [
                'type' => $this->discount_type,
                'value' => (float) $this->discount_value,
                'starts_at' => $this->discount_starts_at,
                'ends_at' => $this->discount_ends_at,
            ],
        ];
    }
}
