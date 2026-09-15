import prisma from '@/lib/prisma';

async function checkComposerPosts() {
  try {
    // Find all posts with "composer" in the slug or title
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { slug: { contains: 'composer' } },
          { title: { contains: 'Composer' } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        publishedAt: true,
        featuredImage: true,
        createdAt: true,
      },
    });

    console.log('Found posts:');
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Featured Image: ${post.featuredImage || 'NOT SET'}`);
      console.log(`   Published: ${post.publishedAt || 'NOT PUBLISHED'}`);
      console.log(`   ID: ${post.id}`);
    });
  } catch (error) {
    console.error('œ— Error checking posts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkComposerPosts();
