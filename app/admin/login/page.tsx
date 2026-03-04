import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import LoginForm from './LoginForm';

export const metadata = {
    title: 'Admin Login - HyzenPro',
};

export default async function LoginPage() {
    const session = await auth();

    // Redirect to admin dashboard if already logged in
    if (session?.user) {
        redirect('/admin');
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <h1 className="font-heading text-4xl text-white mb-2">HyzenPro Admin</h1>
                    <p className="text-white/40">Sign in to manage the directory</p>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 backdrop-blur-xl">
                    <LoginForm />
                </div>
            </div>
        </div>
    );
}
