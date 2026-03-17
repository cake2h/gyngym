<?php

namespace Database\Seeders;

use App\Models\Exercise;
use Illuminate\Database\Seeder;

class ExerciseSeeder extends Seeder
{
    public function run(): void
    {
        $exercises = [
            ['name' => 'Жим лёжа', 'category' => 'chest'],
            ['name' => 'Разводка гантелей', 'category' => 'chest'],
            ['name' => 'Отжимания', 'category' => 'chest'],
            ['name' => 'Подтягивания', 'category' => 'back'],
            ['name' => 'Тяга штанги в наклоне', 'category' => 'back'],
            ['name' => 'Тяга горизонтального блока', 'category' => 'back'],
            ['name' => 'Становая тяга', 'category' => 'back'],
            ['name' => 'Приседания со штангой', 'category' => 'legs'],
            ['name' => 'Жим ногами', 'category' => 'legs'],
            ['name' => 'Выпады', 'category' => 'legs'],
            ['name' => 'Румынская тяга', 'category' => 'legs'],
            ['name' => 'Подъём на носки', 'category' => 'legs'],
            ['name' => 'Жим стоя', 'category' => 'shoulders'],
            ['name' => 'Разводка в стороны', 'category' => 'shoulders'],
            ['name' => 'Тяга к подбородку', 'category' => 'shoulders'],
            ['name' => 'Подъём гантелей перед собой', 'category' => 'shoulders'],
            ['name' => 'Подъём штанги на бицепс', 'category' => 'arms'],
            ['name' => 'Молотки', 'category' => 'arms'],
            ['name' => 'Французский жим', 'category' => 'arms'],
            ['name' => 'Разгибания на блоке', 'category' => 'arms'],
            ['name' => 'Скручивания', 'category' => 'abs'],
            ['name' => 'Планка', 'category' => 'abs'],
            ['name' => 'Подъём ног в висе', 'category' => 'abs'],
        ];

        foreach ($exercises as $ex) {
            Exercise::firstOrCreate(['name' => $ex['name']], $ex);
        }
    }
}
