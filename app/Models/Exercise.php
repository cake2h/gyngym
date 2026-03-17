<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Exercise extends Model
{
    protected $fillable = ['name', 'category'];

    public function templates(): BelongsToMany
    {
        return $this->belongsToMany(WorkoutTemplate::class, 'workout_template_exercise')
            ->withPivot('order')
            ->orderByPivot('order');
    }
}
