import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
    console.log('🌱 Starting admin password override...');

    const adminEmail = 'admin@hyzenpro.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    const hashedPassword = await bcrypt.hash('hyzenpro2026', 10);

    if (existingAdmin) {
        console.log(`⚠️ Admin user exists. Forcing password reset and disabling 2FA...`);
        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                password: hashedPassword,
                isTwoFactorEnabled: false,
                twoFactorSecret: null
            },
        });
        console.log(`✅ Admin password successfully changed to 'hyzenpro2026'`);
        console.log(`✅ 2FA temporarily disabled`);
    } else {
        console.log(`⚠️ Admin user missing in production. Creating a fresh master admin...`);
        await prisma.user.create({
            data: {
                name: 'HyzenPro Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isTwoFactorEnabled: false
            },
        });
        console.log(`✅ Admin user successfully created with password 'hyzenpro2026'`);
    }

    console.log('🎉 Reset finished successfully!');
}

resetAdmin()
    .catch((e) => {
        console.error('❌ Error during reset:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
