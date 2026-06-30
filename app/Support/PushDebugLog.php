<?php

namespace App\Support;

class PushDebugLog
{
    private const SESSION_ID = '55a27f';

    /**
     * @param  array<string, mixed>  $data
     */
    public static function write(
        string $hypothesisId,
        string $location,
        string $message,
        array $data = [],
        string $runId = 'pre-fix',
    ): void {
        $entry = json_encode([
            'sessionId' => self::SESSION_ID,
            'runId' => $runId,
            'hypothesisId' => $hypothesisId,
            'location' => $location,
            'message' => $message,
            'data' => $data,
            'timestamp' => (int) round(microtime(true) * 1000),
        ], JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES)."\n";

        foreach (self::logPaths() as $path) {
            $directory = dirname($path);

            if (! is_dir($directory)) {
                @mkdir($directory, 0755, true);
            }

            if (is_dir($directory)) {
                @file_put_contents($path, $entry, FILE_APPEND | LOCK_EX);
            }
        }
    }

    /**
     * @return list<string>
     */
    private static function logPaths(): array
    {
        return array_values(array_unique([
            base_path('.cursor/debug-55a27f.log'),
            storage_path('logs/debug-55a27f.log'),
        ]));
    }
}
