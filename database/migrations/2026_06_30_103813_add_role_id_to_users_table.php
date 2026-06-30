<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasColumn('users', 'role_id')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreignId('role_id')->nullable()->after('id');
            });
        }

        $userRoleId = Role::query()->firstOrCreate(
            ['slug' => 'user'],
            ['name' => 'User'],
        )->id;

        Role::query()->firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin'],
        );

        DB::table('users')
            ->whereNull('role_id')
            ->orWhereNotIn('role_id', Role::query()->pluck('id'))
            ->update(['role_id' => $userRoleId]);

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id')->nullable(false)->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->foreign('role_id')->references('id')->on('roles')->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropColumn('role_id');
        });
    }
};
