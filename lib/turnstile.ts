const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstileToken(token: string | null | undefined, remoteIp?: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
        // Allow local/dev without keys; production should set TURNSTILE_SECRET_KEY
        return process.env.NODE_ENV !== 'production';
    }

    if (!token || !token.trim()) {
        return false;
    }

    const body = new URLSearchParams({
        secret,
        response: token,
    });

    if (remoteIp && remoteIp !== 'unknown') {
        body.set('remoteip', remoteIp);
    }

    try {
        const response = await fetch(VERIFY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        const data = (await response.json()) as { success?: boolean };
        return data.success === true;
    } catch {
        return false;
    }
}
