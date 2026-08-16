/**
 * Create or replace an admin user for login.
 * Run with: ADMIN_BOOTSTRAP_PASSWORD="your-temporary-password" node scripts/create-admin.mjs
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@hyzenpro.com';
    const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

    if (!password) {
        throw new Error('Set ADMIN_BOOTSTRAP_PASSWORD before running this script.');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            mustChangePassword: true,
            isTwoFactorEnabled: false,
            twoFactorSecret: null,
            failedSignInAttempts: 0,
            lockoutUntil: null,
            passwordChangedAt: null,
        },
        create: {
            email,
            name: 'Admin',
            password: hashedPassword,
            role: 'admin',
            mustChangePassword: true,
            isTwoFactorEnabled: false,
            failedSignInAttempts: 0,
            lockoutUntil: null,
        },
    });

    console.log('Admin user created or updated:');
    console.log(`  Email: ${email}`);
    console.log(`  ID: ${user.id}`);
    console.log('Password output is intentionally suppressed. Complete password rotation and 2FA setup after the first sign-in.');

    await prisma.$disconnect();
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
