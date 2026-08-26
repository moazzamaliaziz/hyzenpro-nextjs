import { describe, expect, it } from 'vitest';
import { resolveBlogImageSource } from '@/lib/blog-images';
import { sanitizeBlogHtml } from '@/lib/sanitize-blog-html';

describe('blog hardening helpers', () => {
    it('keeps the repaired Sakana asset when it exists', () => {
        expect(resolveBlogImageSource('/images/blog/sakana-fugu-review-2026.png')).toBe('/images/blog/sakana-fugu-review-2026.png');
    });

    it('falls back before next/image can request a missing local asset', () => {
        expect(resolveBlogImageSource('/images/blog/does-not-exist.png')).toBe('/images/blog/hyzenpro-blog-default.png');
    });

    it('preserves generated internal image routes', () => {
        expect(resolveBlogImageSource('/ai-tools-directory/ai-chatbots/example/opengraph-image')).toBe('/ai-tools-directory/ai-chatbots/example/opengraph-image');
    });

    it('rejects unsafe remote and traversal sources', () => {
        expect(resolveBlogImageSource('http://example.com/image.png')).toBe('/images/blog/hyzenpro-blog-default.png');
        expect(resolveBlogImageSource('/images/../secrets.png')).toBe('/images/blog/hyzenpro-blog-default.png');
    });

    it('removes scripts, event handlers, and unsafe URLs from article HTML', () => {
        const sanitized = sanitizeBlogHtml('<p onclick="alert(1)">Read <a href="javascript:alert(1)">this</a></p><script>alert(1)</script><img src="x" onerror="alert(1)">');
        expect(sanitized).not.toMatch(/script|onclick|onerror|javascript:/i);
        expect(sanitized).toContain('<p>Read <a>this</a></p>');
    });
});
