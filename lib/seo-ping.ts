import { getBaseUrl } from '@/lib/utils';

export async function pingNewPost(slug: string) {
    const baseUrl = getBaseUrl();
    const postUrl = `${baseUrl}/blog/${slug}/`;

    const results = await Promise.allSettled([
        // Google Ping with sitemap
        fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(`${baseUrl}/sitemap.xml`)}`)
            .then(r => ({ engine: 'Google', ok: r.ok })),

        // IndexNow with the specific URL
        fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                host: new URL(baseUrl).hostname,
                key: process.env.INDEXNOW_KEY || 'hyzenpro',
                keyLocation: `${baseUrl}/indexnow-key.txt`,
                urlList: [postUrl],
            }),
        }).then(r => ({ engine: 'IndexNow', ok: r.ok })),
    ]);

    console.debug(`[SEO] Pinged search engines for new post: ${slug}`);
    return results;
}
