<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $name
 */
class ApplicationSetting extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'name' => (string) config('app.name'),
        ]);
    }
}
