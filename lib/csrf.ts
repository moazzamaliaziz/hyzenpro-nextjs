import { NextRequest } from 'next/server';

export function validateOrigin(req: NextRequest): boolean {
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');

    if (!origin || !host) return false;

    try {
        const originHost = new URL(origin).host;
        return originHost === host;
    } catch {
        return false;
    }
}
