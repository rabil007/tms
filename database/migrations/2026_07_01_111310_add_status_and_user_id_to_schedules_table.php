<?php

use App\Enums\ScheduleStatus;
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
        Schema::table('schedules', function (Blueprint $table) {
            $table->string('status')->default(ScheduleStatus::Pending->value)->after('remarks');
            $table->foreignId('user_id')->nullable()->after('status')->constrained()->nullOnDelete();

            $table->index('status');
            $table->index('user_id');
        });

        DB::table('schedules')->update([
            'status' => ScheduleStatus::Completed->value,
            'user_id' => null,
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropIndex(['status']);
            $table->dropColumn('status');
        });
    }
};
