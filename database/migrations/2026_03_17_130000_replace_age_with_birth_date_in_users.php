<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('users', 'age')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('age');
            });
        }
        Schema::table('users', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('birth_date');
            $table->unsignedTinyInteger('age')->nullable()->after('email');
        });
    }
};
