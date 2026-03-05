import fs from 'fs';
import readline from 'readline';

async function parseDump() {
    console.log('Starting parse...');
    const fileStream = fs.createReadStream('F:/main theme files/u877492871_IIX2y.20260227173427.sql/u877492871_IIX2y.sql');

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    const postTypes = new Set();
    let postsCount = 0;

    for await (const line of rl) {
        if (line.includes('INSERT INTO `wp_posts`') || line.includes('INSERT INTO wp_posts')) {
            // Very hacky parse just to find post types
            const matches = line.match(/\(.*?\)/g);
            if (matches) {
                matches.forEach(m => {
                    const parts = m.split(',');
                    if (parts.length > 20) {
                        // post_type is around the 21st column in standard wp_posts
                        const pType = parts.find(p => p.includes('egns-')); // AI Tools in this theme might start with egns-
                        const fallbackPType = parts[20]?.replace(/['"]/g, '').trim();
                        postTypes.add(pType ? pType.replace(/['"]/g, '').trim() : fallbackPType);
                        postsCount++;
                    }
                });
            }
        }
    }

    console.log(`Found ${postsCount} post objects.`);
    console.log('Post Types found:', Array.from(postTypes));
}

parseDump().catch(console.error);
