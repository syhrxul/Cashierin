<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'store_id',
        'event',
        'description',
        'properties',
        'ip_address',
        'user_agent'
    ];

    protected $casts = [
        'properties' => 'array'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    /**
     * Record a new activity log entry.
     */
    public static function log(string $event, string $description, array $properties = []): void
    {
        $user = auth()->user();
        $request = request();

        static::create([
            'user_id'     => $user?->id,
            'store_id'    => $user?->store_id, // can be overridden by properties if needed
            'event'       => $event,
            'description' => $description,
            'properties'  => array_merge([
                'method' => $request->method(),
                'url'    => $request->fullUrl(),
            ], $properties),
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
        ]);
    }
}
