import Link from 'next/link';
import prisma from '@/lib/prisma';

async function getLatestPost() {
    try {
        const post = await prisma.post.findFirst({
            where: { status: 'published' },
            orderBy: { publishedAt: 'desc' },
            select: { slug: true, title: true },
        });
        return post;
    } catch {
        return null;
    }
}

export default async function AnnouncementBar() {
    const post = await getLatestPost();

    return (
        <div className="sticky top-0 z-[1001] w-full border-b border-foreground/5 bg-background/95 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0 text-foreground/40">New this week:</span>
                    {/* py-1 lifts this from a 16px-tall tap target to 24px (WCAG 2.5.8).
                        Padding rather than min-height so `truncate` keeps ellipsising. */}
                    <Link
                        href={post ? `/blog/${post.slug}/` : '/blog/'}
                        className="truncate py-1 font-semibold text-foreground transition hover:underline hover:underline-offset-2"
                    >
                        {post?.title || 'Latest blog post'}
                    </Link>
                </div>
                <div className="hidden shrink-0 items-center gap-3 text-foreground/40 sm:flex">
                    <Link href="/blog/" className="transition hover:text-foreground">
                        Newsletter
                    </Link>
                    <span>·</span>
                    <span>hyzenpro.com</span>
                </div>
            </div>
        </div>
    );
}
