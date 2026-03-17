<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Measurement extends Model
{
    protected $fillable = ['user_id', 'type', 'value', 'measured_at'];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
            'measured_at' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public static function typesForGender(string $gender): array
    {
        return $gender === 'female'
            ? ['shoulders', 'chest', 'hips', 'waist']
            : ['shoulders', 'chest', 'wrists', 'forearms', 'abs'];
    }
}
