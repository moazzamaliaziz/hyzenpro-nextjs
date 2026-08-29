import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('SEO orphan and sitemap regressions', () => {
    it('keeps the public Advertise page indexable when it is listed in the static sitemap', () => {
        const page = readFileSync(resolve(process.cwd(), 'app/advertise/page.tsx'), 'utf8');
        const sitemap = readFileSync(resolve(process.cwd(), 'app/sitemap-static.xml/route.ts'), 'utf8');

        expect(page).toMatch(/robots:\s*\{[\s\S]*?index:\s*true[\s\S]*?follow:\s*true/);
        expect(sitemap).toContain("{ path: '/advertise/'");
    });

    it('keeps direct crawlable hrefs for the reported orphan URLs on indexable listing pages', () => {
        const blog = readFileSync(resolve(process.cwd(), 'components/pages/BlogPageContent.tsx'), 'utf8');
        const directory = readFileSync(resolve(process.cwd(), 'components/pages/AIToolsDirectoryPageContent.tsx'), 'utf8');
        const listingPages = `${blog}\n${directory}`;
        const expectedPaths = [
            '/blog/cursor-composer-2-5-review/',
            '/ai-tools-directory/ai-automation-tools/simplygrow/',
            '/ai-tools-directory/copywriting/loqua/',
            '/ai-tools-directory/ai-general-tools/mindvault/',
        ];

        for (const path of expectedPaths) {
            expect(listingPages).toContain(`href="${path}"`);
        }
    });
});
