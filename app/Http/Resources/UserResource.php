<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'username' => $this->username,
            'email' => $this->email,
            'role' => $this->role,
            'store_id' => $this->store_id,
            'approval_status' => $this->approval_status,
            'approved_at' => $this->approved_at,
            'initials' => $this->initials(),
            'store_name' => $this->whenLoaded('store', fn() => $this->store->name),
        ];
    }
}
