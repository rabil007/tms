<?php

namespace App\Services;

use App\Models\MailSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;

class MailConfigService
{
    public function apply(): void
    {
        if (! Schema::hasTable('mail_settings')) {
            return;
        }

        $settings = MailSetting::query()->first();

        if ($settings === null || ! $settings->isConfigured()) {
            return;
        }

        Config::set('mail.default', $settings->mailer);

        if ($settings->mailer === 'smtp') {
            Config::set('mail.mailers.smtp.host', $settings->host);
            Config::set('mail.mailers.smtp.port', $settings->port);
            Config::set('mail.mailers.smtp.username', $settings->username);
            Config::set('mail.mailers.smtp.password', $settings->password);
            Config::set('mail.mailers.smtp.scheme', $this->resolveScheme($settings->encryption));
        }

        Config::set('mail.from.address', $settings->from_address);
        Config::set('mail.from.name', $settings->from_name ?? config('app.name'));
    }

    private function resolveScheme(string $encryption): ?string
    {
        return match ($encryption) {
            'ssl' => 'smtps',
            default => null,
        };
    }
}
