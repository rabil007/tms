<?php

namespace App\Models;

use App\Enums\ScheduleStatus;
use Database\Factories\ScheduleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

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
 * @property string|null $attachment_path
 * @property string|null $attachment_name
 * @property string|null $attachment_mime
 * @property ScheduleStatus $status
 * @property int|null $user_id
 * @property int|null $created_by_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read string|null $attachment_url
 * @property-read bool $has_attachment
 * @property-read Project|null $project
 * @property-read User|null $user
 * @property-read User|null $createdBy
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
    'attachment_path',
    'attachment_name',
    'attachment_mime',
    'status',
    'user_id',
    'created_by_id',
])]
class Schedule extends Model
{
    /** @use HasFactory<ScheduleFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $appends = [
        'attachment_url',
        'has_attachment',
    ];

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
     * @return Attribute<string|null, never>
     */
    protected function attachmentUrl(): Attribute
    {
        return Attribute::get(fn (): ?string => $this->attachment_path
            ? Storage::disk('public')->url($this->attachment_path)
            : null);
    }

    /**
     * @return Attribute<bool, never>
     */
    protected function hasAttachment(): Attribute
    {
        return Attribute::get(fn (): bool => $this->attachment_path !== null);
    }

    public function hasAttachmentFile(): bool
    {
        return $this->attachment_path !== null;
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

    /**
     * @return BelongsTo<User, $this>
     */
    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by_id');
    }
}
