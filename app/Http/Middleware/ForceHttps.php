<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ForceHttps
{
    /**
     * Redirect insecure requests when the application URL uses HTTPS.
     *
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($this->shouldForceHttps($request)) {
            return redirect()->secure($request->getRequestUri(), 301);
        }

        return $next($request);
    }

    private function shouldForceHttps(Request $request): bool
    {
        if ($request->secure()) {
            return false;
        }

        return str_starts_with((string) config('app.url'), 'https://');
    }
}
