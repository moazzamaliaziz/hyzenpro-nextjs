import { describe, expect, it } from 'vitest';
import { applyEditorialArticleOverride, getEditorialArticleOverride } from '@/lib/editorial-article-overrides';
import { sanitizeBlogHtml } from '@/lib/sanitize-blog-html';

describe('AgentRouter editorial article override', () => {
    it('contains the requested media, CTA, and corrected Anthropic gateway setup', () => {
        const override = getEditorialArticleOverride('how-to-use-claude-code-free-with-agentrouter');
        expect(override).toBeDefined();
        expect(override?.featuredImage).toContain('u14ttmbe_agent-router-dashboard.png');
        expect(override?.content).toContain('1D9oJOM8ZcndsnqLJWU9qPSSTjE-0BOqH/preview');
        expect(override?.content).toContain('agentrouter.org/register?aff=L5zz');
        expect(override?.content).toContain('https://co.agentrouter.org');
        expect(override?.content).toContain('without</strong> <code>/v1</code>');
    });

    it('applies only to the requested slug and preserves the URL identity', () => {
        const post = { slug: 'how-to-use-claude-code-free-with-agentrouter', title: 'old', content: 'old', featuredImage: null, updatedAt: new Date('2026-01-01') };
        const resolved = applyEditorialArticleOverride(post);
        expect(resolved.slug).toBe(post.slug);
        expect(resolved.title).not.toBe('old');
        expect(resolved.content).toContain('Step 1: Install Claude Code');
        expect(applyEditorialArticleOverride({ slug: 'other-post', title: 'same' })).toEqual({ slug: 'other-post', title: 'same' });
    });

    it('allows only the Google Drive preview iframe and strips arbitrary iframe sources', () => {
        const safe = sanitizeBlogHtml('<iframe src="https://drive.google.com/file/abc123/preview" title="Walkthrough" allowfullscreen></iframe>');
        const unsafe = sanitizeBlogHtml('<iframe src="https://evil.example/embed" title="Bad"></iframe>');
        expect(safe).toContain('drive.google.com/file/abc123/preview');
        expect(unsafe).not.toContain('evil.example');
        expect(unsafe).toContain('<iframe');
    });
});
