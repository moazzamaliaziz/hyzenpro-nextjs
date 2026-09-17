import { describe, expect, it, vi } from 'vitest';

// The Prisma shim imports the mongodb driver at module scope. Stub the driver
// so the assertion below never opens a connection.
vi.mock('mongodb', () => ({
    MongoClient: class {},
    ObjectId: class {},
}));

import { slugify, stripHtml, decodeHtmlEntities, truncate } from '@/lib/utils';
import { normalizeTitle, stripTitleBrand, getSerpFriendlyTitle } from '@/lib/seo-titles';
import { prisma } from '@/lib/prisma';

const weirdValues: unknown[] = [undefined, null, 42, { a: 1 }, ['x'], true, Symbol('s')];

describe('string helpers are total functions', () => {
    it('slugify returns a string and never throws for non-string input', () => {
        for (const value of weirdValues) {
            expect(() => slugify(value)).not.toThrow();
            expect(typeof slugify(value)).toBe('string');
        }
        expect(slugify('Hello World!')).toBe('hello-world');
    });

    it('stripHtml returns a string and never throws for non-string input', () => {
        for (const value of weirdValues) {
            expect(() => stripHtml(value)).not.toThrow();
            expect(typeof stripHtml(value)).toBe('string');
        }
        expect(stripHtml('<b>hi</b>')).toBe('hi');
    });

    it('decodeHtmlEntities returns a string and never throws for non-string input', () => {
        for (const value of weirdValues) {
            expect(() => decodeHtmlEntities(value)).not.toThrow();
            expect(typeof decodeHtmlEntities(value)).toBe('string');
        }
        expect(decodeHtmlEntities('a &amp; b')).toBe('a & b');
    });

    it('truncate returns a string and never throws for non-string input', () => {
        for (const value of weirdValues) {
            expect(() => truncate(value, 5)).not.toThrow();
            expect(typeof truncate(value, 5)).toBe('string');
        }
        expect(truncate('abcdefghij', 5)).toBe('abcde...');
    });

    it('normalizeTitle returns a string and never throws for non-string input', () => {
        for (const value of weirdValues) {
            expect(() => normalizeTitle(value)).not.toThrow();
            expect(typeof normalizeTitle(value)).toBe('string');
        }
        expect(normalizeTitle(undefined)).toBe('');
        expect(normalizeTitle('  a   b  ')).toBe('a b');
    });

    it('stripTitleBrand returns a string and never throws for non-string input', () => {
        for (const value of weirdValues) {
            expect(() => stripTitleBrand(value)).not.toThrow();
            expect(typeof stripTitleBrand(value)).toBe('string');
        }
        expect(stripTitleBrand('Foo | HyzenPro')).toBe('Foo');
        expect(stripTitleBrand(undefined)).toBe('');
    });

    it('getSerpFriendlyTitle tolerates an undefined fallback', () => {
        expect(() => getSerpFriendlyTitle(undefined, undefined)).not.toThrow();
        expect(typeof getSerpFriendlyTitle(undefined, undefined)).toBe('string');
    });
});

describe('prisma shim raw command surface', () => {
    it('exposes $runCommandRaw as a function', () => {
        expect(typeof (prisma as any).$runCommandRaw).toBe('function');
    });
});