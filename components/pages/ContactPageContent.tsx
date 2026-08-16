import Link from 'next/link';
import { ArrowRight, Mail, Shield, Clock, MessageSquare, Handshake, LifeBuoy } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ContactPageForm from '@/components/forms/ContactPageForm';

const contactChannels = [
    {
        title: 'General inquiries',
        text: 'Questions about the site, editorial process, or where to start.',
        href: 'mailto:admin@hyzenpro.com',
        label: 'admin@hyzenpro.com',
        icon: Mail,
        color: 'bg-blue-50 text-blue-600',
    },
    {
        title: 'Partnerships',
        text: 'Reach out for thoughtful collaborations, audience partnerships, or sponsored opportunities.',
        href: 'mailto:admin@hyzenpro.com?subject=HyzenPro%20Partnership',
        label: 'Discuss partnerships',
        icon: Handshake,
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        title: 'Support and updates',
        text: 'Use this for listing fixes, broken pages, product updates, or submission follow-up.',
        href: 'mailto:admin@hyzenpro.com?subject=HyzenPro%20Support',
        label: 'Request support',
        icon: LifeBuoy,
        color: 'bg-violet-50 text-violet-600',
    },
];

const processSteps = [
    {
        n: '1',
        t: 'Fill out the form',
        d: 'Tell us who you are, what the message is about, and any useful context.',
    },
    {
        n: '2',
        t: 'We route internally',
        d: 'Your inquiry goes to the right person — editorial, partnerships, or support.',
    },
    {
        n: '3',
        t: 'Expect a reply',
        d: 'We aim to respond within 1 to 2 business days depending on the request.',
    },
];

const trustPoints = [
    {
        title: 'Clear routing',
        text: 'We ask for context so messages reach the right place faster.',
        icon: MessageSquare,
    },
    {
        title: 'Human responses',
        text: 'Important product, partnership, and support questions are handled by people, not autoresponder loops.',
        icon: Shield,
    },
    {
        title: 'Practical turnaround',
        text: 'We usually reply within 1 to 2 business days depending on the request type.',
        icon: Clock,
    },
];

const faqItems = [
    {
        question: 'What should I include in my message?',
        answer:
            'Share the page, tool, issue, or request involved plus any useful context or links so we can act faster.',
    },
    {
        question: 'Can I request a listing update here?',
        answer:
            'Yes. Use the form or email us with the tool name, the page URL if available, and the exact details that need changing.',
    },
    {
        question: 'Do you handle advertising or partnership requests?',
        answer:
            'Yes. Choose the relevant inquiry type and outline the partnership idea, timeline, and audience fit.',
    },
];

export default function ContactPageContent() {
    return (
        <>
            {/* Hero + gradient background */}
            <div className="bg-noise relative bg-hero-gradient">
                <main id="main-content" tabIndex={-1}>
                    <Breadcrumbs items={[{ label: 'Contact', href: '/contact/' }]} className="mx-auto max-w-6xl px-6 pt-28 pb-4" />

                    <section className="pb-24 pt-10">
                        <div className="mx-auto max-w-6xl px-6">
                            <p className="text-xs uppercase tracking-widest text-foreground/50">Contact HyzenPro</p>
                            <h1 className="mt-3 font-serif text-5xl md:text-7xl">
                                Reach the team <span className="italic text-foreground/60">with more context.</span>
                            </h1>
                            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-foreground/60">
                                Whether you need support, want to update a listing, or have a partnership idea, this page
                                routes messages cleanly and gets useful replies moving faster.
                            </p>
                        </div>
                    </section>
                </main>
            </div>

            {/* ═══ CONTACT CHANNELS ═══════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="channels-heading">
                <p className="text-xs uppercase tracking-widest text-foreground/50">How to reach us</p>
                <h2 id="channels-heading" className="mt-2 font-serif text-4xl md:text-5xl">Three ways to connect.</h2>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {contactChannels.map((channel) => (
                        <a
                            key={channel.title}
                            href={channel.href}
                            className="group rounded-2xl border border-foreground/10 bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg"
                        >
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${channel.color}`}>
                                <channel.icon className="h-3 w-3" /> {channel.title}
                            </span>
                            <p className="mt-4 text-sm text-foreground/60 leading-relaxed">{channel.text}</p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-foreground/80 group-hover:underline">
                                {channel.label} <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                        </a>
                    ))}
                </div>
            </section>

            {/* ═══ HOW IT WORKS ═══════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="process-heading">
                <p className="text-xs uppercase tracking-widest text-foreground/50">How it works</p>
                <h2 id="process-heading" className="mt-2 font-serif text-4xl md:text-5xl">Send a message, <span className="italic text-foreground/60">get a reply.</span></h2>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {processSteps.map((s) => (
                        <div key={s.n} className="rounded-2xl border border-foreground/10 bg-card p-6">
                            <p className="font-serif text-3xl text-foreground/30">{s.n}</p>
                            <h3 className="mt-2 text-lg font-semibold">{s.t}</h3>
                            <p className="mt-1 text-sm text-foreground/60">{s.d}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══ FORM + TRUST SIDEBAR ═══════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="form-heading">
                <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-start">
                    <aside className="space-y-6">
                        <div className="rounded-2xl border border-foreground/10 bg-foreground p-6 text-primary-foreground">
                            <p className="text-xs uppercase tracking-widest text-primary-foreground/50">Before You Send</p>
                            <h2 className="mt-3 font-serif text-3xl">Give us the practical details.</h2>
                            <p className="mt-3 text-sm leading-relaxed text-primary-foreground/70">
                                A link, tool name, problem summary, and desired outcome make support and editorial requests much easier to resolve.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-foreground/10 bg-card p-6">
                            <h2 className="font-serif text-2xl">What you can use this form for</h2>
                            <div className="mt-5 space-y-4">
                                {trustPoints.map((point) => (
                                    <div key={point.title} className="flex items-start gap-3">
                                        <point.icon className="mt-0.5 h-4 w-4 shrink-0 text-foreground/60" />
                                        <div>
                                            <p className="text-sm font-semibold">{point.title}</p>
                                            <p className="mt-1 text-sm leading-relaxed text-foreground/60">{point.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div id="form-heading" className="rounded-2xl border border-foreground/10 bg-card p-6 shadow-lg md:p-8">
                        <div className="mb-8 border-b border-foreground/10 pb-6">
                            <p className="text-xs uppercase tracking-widest text-foreground/50">Send a message</p>
                            <h2 className="mt-2 font-serif text-3xl md:text-4xl">Let&apos;s talk.</h2>
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/60">
                                Use the form below for support, listing changes, partnership ideas, press requests,
                                or general questions.
                            </p>
                        </div>
                        <ContactPageForm />
                    </div>
                </div>
            </section>

            {/* ═══ FAQ ═══════════════════════════════════════ */}
            <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="faq-heading">
                <p className="text-xs uppercase tracking-widest text-foreground/50">Contact FAQ</p>
                <h2 id="faq-heading" className="mt-2 font-serif text-4xl md:text-5xl">A few quick answers <span className="italic text-foreground/60">before you hit send.</span></h2>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {faqItems.map((item) => (
                        <div key={item.question} className="rounded-2xl border border-foreground/10 bg-card p-6">
                            <h3 className="text-lg font-semibold">{item.question}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-foreground/60">{item.answer}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-8">
                    <Link
                        href="/submit-ai-tool/"
                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-foreground/70 transition-opacity hover:opacity-70"
                    >
                        Need to submit a product instead?
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* ═══ DIRECT EMAIL CTA ═══════════════════════════════ */}
            <section className="relative overflow-hidden bg-foreground text-primary-foreground" aria-labelledby="direct-heading">
                <div className="mx-auto max-w-6xl px-6 py-20">
                    <p className="text-xs uppercase tracking-widest text-primary-foreground/50">Prefer email?</p>
                    <h2 id="direct-heading" className="mt-2 font-serif text-4xl md:text-5xl">The inbox is open.</h2>
                    <p className="mt-4 max-w-2xl text-primary-foreground/70">
                        For urgent context, reply chains, or when the form is unavailable, email works too.
                    </p>
                    <a
                        href="mailto:admin@hyzenpro.com"
                        className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:bg-primary-foreground/90"
                    >
                        <Mail className="h-4 w-4" />
                        admin@hyzenpro.com
                    </a>
                </div>
            </section>
            <Footer />
        </>
    );
}
