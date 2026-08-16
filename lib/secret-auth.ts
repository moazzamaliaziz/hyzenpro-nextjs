import { timingSafeEqual } from 'node:crypto';

function toBuffer(value: string): Buffer {
    return Buffer.from(value, 'utf8');
}

export function secureCompareSecret(expected: string, received: string): boolean {
    const expectedBuffer = toBuffer(expected);
    const receivedBuffer = toBuffer(received);

    if (expectedBuffer.length !== receivedBuffer.length) {
        return false;
    }

    return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function readBearerToken(authorizationHeader: string | null): string | null {
    if (!authorizationHeader) {
        return null;
    }

    const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
    return match?.[1]?.trim() || null;
}
