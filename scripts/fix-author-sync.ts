import prisma from '@/lib/prisma';

async function main() {
    const posts = await prisma.post.findMany({
        where: { authorId: { not: null } },
        include: { authorModel: { select: { name: true } } },
    });

    let fixed = 0;

    for (const post of posts) {
        if (post.authorModel && post.author !== post.authorModel.name) {
            await prisma.post.update({
                where: { id: post.id },
                data: { author: post.authorModel.name },
            });
            console.log(`Fixed: "${post.title}" — "${post.author}" → "${post.authorModel.name}"`);
            fixed++;
        }
    }

    console.log(`\nDone. ${fixed} post(s) corrected out of ${posts.length} checked.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
