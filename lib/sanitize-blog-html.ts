import 'server-only';

import * as cheerio from 'cheerio';

const ALLOWED_TAGS = new Set([
    'a', 'b', 'blockquote', 'br', 'code', 'cite', 'div', 'em', 'figcaption',
    'figure', 'h2', 'h3', 'h4', 'hr', 'i', 'img', 'li', 'mark', 'ol', 'p',
    'pre', 'small', 'span', 'strong', 'sub', 'sup', 'table', 'tbody', 'td',
    'th', 'thead', 'tr', 'ul',
]);

const GLOBAL_ATTRIBUTES = new Set(['class', 'id', 'title', 'aria-label', 'aria-hidden']);
const TAG_ATTRIBUTES: Record<string, Set<string>> = {
    a: new Set(['href', 'target', 'rel']),
    img: new Set(['src', 'alt', 'width', 'height', 'loading', 'decoding']),
    td: new Set(['colspan', 'rowspan', 'scope']),
    th: new Set(['colspan', 'rowspan', 'scope']),
};

function isSafeUrl(value: string) {
    return /^(?:(?:https?|mailto):|\/|#)/i.test(value.trim());
}

/**
 * Sanitize database-backed article HTML without bringing a browser DOM runtime
 * into serverless functions. Cheerio is already a production dependency and
 * this allowlist keeps the article formatting needed by the editorial corpus.
 */
export function sanitizeBlogHtml(html: string) {
    const $ = cheerio.load(html, {}, false);
    const root = $.root();

    root.find('*').each((_, element) => {
        const tagName = element.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tagName)) {
            $(element).remove();
            return;
        }

        for (const [rawName, rawValue] of Object.entries(element.attribs || {})) {
            const name = rawName.toLowerCase();
            const allowed = GLOBAL_ATTRIBUTES.has(name) || TAG_ATTRIBUTES[tagName]?.has(name);
            const unsafeEvent = name.startsWith('on') || name === 'srcdoc';
            const urlAttribute = name === 'href' || name === 'src';

            if (!allowed || unsafeEvent || (urlAttribute && !isSafeUrl(rawValue))) {
                $(element).removeAttr(rawName);
            }
        }

        if (tagName === 'a' && $(element).attr('target') === '_blank') {
            const rel = new Set(($(element).attr('rel') || '').split(/\s+/).filter(Boolean));
            rel.add('noopener');
            rel.add('noreferrer');
            $(element).attr('rel', Array.from(rel).join(' '));
        }
    });

    return root.html() || '';
}
