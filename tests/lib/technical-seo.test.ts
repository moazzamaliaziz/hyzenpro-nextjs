import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { toSecureExternalUrl } from '@/lib/secure-external-url';
import {
  buildPreferredToolCanonicalPath,
  buildToolCanonicalPath,
  resolveToolCanonicalUrl,
} from '@/lib/tool-paths';

describe('technical SEO URL compatibility', () => {
  it('upgrades explicit HTTP external URLs without changing other URL schemes', () => {
    expect(toSecureExternalUrl('http://see-dance-2.com/')).toBe('https://see-dance-2.com/');
    expect(toSecureExternalUrl('http://airemover.org/anyremover-brand-icon-128.webp')).toBe(
      'https://airemover.org/anyremover-brand-icon-128.webp',
    );
    expect(toSecureExternalUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
    expect(toSecureExternalUrl('/images/logo.png')).toBe('/images/logo.png');
    expect(toSecureExternalUrl('mailto:hello@example.com')).toBe('mailto:hello@example.com');
    expect(toSecureExternalUrl(null)).toBeNull();
  });

  it('keeps normal tool paths while correcting the confirmed legacy category records', () => {
    expect(buildPreferredToolCanonicalPath('ai-chatbots', 'claude-4-7-opus')).toBe(
      '/ai-tools-directory/ai-chatbots/claude-4-7-opus/',
    );
    expect(buildPreferredToolCanonicalPath('ai-writing-tools', 'gpt-3-5-turbo')).toBe(
      '/ai-tools-directory/ai-chatbots/gpt-3-5-turbo/',
    );
    expect(buildPreferredToolCanonicalPath('ai-coding-tools', 'cursor')).toBe(
      buildToolCanonicalPath('ai-coding-tools', 'cursor'),
    );
  });

  it('repairs stale internal directory canonicals but preserves other admin overrides', () => {
    const generated = 'https://hyzenpro.com/ai-tools-directory/ai-chatbots/claude-4-7-opus/';
    expect(resolveToolCanonicalUrl(
      'https://hyzenpro.com/ai-tools-directory/ai-writing-tools/claude-4-7-opus/',
      generated,
    )).toBe(generated);
    expect(resolveToolCanonicalUrl('https://example.com/custom-canonical/', generated)).toBe(
      'https://example.com/custom-canonical/',
    );
    expect(resolveToolCanonicalUrl('https://hyzenpro.com/blog/claude-4-7-opus-review/', generated)).toBe(
      'https://hyzenpro.com/blog/claude-4-7-opus-review/',
    );
  });

  it('does not retain the confirmed methodology self-redirect', () => {
    const config = readFileSync(resolve(process.cwd(), 'next.config.js'), 'utf8');
    expect(config).not.toContain("source: '/how-we-test'");
    expect(config).not.toContain("destination: '/how-we-test/'");
  });
});
