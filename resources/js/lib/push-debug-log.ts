const DEBUG_INGEST = 'http://127.0.0.1:7922/ingest/b4e2405a-b303-40c5-8d94-3b564608dd1b';
const SESSION_ID = '55a27f';

type PushDebugPayload = {
    hypothesisId: string;
    location: string;
    message: string;
    data?: Record<string, unknown>;
    runId?: string;
};

export function pushDebugLog({
    hypothesisId,
    location,
    message,
    data = {},
    runId = 'pre-fix',
}: PushDebugPayload): void {
    const payload = {
        sessionId: SESSION_ID,
        runId,
        hypothesisId,
        location,
        message,
        data,
        timestamp: Date.now(),
    };

    // #region agent log
    fetch(DEBUG_INGEST, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Debug-Session-Id': SESSION_ID,
        },
        body: JSON.stringify(payload),
    }).catch(() => {});

    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';

    fetch('/internal/push-debug', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
    }).catch(() => {});
    // #endregion
}
