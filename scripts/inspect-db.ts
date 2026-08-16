import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Querying categories...');
    const categories = await prisma.category.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
        }
    });
    console.log('Categories in DB:');
    console.log(JSON.stringify(categories, null, 2));

    console.log('\nQuerying existing tools to check tags and features...');
    const tools = await prisma.tool.findMany({
        select: {
            name: true,
            slug: true,
            features: true,
            pricingType: true,
        },
        take: 5
    });
    console.log('Sample tools in DB:');
    console.log(JSON.stringify(tools, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
