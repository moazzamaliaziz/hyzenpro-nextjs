import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ToolCard from '@/components/tools/ToolCard';
import { Share2, Box, ArrowRight } from 'lucide-react';
import { buildAdminLoginUrl } from '@/lib/admin';

export const metadata = {
    title: 'My Tech Stack | HyzenPro',
    description: 'Manage and share your personalized AI Tech Stack.',
    robots: { index: false, follow: false },
};

export default async function MyStackPage() {
    const session = await auth();

    if (!session?.user?.email) {
        redirect(buildAdminLoginUrl('/my-stack'));
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { savedToolIds: true, name: true }
    });

    if (!user) {
        redirect(buildAdminLoginUrl('/my-stack'));
    }

    // Fetch the actual tools
    const savedTools = await prisma.tool.findMany({
        where: {
            id: {
                in: user.savedToolIds
            },
            status: 'published'
        }
    });

    return (
        <main className="min-h-screen pt-32 pb-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-gray-100 pb-8">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full mb-4">
                            <Box className="w-4 h-4 text-black" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-600">Personalized</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-heading text-black mb-3">
                            My Tech Stack
                        </h1>
                        <p className="text-gray-500 max-w-xl">
                            A curated list of your favorite AI tools and resources. Build your stack to streamline your workflow and share it with your team.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white text-sm font-bold uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share Stack
                        </button>
                    </div>
                </div>

                {/* Content */}
                {savedTools.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 bg-gray-50/50 border border-gray-100 rounded-3xl text-center">
                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <Box className="w-6 h-6 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-heading text-black mb-3">Your stack is empty</h2>
                        <p className="text-gray-500 max-w-md mb-8">
                            You haven't added any tools to your personalized tech stack yet. Explore our directory to find the best AI tools for your needs.
                        </p>
                        <Link
                            href="/ai-tools-directory"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white font-bold uppercase tracking-widest rounded-lg hover:bg-gray-800 transition-all group"
                        >
                            Explore Directory
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {savedTools.map(tool => (
                            <ToolCard key={tool.id} tool={tool as any} />
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
