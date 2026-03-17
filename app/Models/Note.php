<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Note extends Model
{
    protected $fillable = ['user_id', 'title', 'content', 'type', 'url', 'attachments'];

    protected function casts(): array
    {
        return [
            'attachments' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function types(): array
    {
        return ['text' => 'Заметка', 'link' => 'Ссылка', 'video' => 'Видео'];
    }
}
