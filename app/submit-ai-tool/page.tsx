import type { Metadata } from 'next';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import SubmitAiToolLeadForm from '@/components/forms/SubmitAiToolLeadForm';
import { ShieldCheck, Clock, Zap } from 'lucide-react';
import prisma from '@/lib/prisma';

export const metadata: Metadata = {
    title: 'Submit AI Tool | HyzenPro',
    description:
        'Submit your AI tool to HyzenPro for editorial review. Send a clean product brief, contact details, and review notes through a structured public intake form.',
    alternates: {
        canonical: '/submit-ai-tool/',
    },
    openGraph: {
        url: '/submit-ai-tool/',
        title: 'Submit AI Tool | HyzenPro',
        description:
            'A cleaner public intake for AI tool founders and teams who want a serious editorial listing review.',
        type: 'website',
    },
};

async function getDirectorySignals() {
    try {
        const [toolCount, categoryCount] = await Promise.all([
            prisma.tool.count({ where: { status: 'published' } }),
            prisma.category.count(),
        ]);

        return { toolCount, categoryCount };
    } catch {
        return { toolCount: 0, categoryCount: 0 };
    }
}

const processPoints = [
    {
        icon: ShieldCheck,
        title: 'Editorial review, not instant publishing',
        desc: 'Every submission is reviewed by a real editor. Nothing goes live without a human check.',
    },
    {
        icon: Clock,
        title: '5-day turnaround',
        desc: 'Expect a response within 5 business days — either a publish notice or a short list of edits.',
    },
    {
        icon: Zap,
        title: 'Draft saved instantly',
        desc: 'Your submission saves as you type. Close the tab and come back — your progress is kept locally.',
    },
];

export default async function SubmitToolPage() {
    const { toolCount, categoryCount } = await getDirectorySignals();

    return (
        <>
            <main id="main-content" tabIndex={-1} className="min-h-screen bg-background pb-24">
                {/* Hero backdrop */}
                <div className="bg-hero-gradient px-4 pb-12 pt-28 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <Breadcrumbs
                            items={[{ label: 'Submit AI Tool', href: '/submit-ai-tool/' }]}
                            className="mb-8"
                        />

                        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
                            <div>
                                <div className="inline-flex rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/60">
                                    Editorial submission desk
                                </div>
                                <h1 className="mt-5 font-serif text-5xl leading-tight tracking-tight md:text-6xl">
                                    Submit your AI tool through a form that feels built for real review work.
                                </h1>
                                <p className="mt-5 max-w-3xl text-base leading-8 text-foreground/65 md:text-lg">
                                    This intake is designed for founders and product teams who want a clean path into the
                                    directory. It collects the details the HyzenPro editors actually need, without the
                                    noisy landing-page treatment that usually gets in the way.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                                <div className="rounded-2xl border border-foreground/10 bg-card/80 p-5">
                                    <div className="text-3xl font-serif">{toolCount}+</div>
                                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
                                        Published tools
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-foreground/10 bg-card/80 p-5">
                                    <div className="text-3xl font-serif">{categoryCount}+</div>
                                    <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/50">
                                        Categories
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-foreground bg-foreground p-5 text-primary-foreground">
                                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-foreground/60">
                                        Review inbox
                                    </div>
                                    <div className="mt-2 text-lg font-semibold">submissions@hyzenpro.com</div>
                                    <p className="mt-3 text-sm leading-7 text-primary-foreground/70">
                                        Submission alerts route here for editorial review.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form section */}
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        {/* Mobile-only sidebar (below lg) */}
                        <div className="py-12 lg:hidden">
                            <div className="space-y-6">
                                <div className="rounded-2xl border border-foreground/10 bg-card/80 p-6">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
                                        What this intake does well
                                    </p>
                                    <div className="mt-5 space-y-5">
                                        {processPoints.map((pt) => (
                                            <div key={pt.title} className="flex items-start gap-3">
                                                <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-foreground/5 text-foreground/70">
                                                    <pt.icon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">{pt.title}</p>
                                                    <p className="mt-1 text-[13px] leading-6 text-foreground/60">
                                                        {pt.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-foreground/10 bg-background p-6">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/55">
                                        Review checklist
                                    </p>
                                    <ul className="mt-5 space-y-3">
                                        {[
                                            'Working website URL with a real product page',
                                            'Specific short description written for buyers, not search bots',
                                            'Primary category that matches the product\u2019s main use case',
                                            'Feature highlights and review notes that help editorial review move faster',
                                        ].map((item) => (
                                            <li key={item} className="flex items-start gap-2 text-sm leading-7 text-foreground/65">
                                                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/30" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="py-12">
                            <SubmitAiToolLeadForm />
                        </div>

                        {/* ── Why Submit ─────────────────────────────────── */}
                        <section className="border-t border-foreground/10 py-16">
                            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
                                Why Submit Your AI Tool to HyzenPro
                            </h2>
                            <div className="mt-6 max-w-3xl space-y-4 text-[15px] leading-8 text-foreground/65">
                                <p>
                                    HyzenPro is a growing{' '}
                                    <a href="/ai-tools-directory/" className="underline underline-offset-2 hover:text-foreground transition-colors">
                                        AI tools directory
                                    </a>{' '}
                                    covering 124+ AI tools across 18+ categories, built for creators, marketers, developers, and lean teams
                                    comparing software before they buy. Getting your AI tool listed here puts it in front of buyers who are
                                    actively researching — not just browsing.
                                </p>
                                <p>
                                    Unlike auto-approve directories, every submission goes through editorial review: a real person checks
                                    your product URL, positioning, and category fit before anything publishes. That means a listing on
                                    HyzenPro carries more weight with both readers and search engines, since it&apos;s backed by human
                                    verification rather than a scraped database entry.
                                </p>
                                <p>
                                    If you&apos;re launching a new AI product, listing it in a curated AI software directory is one of the
                                    simplest ways to earn a relevant backlink, reach in-market buyers, and start showing up in tool
                                    comparison searches. The process takes a few minutes: share your tool name, tagline, live URL,
                                    category, and pricing model, and our editors handle the rest.
                                </p>
                                <p>
                                    Want to understand how we evaluate submissions? Read{' '}
                                    <a href="/how-we-test/" className="underline underline-offset-2 hover:text-foreground transition-colors">
                                        how we test and review tools
                                    </a>{' '}
                                    before listing them in the directory.
                                </p>
                            </div>
                        </section>

                        {/* ── FAQ ─────────────────────────────────────────── */}
                        <section className="border-t border-foreground/10 py-16">
                            <h2 className="font-serif text-3xl tracking-tight md:text-4xl">
                                Frequently Asked Questions
                            </h2>
                            <div className="mt-8 max-w-3xl">
                                {[
                                    {
                                        q: 'How long does it take to get an AI tool reviewed and published?',
                                        a: 'Most submissions get a response within 5 business days — either a publish confirmation or a short list of edits needed before your AI tool listing goes live.',
                                    },
                                    {
                                        q: 'What do I need ready before I submit my AI tool?',
                                        a: 'A live product URL (not a waitlist page), a short buyer-focused description, the correct primary category, and a few feature highlights that help our editors understand what the tool actually does.',
                                    },
                                    {
                                        q: 'Is every AI tool automatically listed after submission?',
                                        a: 'No. HyzenPro uses editorial review, not instant publishing — a human editor checks each submission before it appears in the directory, which is what keeps the listings trustworthy for readers.',
                                    },
                                ].map((item, i) => (
                                    <div key={i} className={`py-5 ${i > 0 ? 'border-t border-foreground/10' : ''}`}>
                                        <h3 className="font-serif text-lg">{item.q}</h3>
                                        <p className="mt-2 text-[15px] leading-7 text-foreground/65 max-w-2xl">{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: [
                            {
                                '@type': 'Question',
                                name: 'How long does it take to get an AI tool reviewed and published?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'Most submissions get a response within 5 business days — either a publish confirmation or a short list of edits needed before your AI tool listing goes live.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'What do I need ready before I submit my AI tool?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'A live product URL (not a waitlist page), a short buyer-focused description, the correct primary category, and a few feature highlights that help our editors understand what the tool actually does.',
                                },
                            },
                            {
                                '@type': 'Question',
                                name: 'Is every AI tool automatically listed after submission?',
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: 'No. HyzenPro uses editorial review, not instant publishing — a human editor checks each submission before it appears in the directory, which is what keeps the listings trustworthy for readers.',
                                },
                            },
                        ],
                    }),
                }}
            />
        </>
    );
}
