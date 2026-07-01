<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => fn () => $request->user()?->load('role'),
            ],
            'notificationsUnreadCount' => fn () => $request->user()?->unreadNotifications()->count() ?? 0,
            'notifications' => Inertia::defer(fn (): ?array => $this->notificationItems($request)),
        ];
    }

    /**
     * @return array{items: array<int, array<string, mixed>>}|null
     */
    private function notificationItems(Request $request): ?array
    {
        $user = $request->user();

        if ($user === null) {
            return null;
        }

        $items = array_values($user->notifications()
            ->latest()
            ->limit(15)
            ->get()
            ->map(fn ($notification): array => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? '',
                'message' => $notification->data['message'] ?? '',
                'action_url' => $notification->data['action_url'] ?? null,
                'read_at' => $notification->read_at?->toIso8601String(),
                'created_at_diff' => $notification->created_at?->diffForHumans(),
            ])
            ->all());

        return [
            'items' => $items,
        ];
    }
}
