/**
 * Create an admin user for login
 * Run: node scripts/create-admin.mjs
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@hyzenpro.com';
    const password = 'HyzenPro2026!';
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword },
        create: {
            email,
            name: 'Admin',
            password: hashedPassword,
            role: 'admin',
        },
    });

    console.log('✅ Admin user created/updated:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   ID:       ${user.id}`);

    await prisma.$disconnect();
}

main().catch(console.error);
