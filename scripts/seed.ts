import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // 1. Create Admin User
    const adminEmail = 'admin@hyzenpro.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('hyzenpro2026', 10);
        await prisma.user.create({
            data: {
                name: 'HyzenPro Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            },
        });
        console.log(`✅ Admin user created: ${adminEmail} (password: hyzenpro2026)`);
    } else {
        console.log(`⏭️ Admin user already exists: ${adminEmail}`);
    }

    // 2. Create Categories
    const categories = [
        { name: 'AI Video Tools', slug: 'ai-video-tools', icon: '🎬' },
        { name: 'AI Image Tools', slug: 'ai-image-tools', icon: '🖼️' },
        { name: 'AI Writing Tools', slug: 'ai-writing-tools', icon: '✍️' },
        { name: 'AI Coding Tools', slug: 'ai-coding-tools', icon: '💻' },
        { name: 'AI Automation Tools', slug: 'ai-automation-tools', icon: '⚡' },
        { name: 'AI Marketing Tools', slug: 'ai-marketing-tools', icon: '📈' },
        { name: 'SEO Tools', slug: 'seo-tools', icon: '🔍' },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: {
                name: cat.name,
                slug: cat.slug,
                icon: cat.icon,
                description: `Explore the best ${cat.name} to enhance your workflow.`,
            },
        });
    }
    console.log(`✅ Categories seeded (${categories.length})`);

    // Try to get some category IDs for tools
    const dbCategories = await prisma.category.findMany();
    const videoCat = dbCategories.find(c => c.slug === 'ai-video-tools');
    const imageCat = dbCategories.find(c => c.slug === 'ai-image-tools');
    const writingCat = dbCategories.find(c => c.slug === 'ai-writing-tools');

    // 3. Create Sample Tools
    const tools = [
        {
            name: 'Midjourney',
            slug: 'midjourney',
            shortDescription: 'Generate breathtaking AI art from simple text prompts via Discord.',
            longDescription: '<p>Midjourney is an independent research lab exploring new mediums of thought and expanding the imaginative powers of the human species.</p><p>It produces images from text prompts, similar to DALL-E and Stable Diffusion.</p>',
            websiteUrl: 'https://midjourney.com',
            pricingType: 'paid',
            status: 'published',
            featured: true,
            rating: 4.8,
            views: 12500,
            primaryCategory: 'ai-image-tools',
            categoryIds: imageCat ? [imageCat.id] : [],
            features: ['Text-to-Image Generation', 'Discord Integration', 'High Resolution Output', 'Style Presets'],
            pros: ['Incredible artistic quality', 'Photorealistic capabilities', 'Active community'],
            cons: ['Requires Discord to use', 'No free tier anymore', 'Learning curve for advanced prompting'],
        },
        {
            name: 'ChatGPT',
            slug: 'chatgpt',
            shortDescription: 'Advanced AI chatbot trained by OpenAI that interacts in a conversational way.',
            longDescription: '<p>ChatGPT is a sibling model to InstructGPT, which is trained to follow an instruction in a prompt and provide a detailed response.</p>',
            websiteUrl: 'https://chat.openai.com',
            pricingType: 'freemium',
            status: 'published',
            featured: true,
            rating: 4.9,
            views: 45000,
            primaryCategory: 'ai-writing-tools',
            categoryIds: writingCat ? [writingCat.id] : [],
            features: ['Conversational AI', 'Code Generation', 'Data Analysis', 'Image Generation (Plus)'],
            pros: ['Extremely versatile', 'Excellent free tier', 'Custom GPTs available'],
            cons: ['Can hallucinate facts', 'Data cutoff dates apply'],
        },
        {
            name: 'Synthesia',
            slug: 'synthesia',
            shortDescription: 'Create professional AI videos from text in 120+ languages.',
            longDescription: '<p>Synthesia is the #1 AI Video Creation Platform. Thousands of companies use it to create videos in 120 languages, saving up to 80% of their time and budget.</p>',
            websiteUrl: 'https://synthesia.io',
            pricingType: 'paid',
            status: 'published',
            featured: false,
            rating: 4.6,
            views: 8200,
            primaryCategory: 'ai-video-tools',
            categoryIds: videoCat ? [videoCat.id] : [],
            features: ['AI Avatars', 'Text-to-Video', 'Voiceovers in 120+ languages', 'Custom Avatars'],
            pros: ['High quality avatars', 'Easy to use interface', 'Great for training videos'],
            cons: ['Avatars can sometimes look slightly stiff', 'Expensive for heavy users'],
        }
    ];

    for (const tool of tools) {
        const existing = await prisma.tool.findUnique({ where: { slug: tool.slug } });
        if (!existing) {
            await prisma.tool.create({ data: tool });
        }
    }
    console.log(`✅ Sample tools seeded (${tools.length})`);

    // 4. Create Sample Post
    const postSlug = 'best-ai-image-generators';
    const existingPost = await prisma.post.findUnique({ where: { slug: postSlug } });

    if (!existingPost && adminEmail) {
        await prisma.post.create({
            data: {
                title: 'Top 5 AI Image Generators to Try in 2026',
                slug: postSlug,
                excerpt: 'Discover the best AI image generators available right now, comparing their pros, cons, and pricing.',
                content: '<p>AI image generation has exploded in popularity. From photorealistic portraits to concept art, these tools can create anything you imagine.</p><h2>1. Midjourney</h2><p>Midjourney remains the king of artistic expression...</p>',
                categories: ['Reviews', 'Comparisons'],
                tags: ['AI Art', 'Generative AI', 'Midjourney'],
                author: 'HyzenPro Team',
                status: 'published',
                publishedAt: new Date(),
                postType: 'post',
            }
        });
        console.log(`✅ Sample blog post created`);
    }

    console.log('🎉 Seeding finished successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
