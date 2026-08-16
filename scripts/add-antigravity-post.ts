import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Inserting Google Antigravity 2.0 Review blog post...');

    const slug = 'google-antigravity-2-review';
    
    // Find an author if exists, or use null
    let authorId: string | undefined = undefined;
    try {
        const author = await prisma.author.findFirst();
        if (author) {
            authorId = author.id;
            console.log(`Found author to link: ${author.name} (${author.id})`);
        }
    } catch (e) {
        console.log('No author found or error querying author, using default author string.');
    }

    const postData = {
        title: "Google Antigravity 2.0 Review: The AI Agent Platform That Built an OS in 12 Hours",
        slug: slug,
        excerpt: "Google's new AI agent platform built a working OS in 12 hours using 93 parallel agents and Gemini 3.5 Flash — for under $1,000. Full in-depth review of Google Antigravity 2.0.",
        content: `
            <p>Google just raised the bar for what an AI development platform can do — and it did it live on stage at <strong>Google I/O 2026</strong>. The star of the show was <strong>Google Antigravity 2.0</strong>, a brand-new standalone desktop app built from the ground up to orchestrate multiple autonomous AI agents working in parallel.</p>
            <p>To prove it, Google's team used Antigravity 2.0 and Gemini 3.5 Flash to <strong>build a functioning operating system from scratch in under 12 hours</strong> — 93 parallel sub-agents, 2.6 billion tokens, all for less than $1,000 in API credits. Then they ran Doom on it.</p>
        `,
        categories: ['Agentic AI', 'AI Tools'],
        tags: ['Google Antigravity', 'Agentic AI', 'Google I/O 2026', 'Gemini 3.5 Flash', 'Software Engineering'],
        author: 'HyzenPro Team',
        authorId: authorId,
        status: 'published',
        publishedAt: new Date(),
        postType: 'review',
        readingTime: 8,
        featuredImage: 'https://hyzenpro.com/media/6a0cd85f260a9268d663e19e/google-antigravity.png',
        seo: {
            metaTitle: "Google Antigravity 2.0 Review: 93 Parallel Agents Built a Working OS in 12 Hours | HyzenPro",
            metaDescription: "Google's new AI agent platform built a working OS in 12 hours using 93 parallel agents and Gemini 3.5 Flash — for under $1,000. Full in-depth review of Google Antigravity 2.0.",
            canonicalUrl: `https://hyzenpro.com/blog/${slug}/`,
            ogImage: 'https://hyzenpro.com/media/6a0cd85f260a9268d663e19e/google-antigravity.png',
            ogTitle: "Google Antigravity 2.0 Review: 93 Parallel Agents Built a Working OS in 12 Hours",
            ogDescription: "Google's new AI agent platform built a working OS in 12 hours using 93 parallel agents and Gemini 3.5 Flash — for under $1,000.",
            twitterCard: "summary_large_image",
            focusKeyword: "Google Antigravity 2.0 review"
        }
    };

    const post = await prisma.post.upsert({
        where: { slug },
        update: {
            title: postData.title,
            excerpt: postData.excerpt,
            content: postData.content,
            categories: postData.categories,
            tags: postData.tags,
            status: postData.status,
            postType: postData.postType,
            readingTime: postData.readingTime,
            publishedAt: postData.publishedAt,
            authorId: postData.authorId,
            featuredImage: postData.featuredImage,
            seo: postData.seo
        },
        create: postData
    });

    console.log(`Success! Post upserted: ${post.title} (${post.id})`);
}

main()
    .catch((error) => {
        console.error('Error upserting post:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
