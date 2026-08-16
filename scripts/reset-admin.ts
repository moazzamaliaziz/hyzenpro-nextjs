import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdmin() {
    console.log('Starting admin password reset...');

    const adminEmail = 'admin@hyzenpro.com';
    const nextPassword = process.env.ADMIN_NEW_PASSWORD;
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!nextPassword) {
        throw new Error('Set ADMIN_NEW_PASSWORD before running this reset script.');
    }

    const hashedPassword = await bcrypt.hash(nextPassword, 12);

    if (existingAdmin) {
        console.log('Admin user exists. Resetting password and clearing 2FA enrollment.');
        await prisma.user.update({
            where: { email: adminEmail },
            data: {
                password: hashedPassword,
                mustChangePassword: true,
                isTwoFactorEnabled: false,
                twoFactorSecret: null,
                failedSignInAttempts: 0,
                lockoutUntil: null,
                passwordChangedAt: null,
            },
        });
        console.log('Admin password successfully changed.');
        console.log('2FA temporarily disabled until the admin completes re-enrollment.');
    } else {
        console.log('Admin user missing. Creating a fresh master admin.');
        await prisma.user.create({
            data: {
                name: 'HyzenPro Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isTwoFactorEnabled: false,
                mustChangePassword: true,
                failedSignInAttempts: 0,
                lockoutUntil: null,
            },
        });
        console.log('Admin user successfully created.');
    }

    console.log('Reset finished successfully. Sign in and complete password rotation plus 2FA setup.');
}

resetAdmin()
    .catch((error) => {
        console.error('Error during reset:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
