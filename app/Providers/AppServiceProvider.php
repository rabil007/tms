<?php

namespace App\Providers;

use App\Services\MailConfigService;
use App\Support\PushDebugLog;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use NotificationChannels\WebPush\Events\NotificationFailed;
use NotificationChannels\WebPush\Events\NotificationSent;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configureUrls();
        $this->configureMail();
        $this->configurePushDebugLogging();
    }

    protected function configurePushDebugLogging(): void
    {
        Event::listen(NotificationSent::class, function (NotificationSent $event): void {
            PushDebugLog::write(
                'C',
                'AppServiceProvider:NotificationSent',
                'Web push delivery succeeded',
                [
                    'endpoint' => substr($event->report->getEndpoint(), 0, 80),
                    'success' => $event->report->isSuccess(),
                ],
            );
        });

        Event::listen(NotificationFailed::class, function (NotificationFailed $event): void {
            PushDebugLog::write(
                'C',
                'AppServiceProvider:NotificationFailed',
                'Web push delivery failed',
                [
                    'endpoint' => substr($event->report->getEndpoint(), 0, 80),
                    'reason' => $event->report->getReason(),
                    'expired' => $event->report->isSubscriptionExpired(),
                    'status_code' => $event->report->getResponse()?->getStatusCode(),
                ],
            );
        });

    }

    protected function configureMail(): void
    {
        $this->app->make(MailConfigService::class)->apply();
    }

    protected function configureUrls(): void
    {
        if (str_starts_with((string) config('app.url'), 'https://')) {
            URL::forceScheme('https');
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
