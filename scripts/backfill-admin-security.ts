import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Backfilling admin security fields...');

    const adminResult = await prisma.user.updateMany({
        where: { role: 'admin' },
        data: {
            mustChangePassword: true,
            failedSignInAttempts: 0,
            lockoutUntil: null,
        },
    });

    const memberResult = await prisma.user.updateMany({
        where: { role: { not: 'admin' } },
        data: {
            mustChangePassword: false,
            failedSignInAttempts: 0,
            lockoutUntil: null,
        },
    });

    console.log(`Admins updated: ${adminResult.count}`);
    console.log(`Non-admin users updated: ${memberResult.count}`);
    console.log('Backfill completed successfully.');
}

main()
    .catch((error) => {
        console.error('Backfill failed:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
