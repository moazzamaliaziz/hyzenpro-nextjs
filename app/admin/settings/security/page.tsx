import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import SecuritySettingsClient from './SecuritySettingsClient';

export const metadata = {
    title: 'Security Settings - HyzenPro Admin',
};

export default async function SecuritySettingsPage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/admin/login');
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            email: true,
            isTwoFactorEnabled: true,
        },
    });

    if (!user) {
        redirect('/admin/login');
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-3xl font-heading text-black dark:text-white">Security Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your account security and two-factor authentication.</p>
            </div>

            <SecuritySettingsClient isTwoFactorEnabled={user.isTwoFactorEnabled} />
        </div>
    );
}
