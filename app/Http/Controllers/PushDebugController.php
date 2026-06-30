<?php

namespace App\Http\Controllers;

use App\Support\PushDebugLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushDebugController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'hypothesisId' => ['required', 'string', 'max:10'],
            'location' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string', 'max:500'],
            'data' => ['nullable', 'array'],
            'runId' => ['nullable', 'string', 'max:50'],
        ]);

        PushDebugLog::write(
            $validated['hypothesisId'],
            $validated['location'],
            $validated['message'],
            $validated['data'] ?? [],
            $validated['runId'] ?? 'pre-fix',
        );

        return response()->json(['ok' => true]);
    }
}
