import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting sync of category tool counts and relationships...');

    // Fetch all categories and tools
    const categories = await prisma.category.findMany();
    const tools = await prisma.tool.findMany();

    console.log(`Loaded ${categories.length} categories and ${tools.length} tools.`);

    for (const category of categories) {
        // Find all tools associated with this category
        const associatedTools = tools.filter(tool => {
            const isPrimary = tool.primaryCategory === category.slug;
            const inIds = tool.categoryIds.includes(category.id);
            return isPrimary || inIds;
        });

        const toolIds = associatedTools.map(t => t.id);
        const toolCount = toolIds.length;

        console.log(`Category "${category.name}" (${category.slug}): Found ${toolCount} associated tools.`);

        // Also ensure that each tool has this category in its categoryIds
        for (const tool of associatedTools) {
            if (!tool.categoryIds.includes(category.id)) {
                console.log(`  Updating tool "${tool.name}" to include category ID "${category.id}"`);
                const updatedIds = Array.from(new Set([...tool.categoryIds, category.id]));
                await prisma.tool.update({
                    where: { id: tool.id },
                    data: {
                        categoryIds: updatedIds
                    }
                });
                // update local tool object
                tool.categoryIds = updatedIds;
            }
        }

        // Update category relationship and count
        await prisma.category.update({
            where: { id: category.id },
            data: {
                toolIds: toolIds,
                toolCount: toolCount
            }
        });
    }

    console.log('Sync of category counts and relationships complete!');
}

main()
    .catch((error) => {
        console.error('Error during sync:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
