import { redirect } from 'next/navigation';
import { buildAdminLoginUrl } from '@/lib/admin';

export const metadata = {
    title: 'Admin Login Redirect - HyzenPro',
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ callbackUrl?: string }>;
}) {
    const params = await searchParams;
    redirect(buildAdminLoginUrl(params.callbackUrl));
}
