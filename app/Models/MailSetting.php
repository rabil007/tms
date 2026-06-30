<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string $mailer
 * @property string|null $host
 * @property int $port
 * @property string|null $username
 * @property string|null $password
 * @property string $encryption
 * @property string|null $from_address
 * @property string|null $from_name
 */
class MailSetting extends Model
{
    /**
     * @var list<string>
     */
    protected $fillable = [
        'mailer',
        'host',
        'port',
        'username',
        'password',
        'encryption',
        'from_address',
        'from_name',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate([], [
            'mailer' => 'smtp',
            'port' => 587,
            'encryption' => 'tls',
            'from_name' => config('app.name'),
        ]);
    }

    public function isConfigured(): bool
    {
        if (blank($this->from_address)) {
            return false;
        }

        if ($this->mailer === 'log') {
            return true;
        }

        return $this->mailer === 'smtp' && filled($this->host);
    }

    /**
     * @return array<string, mixed>
     */
    public function toPublicArray(): array
    {
        return [
            'mailer' => $this->mailer,
            'host' => $this->host,
            'port' => $this->port,
            'username' => $this->username,
            'has_password' => filled($this->password),
            'encryption' => $this->encryption,
            'from_address' => $this->from_address,
            'from_name' => $this->from_name,
            'configured' => $this->isConfigured(),
        ];
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'port' => 'integer',
            'password' => 'encrypted',
        ];
    }
}
