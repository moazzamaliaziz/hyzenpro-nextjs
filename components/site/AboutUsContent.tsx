import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, CheckCircle2, GitCompare, Mail, Search, ShieldCheck, Sparkles, Target, Users } from 'lucide-react';

const sections = [
    { id: 'mission', title: 'Mission' },
    { id: 'team', title: 'Team' },
    { id: 'principles', title: 'Principles' },
    { id: 'process', title: 'Review Process' },
    { id: 'platform', title: 'Platform' },
    { id: 'contact', title: 'Contact' },
];

const team = [
    {
        name: 'Ali Malik',
        role: 'AI Tools Editor',
        email: 'alimalik@hyzenpro.com',
        image: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/02/naq1p620_ali-malik.png',
        bio: 'Ali Malik reviews AI software for creators, marketers, and small teams. His HyzenPro coverage focuses on hands-on workflow testing, pricing clarity, practical limitations, and how each tool fits into a real production stack.',
    },
    {
        name: 'Rana Aqib',
        role: 'AI Workflow Researcher',
        email: 'ranaaqib@hyzenpro.com',
        image: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/02/z98zdccq_rana-aqib.png',
        bio: 'Rana Aqib covers AI automation, video tools, coding assistants, and emerging productivity software. His reviews emphasize repeatable testing, buyer tradeoffs, and clear recommendations for different user types.',
    },
];

const principles = [
    {
        title: 'Useful Before Impressive',
        text: 'We care most about whether a tool helps real users finish work faster, with fewer hidden tradeoffs.',
        icon: Target,
    },
    {
        title: 'Clear About Limits',
        text: 'AI tools move quickly, so we call out pricing, workflow, privacy, and reliability limits where they matter.',
        icon: ShieldCheck,
    },
    {
        title: 'Built for Buyers',
        text: 'Our pages are structured around decisions: who should use a tool, who should skip it, and what to compare next.',
        icon: CheckCircle2,
    },
];

const process = [
    'Map the product category and the real jobs users are trying to complete.',
    'Check official pricing, public docs, product claims, and current feature availability.',
    'Test practical workflows where possible and compare against direct alternatives.',
    'Write verdicts with best-for, skip-if, pricing, limitations, and next-step links.',
    'Revisit important pages when tools, models, pricing, or product positioning changes.',
];

const platformFeatures = [
    {
        title: 'AI Tools Directory',
        text: 'Browse categorized AI tools with pricing, use cases, and practical summaries.',
        href: '/ai-tools-directory/',
        icon: Search,
    },
    {
        title: 'Tool Matcher',
        text: 'Answer workflow questions and get a tighter shortlist for your use case.',
        href: '/find-tools/',
        icon: Sparkles,
    },
    {
        title: 'Comparisons',
        text: 'Compare tools side by side before committing time or budget.',
        href: '/compare/',
        icon: GitCompare,
    },
    {
        title: 'AI Guides',
        text: 'Read buying guides, reviews, and category breakdowns built for busy teams.',
        href: '/blog/',
        icon: BookOpen,
    },
];

export default function AboutUsContent() {
    return (
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            <aside className="lg:sticky lg:top-24 lg:self-start">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">About Sections</p>
                <nav className="flex flex-col border-l border-gray-200" aria-label="About HyzenPro sections">
                    {sections.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="border-l border-transparent px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:border-black hover:text-black"
                        >
                            {section.title}
                        </a>
                    ))}
                </nav>
            </aside>

            <article className="max-w-4xl">
                <section id="mission" className="scroll-mt-28 border-b border-gray-100 pb-12">
                    <div className="grid gap-5 sm:grid-cols-3">
                        {[
                            ['Focused', 'Coverage'],
                            ['Hands-on', 'Review lens'],
                            ['Buyer-first', 'Recommendations'],
                        ].map(([value, label]) => (
                            <div key={label} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                <p className="font-heading text-2xl font-bold text-black">{value}</p>
                                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-gray-500">{label}</p>
                            </div>
                        ))}
                    </div>

                    <h2 className="mt-10 font-heading text-3xl font-bold text-black md:text-4xl">We help people choose AI tools without losing the week to research.</h2>
                    <div className="mt-6 space-y-4 text-base leading-8 text-gray-600">
                        <p>
                            HyzenPro exists because AI software buying has become noisy. New tools launch constantly,
                            pricing changes quickly, and many product pages sound similar even when the workflows are very different.
                        </p>
                        <p>
                            We organize that noise into focused reviews, comparison pages, category guides, and recommendation
                            flows for creators, marketers, founders, developers, and lean teams.
                        </p>
                    </div>
                </section>

                <section id="team" className="scroll-mt-28 border-b border-gray-100 py-12">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">People Behind HyzenPro</p>
                    <h2 className="mt-3 font-heading text-3xl font-bold text-black md:text-4xl">Research, review, and quality control are handled by real editors.</h2>

                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        {team.map((member) => (
                            <div key={member.email} className="rounded-2xl border border-gray-200 bg-white p-5">
                                <div className="flex items-start gap-4">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                                        <Image
                                            src={member.image}
                                            alt={member.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-xl font-bold text-black">{member.name}</h3>
                                        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">{member.role}</p>
                                    </div>
                                </div>
                                <p className="mt-5 text-sm leading-7 text-gray-600">{member.bio}</p>
                                <a
                                    href={`mailto:${member.email}`}
                                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-black underline underline-offset-4"
                                >
                                    <Mail className="h-4 w-4" aria-hidden="true" />
                                    {member.email}
                                </a>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="principles" className="scroll-mt-28 border-b border-gray-100 py-12">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Editorial Principles</p>
                    <h2 className="mt-3 font-heading text-3xl font-bold text-black md:text-4xl">The standard is practical clarity.</h2>

                    <div className="mt-8 grid gap-5 md:grid-cols-3">
                        {principles.map((principle) => (
                            <div key={principle.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                                <principle.icon className="h-5 w-5 text-black" aria-hidden="true" />
                                <h3 className="mt-4 text-sm font-bold text-black">{principle.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-gray-600">{principle.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section id="process" className="scroll-mt-28 border-b border-gray-100 py-12">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Review Process</p>
                    <h2 className="mt-3 font-heading text-3xl font-bold text-black md:text-4xl">How a page earns trust.</h2>
                    <ol className="mt-8 space-y-3">
                        {process.map((step, index) => (
                            <li key={step} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-black text-xs font-bold text-white">
                                    {index + 1}
                                </span>
                                <p className="text-sm leading-7 text-gray-600">{step}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="platform" className="scroll-mt-28 border-b border-gray-100 py-12">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-400">What You Can Use</p>
                    <h2 className="mt-3 font-heading text-3xl font-bold text-black md:text-4xl">More than a blog, less clutter than a software marketplace.</h2>

                    <div className="mt-8 grid gap-5 md:grid-cols-2">
                        {platformFeatures.map((feature) => (
                            <Link key={feature.href} href={feature.href} className="group rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-black">
                                <feature.icon className="h-5 w-5 text-black" aria-hidden="true" />
                                <h3 className="mt-4 flex items-center gap-2 text-sm font-bold text-black">
                                    {feature.title}
                                    <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                                </h3>
                                <p className="mt-3 text-sm leading-7 text-gray-600">{feature.text}</p>
                            </Link>
                        ))}
                    </div>
                </section>

                <section id="contact" className="scroll-mt-28 pt-12">
                    <div className="rounded-2xl bg-black p-6 text-white md:p-8">
                        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <Users className="mb-4 h-6 w-6 text-white" aria-hidden="true" />
                                <h2 className="font-heading text-2xl font-bold text-white">Want to work with HyzenPro?</h2>
                                <p className="mt-3 max-w-xl text-sm leading-7 text-white/70">
                                    Send corrections, partnership questions, vendor requests, or tool submissions. Clear context helps us respond faster.
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                                <Link href="/contact/" className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-gray-100">
                                    Contact Us
                                </Link>
                                <Link href="/submit-ai-tool/" className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                                    Submit a Tool
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </article>
        </div>
    );
}
