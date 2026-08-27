/**
 * Normalize legacy external URLs at the public rendering boundary.
 *
 * Stored tool URLs remain unchanged so admin editing, submissions, and
 * historical records keep their original values. Only an explicit HTTP URL
 * is upgraded when it is rendered on an HTTPS page.
 */
export function toSecureExternalUrl<T extends string | null | undefined>(value: T): T {
    if (typeof value !== 'string' || !value.trim()) {
        return value;
    }

    if (!/^http:\/\//i.test(value)) {
        return value;
    }

    return (`https://${value.slice('http://'.length)}`) as T;
}
