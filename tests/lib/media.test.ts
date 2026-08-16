import { describe, it, expect } from 'vitest';
import {
    formatBytes,
    titleFromFilename,
    cleanFilenameToTitle,
    getMediaExtension,
    sanitizeOriginalFileName,
    parsePositiveInteger,
} from '@/lib/media';

describe('formatBytes', () => {
    it('formats bytes', () => {
        expect(formatBytes(0)).toBe('0 B');
        expect(formatBytes(500)).toBe('500 B');
        expect(formatBytes(1023)).toBe('1023 B');
    });

    it('formats kilobytes', () => {
        expect(formatBytes(1024)).toBe('1 KB');
        expect(formatBytes(1536)).toBe('2 KB');
        expect(formatBytes(10240)).toBe('10 KB');
    });

    it('formats megabytes', () => {
        expect(formatBytes(1048576)).toBe('1.0 MB');
        expect(formatBytes(4194304)).toBe('4.0 MB');
    });
});

describe('cleanFilenameToTitle', () => {
    it('converts basic filenames', () => {
        expect(cleanFilenameToTitle('hello-world.png')).toBe('Hello World');
        expect(cleanFilenameToTitle('my_image.jpg')).toBe('My Image');
    });

    it('handles camelCase', () => {
        expect(cleanFilenameToTitle('myAwesomePhoto.webp')).toBe('My Awesome Photo');
    });

    it('collapses multiple separators', () => {
        expect(cleanFilenameToTitle('foo--bar__baz.png')).toBe('Foo Bar Baz');
    });
});

describe('titleFromFilename', () => {
    it('strips UUID prefix', () => {
        const result = titleFromFilename('C596008d-E19b-4e53-95b6-A9c6b1bf31e8-Removalai-Preview.png');
        expect(result).toBe('Removalai Preview');
    });

    it('returns full title when no UUID', () => {
        expect(titleFromFilename('my-awesome-photo.png')).toBe('My Awesome Photo');
    });

    it('handles short names after UUID strip', () => {
        const result = titleFromFilename('12345678-a.png');
        expect(result).toMatch(/./);
    });
});

describe('getMediaExtension', () => {
    it('returns correct extensions', () => {
        expect(getMediaExtension('image/jpeg')).toBe('jpg');
        expect(getMediaExtension('image/png')).toBe('png');
        expect(getMediaExtension('image/webp')).toBe('webp');
        expect(getMediaExtension('image/avif')).toBe('avif');
        expect(getMediaExtension('image/gif')).toBe('gif');
    });

    it('returns null for unsupported types', () => {
        expect(getMediaExtension('image/svg+xml')).toBeNull();
        expect(getMediaExtension('video/mp4')).toBeNull();
    });
});

describe('sanitizeOriginalFileName', () => {
    it('removes dangerous characters', () => {
        expect(sanitizeOriginalFileName('file/name')).toBe('file-name');
        expect(sanitizeOriginalFileName('file?name')).toBe('file-name');
        expect(sanitizeOriginalFileName('file:name')).toBe('file-name');
    });

    it('returns "image" for empty input', () => {
        expect(sanitizeOriginalFileName('')).toBe('image');
    });
});

describe('parsePositiveInteger', () => {
    it('parses positive integers', () => {
        expect(parsePositiveInteger('100')).toBe(100);
        expect(parsePositiveInteger('1')).toBe(1);
    });

    it('returns null for invalid input', () => {
        expect(parsePositiveInteger(null)).toBeNull();
        expect(parsePositiveInteger('0')).toBeNull();
        expect(parsePositiveInteger('-5')).toBeNull();
        expect(parsePositiveInteger('abc')).toBeNull();
        expect(parsePositiveInteger('')).toBeNull();
    });
});