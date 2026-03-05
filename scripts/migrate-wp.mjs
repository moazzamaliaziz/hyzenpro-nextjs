/**
 * WordPress → MongoDB Migration Script
 * 
 * Parses the MySQL dump file and extracts:
 * 1. AI Tools from wp_ai_tools
 * 2. Categories from wp_ai_tool_categories  
 * 3. Category relationships from wp_ai_tool_category_relationships
 * 4. Tool features from wp_ai_tool_features
 * 5. Tool meta from wp_ai_tool_meta
 * 6. Blog posts from wp_posts (post_type='post', status='publish')
 * 7. SEO data from wp_aioseo_posts
 * 
 * Then inserts into MongoDB via Prisma.
 */

import fs from 'fs';
import readline from 'readline';

const SQL_FILE = 'F:/main theme files/u877492871_IIX2y.20260227173427.sql/u877492871_IIX2y.sql';

// ============================================================
// SQL VALUE PARSER — handles escaped quotes inside SQL strings
// ============================================================
function parseSqlValues(valuesStr) {
    const rows = [];
    let i = 0;

    while (i < valuesStr.length) {
        // Find start of a row '('
        while (i < valuesStr.length && valuesStr[i] !== '(') i++;
        if (i >= valuesStr.length) break;
        i++; // skip '('

        const cols = [];
        while (i < valuesStr.length && valuesStr[i] !== ')') {
            // skip whitespace
            while (i < valuesStr.length && valuesStr[i] === ' ') i++;

            if (valuesStr[i] === "'") {
                // Quoted string
                i++; // skip opening quote
                let val = '';
                while (i < valuesStr.length) {
                    if (valuesStr[i] === '\\' && i + 1 < valuesStr.length) {
                        // Escaped character
                        val += valuesStr[i + 1];
                        i += 2;
                    } else if (valuesStr[i] === "'") {
                        if (valuesStr[i + 1] === "'") {
                            // Double quote escape
                            val += "'";
                            i += 2;
                        } else {
                            i++; // skip closing quote
                            break;
                        }
                    } else {
                        val += valuesStr[i];
                        i++;
                    }
                }
                cols.push(val);
            } else if (valuesStr.substring(i, i + 4) === 'NULL') {
                cols.push(null);
                i += 4;
            } else {
                // Unquoted value (number)
                let val = '';
                while (i < valuesStr.length && valuesStr[i] !== ',' && valuesStr[i] !== ')') {
                    val += valuesStr[i];
                    i++;
                }
                cols.push(val.trim());
            }

            // Skip comma between values
            if (i < valuesStr.length && valuesStr[i] === ',') i++;
        }
        if (i < valuesStr.length) i++; // skip ')'

        if (cols.length > 0) rows.push(cols);

        // Skip comma/semicolon between rows
        while (i < valuesStr.length && (valuesStr[i] === ',' || valuesStr[i] === ';' || valuesStr[i] === '\n' || valuesStr[i] === '\r')) i++;
    }

    return rows;
}

// ============================================================
// EXTRACT DATA FROM SQL DUMP
// ============================================================
async function extractFromDump() {
    console.log('📂 Reading SQL dump file...');
    const content = fs.readFileSync(SQL_FILE, 'utf-8');
    console.log(`   File size: ${(content.length / 1024 / 1024).toFixed(1)}MB`);

    const data = {
        tools: [],
        categories: [],
        relationships: [],
        features: [],
        meta: [],
        posts: [],
        seo: []
    };

    // Extract wp_ai_tool_categories
    const catMatch = content.match(/INSERT INTO `wp_ai_tool_categories` VALUES\s*([\s\S]*?);/);
    if (catMatch) {
        const rows = parseSqlValues(catMatch[1]);
        // Columns: id, category_name, slug, parent_id, description, long_description, seo_content, icon, icon_class
        data.categories = rows.map(r => ({
            wpId: parseInt(r[0]),
            name: r[1],
            slug: r[2],
            parentId: r[3] ? parseInt(r[3]) : null,
            description: r[4] || '',
            longDescription: r[5] || '',
            seoContent: r[6] || '',
            icon: r[7] || '',
            iconClass: r[8] || ''
        }));
        console.log(`✅ Categories: ${data.categories.length}`);
    } else {
        console.log('⚠️  No wp_ai_tool_categories INSERT found');
    }

    // Extract wp_ai_tools
    const toolsMatch = content.match(/INSERT INTO `wp_ai_tools` VALUES\s*([\s\S]*?);/);
    if (toolsMatch) {
        const rows = parseSqlValues(toolsMatch[1]);
        // Columns: id, tool_name, slug, short_description, long_description, website_url, pricing_type, status, logo, featured, views, helpful_count, created_at, updated_at
        data.tools = rows.map(r => ({
            wpId: parseInt(r[0]),
            name: r[1],
            slug: r[2],
            shortDescription: r[3] || '',
            longDescription: r[4] || '',
            websiteUrl: r[5] || '',
            pricingType: r[6] || 'freemium',
            status: r[7] || 'published',
            logo: r[8] || '',
            featured: r[9] === '1',
            views: parseInt(r[10]) || 0,
            helpfulCount: parseInt(r[11]) || 0,
            createdAt: r[12],
            updatedAt: r[13]
        }));
        console.log(`✅ Tools: ${data.tools.length}`);
    } else {
        console.log('⚠️  No wp_ai_tools INSERT found');
    }

    // Extract wp_ai_tool_category_relationships
    const relMatch = content.match(/INSERT INTO `wp_ai_tool_category_relationships` VALUES\s*([\s\S]*?);/);
    if (relMatch) {
        const rows = parseSqlValues(relMatch[1]);
        // Columns: tool_id, category_id
        data.relationships = rows.map(r => ({
            toolId: parseInt(r[0]),
            categoryId: parseInt(r[1])
        }));
        console.log(`✅ Relationships: ${data.relationships.length}`);
    } else {
        console.log('⚠️  No wp_ai_tool_category_relationships INSERT found');
    }

    // Extract wp_ai_tool_features
    const featMatch = content.match(/INSERT INTO `wp_ai_tool_features` VALUES\s*([\s\S]*?);/);
    if (featMatch) {
        const rows = parseSqlValues(featMatch[1]);
        // Columns: id, tool_id, feature_text
        data.features = rows.map(r => ({
            id: parseInt(r[0]),
            toolId: parseInt(r[1]),
            featureText: r[2]
        }));
        console.log(`✅ Features: ${data.features.length}`);
    } else {
        console.log('⚠️  No wp_ai_tool_features INSERT found');
    }

    // Extract wp_ai_tool_meta
    const metaMatch = content.match(/INSERT INTO `wp_ai_tool_meta` VALUES\s*([\s\S]*?);/);
    if (metaMatch) {
        const rows = parseSqlValues(metaMatch[1]);
        // Columns: meta_id, tool_id, meta_key, meta_value
        data.meta = rows.map(r => ({
            metaId: parseInt(r[0]),
            toolId: parseInt(r[1]),
            metaKey: r[2],
            metaValue: r[3]
        }));
        console.log(`✅ Meta: ${data.meta.length}`);
    } else {
        console.log('⚠️  No wp_ai_tool_meta INSERT found');
    }

    // Extract wp_posts (blog posts only, not revisions/nav_menu etc)
    // The INSERT for wp_posts is huge, so we'll use a line-by-line approach
    console.log('📝 Extracting blog posts from wp_posts...');
    const postsInsertMatch = content.match(/INSERT INTO `wp_posts` VALUES\s*([\s\S]*?);(?=\n)/);
    if (postsInsertMatch) {
        const rows = parseSqlValues(postsInsertMatch[1]);
        // wp_posts columns (standard WordPress):
        // 0:ID, 1:post_author, 2:post_date, 3:post_date_gmt, 4:post_content, 5:post_title,
        // 6:post_excerpt, 7:post_status, 8:comment_status, 9:ping_status, 10:post_password,
        // 11:post_name, 12:to_ping, 13:pinged, 14:post_modified, 15:post_modified_gmt,
        // 16:post_content_filtered, 17:post_parent, 18:guid, 19:menu_order, 20:post_type,
        // 21:post_mime_type, 22:comment_count
        data.posts = rows
            .filter(r => r[20] === 'post' && r[7] === 'publish')
            .map(r => ({
                wpId: parseInt(r[0]),
                title: r[5],
                slug: r[11],
                content: r[4] || '',
                excerpt: r[6] || '',
                status: 'published',
                author: 'HyzenPro Team',
                publishedAt: r[2],
                updatedAt: r[14]
            }));
        console.log(`✅ Blog Posts: ${data.posts.length}`);
    } else {
        console.log('⚠️  No wp_posts INSERT found');
    }

    // Extract wp_aioseo_posts for SEO data
    const seoMatch = content.match(/INSERT INTO `wp_aioseo_posts` VALUES\s*([\s\S]*?);/);
    if (seoMatch) {
        const rows = parseSqlValues(seoMatch[1]);
        // Key columns: 0:id, 1:post_id, 2:title, 3:description, ... (varies by AIOSEO version)
        data.seo = rows.map(r => ({
            postId: parseInt(r[1]),
            title: r[2] || '',
            description: r[3] || ''
        }));
        console.log(`✅ SEO entries: ${data.seo.length}`);
    } else {
        console.log('⚠️  No wp_aioseo_posts INSERT found');
    }

    return data;
}

// ============================================================
// WRITE JSON OUTPUT (can be imported into MongoDB separately)
// ============================================================
async function main() {
    console.log('🚀 WordPress → MongoDB Migration\n');

    const data = await extractFromDump();

    // Build the tool objects with their relationships
    const toolCategoryMap = {};
    for (const rel of data.relationships) {
        if (!toolCategoryMap[rel.toolId]) toolCategoryMap[rel.toolId] = [];
        const cat = data.categories.find(c => c.wpId === rel.categoryId);
        if (cat) toolCategoryMap[rel.toolId].push(cat.slug);
    }

    const toolFeaturesMap = {};
    for (const feat of data.features) {
        if (!toolFeaturesMap[feat.toolId]) toolFeaturesMap[feat.toolId] = [];
        toolFeaturesMap[feat.toolId].push(feat.featureText);
    }

    const toolMetaMap = {};
    for (const m of data.meta) {
        if (!toolMetaMap[m.toolId]) toolMetaMap[m.toolId] = {};
        toolMetaMap[m.toolId][m.metaKey] = m.metaValue;
    }

    // Build final tools array
    const tools = data.tools.map(tool => {
        const meta = toolMetaMap[tool.wpId] || {};
        const categories = toolCategoryMap[tool.wpId] || [];
        const features = toolFeaturesMap[tool.wpId] || [];

        // Parse pros/cons from meta
        let pros = [];
        let cons = [];
        if (meta.pros) {
            try { pros = JSON.parse(meta.pros); } catch { pros = meta.pros.split('\n').filter(Boolean); }
        }
        if (meta.cons) {
            try { cons = JSON.parse(meta.cons); } catch { cons = meta.cons.split('\n').filter(Boolean); }
        }

        return {
            name: tool.name,
            slug: tool.slug,
            shortDescription: tool.shortDescription,
            longDescription: tool.longDescription,
            websiteUrl: tool.websiteUrl,
            pricingType: tool.pricingType,
            status: tool.status,
            logo: tool.logo,
            featured: tool.featured,
            views: tool.views,
            helpfulCount: tool.helpfulCount,
            features,
            primaryCategory: categories[0] || 'ai-general-tools',
            categories,
            meta: {
                pros,
                cons,
                rating: meta.rating ? parseFloat(meta.rating) : null,
                ...Object.fromEntries(
                    Object.entries(meta).filter(([k]) => !['pros', 'cons', 'rating'].includes(k))
                )
            },
            createdAt: tool.createdAt ? new Date(tool.createdAt) : new Date(),
            updatedAt: tool.updatedAt ? new Date(tool.updatedAt) : new Date()
        };
    });

    // Build final categories array
    const categories = data.categories.map(cat => ({
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        longDescription: cat.longDescription,
        seoContent: cat.seoContent,
        icon: cat.icon,
        iconClass: cat.iconClass
    }));

    // Build blog posts
    const posts = data.posts.map(post => ({
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        status: post.status,
        author: post.author,
        categories: ['Blog'],
        tags: [],
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : new Date(),
        updatedAt: post.updatedAt ? new Date(post.updatedAt) : new Date()
    }));

    // Save as JSON for inspection
    const output = { tools, categories, posts };
    const outputPath = 'F:/main theme files/hyzenpro-nextjs/scripts/migration-data.json';
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log(`\n📊 Migration Summary:`);
    console.log(`   Tools: ${tools.length}`);
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Blog Posts: ${posts.length}`);
    console.log(`\n💾 Data saved to: ${outputPath}`);
    console.log('\nNext step: Run import-to-mongo.mjs to push this data into your MongoDB database.');
}

main().catch(console.error);
