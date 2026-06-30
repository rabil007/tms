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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->string('crew_name')->index();
            $table->date('scheduled_date')->index();
            $table->string('crew_contact', 20);
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('pick_up_location');
            $table->string('drop_off_location');
            $table->time('pick_up_time');
            $table->text('remarks')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
