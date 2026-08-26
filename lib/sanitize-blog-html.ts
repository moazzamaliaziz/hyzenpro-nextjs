import 'server-only';

import createDOMPurify from 'dompurify';
// jsdom is already a production dependency; using require here avoids a
// missing optional @types/jsdom package in the repository's existing build.
const { JSDOM } = require('jsdom') as { JSDOM: new (html?: string) => { window: unknown } };
const purifier = createDOMPurify(new JSDOM('').window as never);

export function sanitizeBlogHtml(html: string) {
    return purifier.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel'],
        ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto):|\/)/i,
    });
}
