import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Footer from '@/components/layout/Footer';
import AuthorBox from '@/components/eeat/AuthorBox';
import PostCard from '@/components/blog/PostCard';
import prisma from '@/lib/prisma';
import { getBaseUrl } from '@/lib/utils';
import { findEditorialAuthor } from '@/lib/editorial-authors';

type AuthorPageProps = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
    const { slug } = await params;
    const fallback = findEditorialAuthor(slug);

    let author = null;
    try {
        author = await prisma.author.findUnique({ where: { slug } });
    } catch {
        author = null;
    }

    if (!author && !fallback) {
        return { title: 'Author Not Found | HyzenPro' };
    }

    const name = author?.name || fallback?.name || 'HyzenPro Author';
    const description = author?.bio || fallback?.bio || 'HyzenPro author profile.';

    return {
        title: `${name} | HyzenPro Author`,
        description,
        alternates: {
            canonical: `${getBaseUrl()}/author/${slug}/`,
        },
        openGraph: {
            title: `${name} | HyzenPro Author`,
            description,
            url: `${getBaseUrl()}/author/${slug}/`,
            type: 'profile',
        },
    };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
    const { slug } = await params;
    const fallback = findEditorialAuthor(slug);

    let author = null;
    let posts: any[] = [];

    try {
        author = await prisma.author.findUnique({ where: { slug } });
        if (!author && !fallback) notFound();

        posts = await prisma.post.findMany({
            where: author
                ? { status: 'published', authorId: author.id }
                : { status: 'published', author: fallback?.name },
            orderBy: { publishedAt: 'desc' },
            take: 12,
            include: { authorModel: { select: { id: true, name: true, slug: true, image: true } } },
        });
    } catch {
        posts = [];
    }

    if (!author && !fallback) notFound();
    const fallbackAuthor = fallback!;

    const authorData = {
        name: author?.name || fallbackAuthor.name,
        role: author?.role || fallbackAuthor.role,
        bio: author?.bio || fallbackAuthor.bio,
        avatar: author?.image || fallbackAuthor.avatar,
        socialLinks: (author?.socialLinks as any) || fallbackAuthor.socialLinks,
    };

    return (
        <>
            <main className="min-h-screen pt-28 pb-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs
                        items={[
                            { label: 'Blog', href: '/blog/' },
                            { label: authorData.name },
                        ]}
                        className="mb-8"
                    />

                    <section className="mx-auto max-w-3xl text-center">
                        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                            HyzenPro Author
                        </p>
                        <h1 className="font-heading text-4xl text-black md:text-5xl">
                            {authorData.name}
                        </h1>
                        <p className="mt-4 text-lg leading-relaxed text-gray-600">{authorData.role}</p>
                    </section>

                    <div className="mx-auto mt-10 max-w-3xl">
                        <AuthorBox author={authorData} variant="full" />
                    </div>

                    {posts.length > 0 && (
                        <section className="mt-16">
                            <h2 className="mb-8 text-center font-heading text-3xl text-black">
                                Latest Articles by {authorData.name}
                            </h2>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {posts.map((post) => (
                                    <PostCard key={post.id} post={post} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}
