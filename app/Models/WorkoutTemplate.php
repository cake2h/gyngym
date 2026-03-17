<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkoutTemplate extends Model
{
    protected $fillable = ['user_id', 'name', 'sort_order'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function exercises(): BelongsToMany
    {
        return $this->belongsToMany(Exercise::class, 'workout_template_exercise')
            ->withPivot('order')
            ->orderByPivot('order');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(WorkoutSession::class);
    }
}
