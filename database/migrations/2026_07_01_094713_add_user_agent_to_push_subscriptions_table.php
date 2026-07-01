<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::connection(config('webpush.database_connection'))
            ->table(config('webpush.table_name'), function (Blueprint $table) {
                $table->string('user_agent', 500)->nullable()->after('content_encoding');
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::connection(config('webpush.database_connection'))
            ->table(config('webpush.table_name'), function (Blueprint $table) {
                $table->dropColumn('user_agent');
            });
    }
};
