import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { needsAdminSecuritySetup } from '@/lib/admin-security';
import prisma from '@/lib/prisma';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Not authenticated — render login page without sidebar
    // proxy.ts already handles redirecting protected pages to /admin
    if (!isAdminSession(session)) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                {children}
            </div>
        );
    }

    const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            role: true,
            isTwoFactorEnabled: true,
            mustChangePassword: true,
        },
    });

    // Authenticated but needs security setup (2FA, password change) — render without sidebar
    if (needsAdminSecuritySetup(adminUser)) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                {children}
            </div>
        );
    }

    // Fully authenticated admin — render with sidebar
    return (
        <div className="min-h-screen bg-black text-white flex">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen bg-black">
                <div className="p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}