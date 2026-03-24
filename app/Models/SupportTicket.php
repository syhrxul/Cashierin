<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'description', 'attachment_path',
        'category', 'priority', 'status', 'admin_feedback',
        'is_read_by_admin', 'is_read_by_user'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
