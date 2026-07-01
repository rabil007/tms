<?php

namespace App\Models;

use App\Enums\ScheduleStatus;
use Database\Factories\ScheduleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $crew_name
 * @property Carbon $scheduled_date
 * @property string $crew_contact
 * @property int $project_id
 * @property string $pick_up_location
 * @property string $drop_off_location
 * @property string $pick_up_time
 * @property string|null $remarks
 * @property ScheduleStatus $status
 * @property int|null $user_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Project|null $project
 * @property-read User|null $user
 */
#[Fillable([
    'crew_name',
    'scheduled_date',
    'crew_contact',
    'project_id',
    'pick_up_location',
    'drop_off_location',
    'pick_up_time',
    'remarks',
    'status',
    'user_id',
])]
class Schedule extends Model
{
    /** @use HasFactory<ScheduleFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'pick_up_time' => 'datetime:H:i',
            'status' => ScheduleStatus::class,
        ];
    }

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
