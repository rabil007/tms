<?php

namespace App\Support;

use NotificationChannels\WebPush\PushSubscription;

class PushSubscriptionPresenter
{
    public static function label(PushSubscription $subscription): string
    {
        if (filled($subscription->user_agent)) {
            return self::labelFromUserAgent($subscription->user_agent);
        }

        return self::provider($subscription->endpoint).' device';
    }

    public static function provider(string $endpoint): string
    {
        $host = parse_url($endpoint, PHP_URL_HOST) ?? '';

        return match (true) {
            str_contains($host, 'fcm.googleapis.com') => 'Chrome',
            str_contains($host, 'web.push.apple.com') => 'Safari',
            str_contains($host, 'mozilla.com') => 'Firefox',
            str_contains($host, 'notify.windows.com') => 'Edge',
            default => 'Browser',
        };
    }

    /**
     * @return array<string, mixed>
     */
    public static function toArray(PushSubscription $subscription): array
    {
        return [
            'id' => $subscription->id,
            'endpoint' => $subscription->endpoint,
            'label' => self::label($subscription),
            'provider' => self::provider($subscription->endpoint),
            'content_encoding' => $subscription->content_encoding,
            'created_at_diff' => $subscription->created_at->diffForHumans(),
            'updated_at_diff' => $subscription->updated_at->diffForHumans(),
        ];
    }

    private static function labelFromUserAgent(string $userAgent): string
    {
        $browser = self::browserFromUserAgent($userAgent);
        $os = self::osFromUserAgent($userAgent);

        if ($browser && $os) {
            return "{$browser} on {$os}";
        }

        if ($browser) {
            return $browser;
        }

        if ($os) {
            return $os;
        }

        return 'Unknown device';
    }

    private static function browserFromUserAgent(string $userAgent): ?string
    {
        return match (true) {
            str_contains($userAgent, 'Edg/') => 'Edge',
            str_contains($userAgent, 'OPR/') || str_contains($userAgent, 'Opera') => 'Opera',
            str_contains($userAgent, 'Chrome/') && ! str_contains($userAgent, 'Edg/') => 'Chrome',
            str_contains($userAgent, 'Firefox/') => 'Firefox',
            str_contains($userAgent, 'Safari/') && ! str_contains($userAgent, 'Chrome/') => 'Safari',
            default => null,
        };
    }

    private static function osFromUserAgent(string $userAgent): ?string
    {
        return match (true) {
            str_contains($userAgent, 'iPhone') => 'iPhone',
            str_contains($userAgent, 'iPad') => 'iPad',
            str_contains($userAgent, 'Android') => 'Android',
            str_contains($userAgent, 'Mac OS X') || str_contains($userAgent, 'Macintosh') => 'macOS',
            str_contains($userAgent, 'Windows') => 'Windows',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => null,
        };
    }
}
