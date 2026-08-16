'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Check, ChevronLeft, ChevronRight, Sparkles, ShieldCheck, Clock, Command,
    Eye, Globe, Tag, DollarSign, ImageIcon, User, Star, Zap, HelpCircle,
    X, Loader2, Send, Twitter, Linkedin, Youtube, Github, Plus, GripVertical,
    CheckCircle2, CircleAlert, ArrowUpRight,
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

type Pricing = 'Free' | 'Freemium' | 'Free trial' | 'Paid' | 'Open source';
type Audience =
    | 'Creators & YouTubers' | 'Marketers & Growth' | 'Developers & Indie Hackers'
    | 'Founders & Small Teams' | 'Students & Educators' | 'Agencies & Consultancies';

// Valid categories aligned with live sitemap (/sitemap-tools.xml)
const CATEGORIES: { slug: string; label: string }[] = [
    { slug: 'ai-writing-tools',     label: 'AI Writing Tools' },
    { slug: 'ai-image-tools',       label: 'AI Image Tools' },
    { slug: 'ai-video-tools',       label: 'AI Video Tools' },
    { slug: 'ai-coding-tools',      label: 'AI Coding Tools' },
    { slug: 'ai-design-tools',      label: 'AI Design Tools' },
    { slug: 'ai-chatbots',          label: 'AI Chatbots' },
    { slug: 'ai-marketing-tools',   label: 'AI Marketing Tools' },
    { slug: 'ai-automation-tools',  label: 'AI Automation Tools' },
    { slug: 'seo-tools',            label: 'SEO Tools' },
    { slug: 'ai-general-tools',     label: 'AI General Tools' },
];
const DEFAULT_CATEGORY = 'ai-general-tools';

const PRICING_META: Record<Pricing, { label: string; hint: string; needsPrice: boolean }> = {
    'Free':        { label: 'Free',        hint: 'Forever free, no card',     needsPrice: false },
    'Freemium':    { label: 'Freemium',    hint: 'Free tier + paid plans',    needsPrice: true  },
    'Free trial':  { label: 'Free trial',  hint: 'Time-limited full access',  needsPrice: true  },
    'Paid':        { label: 'Paid',        hint: 'Paid from day one',         needsPrice: true  },
    'Open source': { label: 'Open source', hint: 'Self-host, license listed', needsPrice: false },
};
const PRICING_ORDER: Pricing[] = ['Free', 'Freemium', 'Free trial', 'Paid', 'Open source'];

const AUDIENCES: { key: Audience; blurb: string }[] = [
    { key: 'Creators & YouTubers',       blurb: 'Video, thumbnails, scripts, editing' },
    { key: 'Marketers & Growth',         blurb: 'Ads, SEO, lifecycle, analytics' },
    { key: 'Developers & Indie Hackers', blurb: 'Code gen, agents, infra, APIs' },
    { key: 'Founders & Small Teams',     blurb: 'Ops, hiring, docs, decks' },
    { key: 'Students & Educators',       blurb: 'Research, tutoring, notes' },
    { key: 'Agencies & Consultancies',   blurb: 'Client work, whitelabel, delivery' },
];

const ROLES = ['Founder / maker', 'Team member', 'Fan / user', 'Affiliate'] as const;

interface PricingTierForm {
    name: string;
    monthlyPrice: string;
    annualPrice: string;
    currency: string;
    billingPeriod: string;
    description: string;
    features: string[];
    limitations: string[];
    isPopular: boolean;
    badge: string;
    ctaLabel: string;
    ctaUrl: string;
    freeTrial: string;
    moneyBackGuarantee: string;
    notes: string;
}

interface FAQForm {
    question: string;
    answer: string;
}

const DEFAULT_CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'INR'];
const BILLING_PERIODS = ['monthly', 'yearly', 'one-time', 'usage-based', 'custom'];

function createEmptyTier(): PricingTierForm {
    return {
        name: '',
        monthlyPrice: '',
        annualPrice: '',
        currency: 'USD',
        billingPeriod: 'monthly',
        description: '',
        features: [],
        limitations: [],
        isPopular: false,
        badge: '',
        ctaLabel: 'Get Started',
        ctaUrl: '',
        freeTrial: '',
        moneyBackGuarantee: '',
        notes: '',
    };
}

interface FormData {
    name: string; tagline: string; website: string; logoUrl: string;
    category: string; audiences: Audience[]; description: string; keyFeatures: string[];
    pros: string[]; cons: string[];
    pricing: Pricing; startingPrice: string; hasFreeTier: boolean;
    pricingTiers: PricingTierForm[];
    faqs: FAQForm[];
    screenshots: string[]; demoVideo: string;
    submitterName: string; submitterEmail: string;
    submitterRole: (typeof ROLES)[number];
    socials: { twitter?: string; linkedin?: string; youtube?: string; github?: string };
    agreeGuidelines: boolean; agreeContact: boolean;
    reviewNotes: string;
}

const empty: FormData = {
    name: '', tagline: '', website: '', logoUrl: '',
    category: '', audiences: [], description: '', keyFeatures: [],
    pros: [], cons: [],
    pricing: 'Freemium', startingPrice: '', hasFreeTier: true,
    pricingTiers: [],
    faqs: [],
    screenshots: [], demoVideo: '',
    submitterName: '', submitterEmail: '', submitterRole: 'Founder / maker',
    socials: {}, agreeGuidelines: false, agreeContact: true, reviewNotes: '',
};

const STEPS = [
    { key: 'basics',  title: 'The essentials',   icon: Sparkles,   hint: 'Name, tagline & URL' },
    { key: 'details', title: 'Positioning',      icon: Tag,        hint: 'Category, audience, features' },
    { key: 'pricing', title: 'Pricing model',    icon: DollarSign, hint: 'How users pay' },
    { key: 'faqs',    title: 'FAQs',              icon: HelpCircle, hint: 'Common questions' },
    { key: 'media',   title: 'Media & proof',    icon: ImageIcon,  hint: 'Screenshots, demo video' },
    { key: 'contact', title: 'About you',        icon: User,       hint: 'Name, email, socials' },
    { key: 'review',  title: 'Review & publish',  icon: Eye,        hint: 'Final check' },
] as const;

const STORAGE_KEY = 'hzp:submit-draft:v2';
const RATE_KEY    = 'hzp:submit-last';

// ─── Validation ─────────────────────────────────────────────────────────────

const URL_RE = /^https?:\/\/[^\s]+\.[^\s]+/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(step: number, d: FormData): Record<string, string> {
    const e: Record<string, string> = {};
    if (step === 0) {
        if (!d.name.trim()) e.name = 'Give your tool a name.';
        else if (d.name.length > 60) e.name = 'Keep it under 60 characters.';
        if (!d.tagline.trim()) e.tagline = 'A one-line pitch helps readers scan.';
        else if (d.tagline.length > 90) e.tagline = 'Under 90 characters, please.';
        if (!d.website.trim()) e.website = 'A live URL is required.';
        else if (!URL_RE.test(d.website)) e.website = 'Use a full URL, e.g. https://…';
        if (d.logoUrl && !URL_RE.test(d.logoUrl)) e.logoUrl = 'Logo must be a full URL.';
    }
    if (step === 1) {
        if (!d.category) e.category = 'Pick the primary category.';
        if (d.audiences.length === 0) e.audiences = 'Select at least one audience.';
        if (d.description.trim().length < 80) e.description = 'At least 80 characters — help us understand it.';
        else if (d.description.length > 600) e.description = 'Trim to under 600 characters.';
        if (d.keyFeatures.filter((f) => f.trim()).length < 3) e.keyFeatures = 'Add at least 3 standout features.';
    }
    if (step === 2) {
        if (PRICING_META[d.pricing].needsPrice && !d.startingPrice.trim())
            e.startingPrice = 'Add a starting price (e.g. $19/mo).';
    }
    if (step === 3) {
        if (d.faqs.filter((f) => f.question.trim() && f.answer.trim()).length < 3)
            e.faqs = 'Please answer all 3 FAQs — both question and answer are required.';
    }
    if (step === 4) {
        if (d.demoVideo && !URL_RE.test(d.demoVideo)) e.demoVideo = 'Demo must be a full URL.';
        if (d.screenshots.some((s) => !URL_RE.test(s))) e.screenshots = 'Every screenshot needs a valid URL.';
        if (d.screenshots.length > 6) e.screenshots = 'Up to 6 screenshots.';
    }
    if (step === 5) {
        if (!d.submitterName.trim()) e.submitterName = 'Your name is required.';
        if (!EMAIL_RE.test(d.submitterEmail)) e.submitterEmail = 'Enter a valid email so we can reach you.';
    }
    if (step === 6) {
        if (!d.agreeGuidelines) e.agreeGuidelines = 'You must agree to the editorial guidelines.';
    }
    return e;
}

function completion(d: FormData): number {
    let filled = 0; const total = 17;
    if (d.name) filled++;
    if (d.tagline) filled++;
    if (URL_RE.test(d.website)) filled++;
    if (d.category) filled++;
    if (d.audiences.length) filled++;
    if (d.description.length >= 80) filled++;
    if (d.keyFeatures.filter(Boolean).length >= 3) filled++;
    if (d.pros.filter(Boolean).length >= 1) filled++;
    if (d.cons.filter(Boolean).length >= 1) filled++;
    if (!PRICING_META[d.pricing].needsPrice || d.startingPrice) filled++;
    if (d.faqs.filter((f) => f.question.trim() && f.answer.trim()).length >= 3) filled++;
    if (d.screenshots.length) filled++;
    if (d.submitterName) filled++;
    if (EMAIL_RE.test(d.submitterEmail)) filled++;
    if (d.agreeGuidelines) filled++;
    return Math.round((filled / total) * 100);
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SubmitAiToolLeadForm() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<FormData>(empty);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [visited, setVisited] = useState<Set<number>>(new Set([0]));
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const [rateBlocked, setRateBlocked] = useState<string | null>(null);
    const [serverError, setServerError] = useState('');

    const formRef = useRef<HTMLDivElement>(null);

    // Hydrate from localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setData({ ...empty, ...JSON.parse(raw) });
        } catch { /* ignore */ }
    }, []);

    // Autosave to localStorage
    useEffect(() => {
        const t = setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                setSavedAt(Date.now());
            } catch { /* ignore */ }
        }, 400);
        return () => clearTimeout(t);
    }, [data]);

    // Keyboard: Cmd/Ctrl+Enter to advance
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                if (step < STEPS.length - 1) next();
                else void submit();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [step, data]); // eslint-disable-line react-hooks/exhaustive-deps

    const total = STEPS.length;
    const pct = useMemo(() => completion(data), [data]);

    function update<K extends keyof FormData>(k: K, v: FormData[K]) {
        setData((d) => ({ ...d, [k]: v }));
    }

    function jumpTo(i: number) {
        if (i <= Math.max(...Array.from(visited))) {
            setStep(i);
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function next() {
        const e = validate(step, data);
        setErrors(e);
        if (Object.keys(e).length === 0) {
            setStep((s) => {
                const n = Math.min(s + 1, total - 1);
                setVisited((v) => new Set(v).add(n));
                return n;
            });
            formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function back() {
        setStep((s) => Math.max(s - 1, 0));
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function submit() {
        const e = validate(6, data);
        setErrors(e);
        if (Object.keys(e).length > 0) return;

        try {
            const last = Number(localStorage.getItem(RATE_KEY) || 0);
            if (Date.now() - last < 30_000) {
                setRateBlocked('Please wait a moment before submitting again.');
                return;
            }
        } catch { /* ignore */ }

        setRateBlocked(null);
        setServerError('');
        setSubmitting(true);

        try {
            const res = await fetch('/api/tool-submissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                    name: data.name,
                    tagline: data.tagline,
                    websiteUrl: data.website,
                    logoUrl: data.logoUrl,
                    category: data.category,
                    audiences: data.audiences,
                    description: data.description,
                    keyFeatures: data.keyFeatures.filter(Boolean),
                    pros: data.pros.filter(Boolean),
                    cons: data.cons.filter(Boolean),
                    pricing: data.pricing,
                    startingPrice: data.startingPrice,
                    hasFreeTier: data.hasFreeTier,
                    pricingTiers: data.pricingTiers.map((t) => ({
                        ...t,
                        monthlyPrice: t.monthlyPrice ? Number(t.monthlyPrice) || null : null,
                        annualPrice: t.annualPrice ? Number(t.annualPrice) || null : null,
                    })),
                    faqs: data.faqs.filter((f) => f.question.trim() && f.answer.trim()),
                    screenshots: data.screenshots,
                    demoVideo: data.demoVideo,
                    submitterName: data.submitterName,
                    submitterEmail: data.submitterEmail,
                    submitterRole: data.submitterRole,
                    socials: data.socials,
                    reviewNotes: data.reviewNotes,
                    agreeGuidelines: data.agreeGuidelines,
                    agreeContact: data.agreeContact,
                }),
            });

            const resData = await res.json();

            if (!res.ok) {
                setServerError(resData.error || 'Something went wrong. Please try again.');
                setSubmitting(false);
                return;
            }

            try { localStorage.setItem(RATE_KEY, String(Date.now())); } catch { /* ignore */ }
            setSubmitting(false);
            setSubmitted(true);
        } catch {
            setServerError('Network issue. Please try again.');
            setSubmitting(false);
        }
    }

    function clearDraft() {
        setData(empty);
        setErrors({});
        setVisited(new Set([0]));
        setStep(0);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }

    return (
        <div ref={formRef}>
            {/* ── Top-level layout: 1-col mobile → 2-col lg (stepper+form) → 3-col xl (stepper+form+preview) ── */}
            <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_340px]">

                {/* ── Sidebar: Stepper + Status ── */}
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-3xl border border-foreground/10 bg-card/95 p-5 shadow-[0_20px_60px_-40px_rgb(0,0,0,0.15)] backdrop-blur">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                                Step {step + 1} / {total}
                            </p>
                            <span className="text-[11px] font-medium text-foreground/50">{pct}% complete</span>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                            <div
                                className="h-full rounded-full bg-foreground transition-[width] duration-500"
                                style={{ width: `${((step + 1) / total) * 100}%` }}
                            />
                        </div>

                        <ol className="mt-5 space-y-1">
                            {STEPS.map((s, i) => {
                                const Icon = s.icon;
                                const done = i < step;
                                const active = i === step;
                                const reachable = i <= Math.max(...Array.from(visited));
                                return (
                                    <li key={s.key}>
                                        <button
                                            type="button"
                                            onClick={() => jumpTo(i)}
                                            disabled={!reachable}
                                            aria-current={active ? 'step' : undefined}
                                            className={[
                                                'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition',
                                                active ? 'bg-foreground text-primary-foreground' :
                                                done   ? 'text-foreground hover:bg-foreground/5' :
                                                         'text-foreground/50 hover:bg-foreground/5 disabled:cursor-not-allowed',
                                            ].join(' ')}
                                        >
                                            <span className={[
                                                'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold',
                                                active ? 'bg-primary-foreground/15 text-primary-foreground' :
                                                done   ? 'bg-emerald-500/15 text-emerald-700' :
                                                         'bg-foreground/5 text-foreground/60',
                                            ].join(' ')}>
                                                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-medium">{s.title}</span>
                                                <span className={['block truncate text-[11px]', active ? 'text-primary-foreground/70' : 'text-foreground/50'].join(' ')}>
                                                    {s.hint}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ol>

                        <div className="mt-5 flex items-center justify-between rounded-xl border border-foreground/10 bg-background/60 px-3 py-2 text-[11px] text-foreground/60">
                            <span className="flex items-center gap-1.5">
                                <span className={['h-1.5 w-1.5 rounded-full', savedAt ? 'bg-emerald-500' : 'bg-foreground/30'].join(' ')} />
                                {savedAt ? 'Draft saved' : 'New draft'}
                            </span>
                            <button type="button" onClick={clearDraft} className="hover:text-foreground transition-colors">Clear</button>
                        </div>
                        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-foreground/45">
                            <Command className="h-3 w-3" /> Press ⌘/Ctrl + ↵ to advance
                        </p>
                    </div>

                    <div className="mt-4 hidden rounded-3xl border border-foreground/10 bg-cream/60 p-5 lg:block">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/55">Need a hand?</p>
                        <p className="mt-2 text-sm text-foreground/70">
                            Founders: mention your launch date and we&apos;ll try to time the review for it.
                        </p>
                    <a href="mailto:submissions@hyzenpro.com" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline">
                        submissions@hyzenpro.com <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                    </div>
                </aside>

                {/* ── Form ── */}
                <div className="min-w-0">
                    <div className="rounded-3xl border border-foreground/10 bg-card p-6 shadow-[0_30px_80px_-60px_rgb(0,0,0,0.15)] md:p-8">
                        <StepHeader step={step} />

                        <div className="mt-6">
                            {step === 0 && <StepBasics  data={data} errors={errors} update={update} />}
                            {step === 1 && <StepDetails data={data} errors={errors} update={update} />}
                            {step === 2 && <StepPricing data={data} errors={errors} update={update} />}
                            {step === 3 && <StepFAQ     data={data} errors={errors} update={update} />}
                            {step === 4 && <StepMedia   data={data} errors={errors} update={update} />}
                            {step === 5 && <StepContact data={data} errors={errors} update={update} />}
                            {step === 6 && <StepReview  data={data} errors={errors} update={update} jump={jumpTo} />}
                        </div>

                        {rateBlocked && (
                            <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
                                <CircleAlert className="h-4 w-4 shrink-0" /> {rateBlocked}
                            </div>
                        )}

                        {serverError && (
                            <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700">
                                <CircleAlert className="h-4 w-4 shrink-0" /> {serverError}
                            </div>
                        )}
                    </div>

                    {/* Desktop action row */}
                    <div className="mt-5 hidden items-center justify-between md:flex">
                        <button type="button" onClick={back} disabled={step === 0}
                            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/5 disabled:opacity-40">
                            <ChevronLeft className="h-4 w-4" /> Back
                        </button>
                        {step < total - 1 ? (
                            <button type="button" onClick={next}
                                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                                Continue <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <button type="button" onClick={submit} disabled={submitting}
                                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60">
                                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <><Send className="h-4 w-4" /> Submit for review</>}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Live preview (xl+ only, third column) ── */}
                <aside className="hidden xl:block">
                    <div className="sticky top-24">
                        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/55">
                            <Eye className="h-3 w-3" /> Live preview
                        </p>
                        <PreviewCard data={data} />
                        <p className="mt-3 text-[11px] leading-relaxed text-foreground/50">
                            This is roughly how your listing will appear in the directory. Editors may refine copy for tone and clarity.
                        </p>
                    </div>
                </aside>

            </div>

            {/* Sticky mobile action bar */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                    <button type="button" onClick={back} disabled={step === 0}
                        className="inline-flex items-center gap-1 rounded-full border border-foreground/15 px-3 py-2 text-sm font-medium text-foreground/80 disabled:opacity-40">
                        <ChevronLeft className="h-4 w-4" /> Back
                    </button>
                    <span className="text-[11px] text-foreground/55">{step + 1}/{total} · {pct}%</span>
                    {step < total - 1 ? (
                        <button type="button" onClick={next}
                            className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-primary-foreground">
                            Continue <ChevronRight className="h-4 w-4" />
                        </button>
                    ) : (
                        <button type="button" onClick={submit} disabled={submitting}
                            className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Submit
                        </button>
                    )}
                </div>
            </div>

            {/* Success overlay */}
            {submitted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
                    <SuccessCard data={data} onReset={clearDraft} onClose={() => setSubmitted(false)} />
                </div>
            )}
        </div>
    );
}

// ─── Step Header ────────────────────────────────────────────────────────────

function StepHeader({ step }: { step: number }) {
    const s = STEPS[step];
    const Icon = s.icon;
    return (
        <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-foreground text-primary-foreground">
                <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">
                    Step {step + 1} · {s.hint}
                </p>
                <h2 className="mt-1 font-serif text-3xl leading-tight tracking-tight">{s.title}</h2>
            </div>
        </div>
    );
}

// ─── Shared Input Components ────────────────────────────────────────────────

function Field({
    label, hint, required, error, htmlFor, right, children,
}: {
    label: string; hint?: string; required?: boolean; error?: string;
    htmlFor?: string; right?: React.ReactNode; children: React.ReactNode;
}) {
    return (
        <div>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label htmlFor={htmlFor} className="text-sm font-medium text-foreground/85">
                    {label}{required && <span className="ml-0.5 text-rose-600">*</span>}
                </label>
                {right}
            </div>
            {children}
            {hint && !error && <p className="mt-1.5 text-[12px] text-foreground/50">{hint}</p>}
            {error && <p className="mt-1.5 flex items-center gap-1 text-[12px] text-rose-600"><CircleAlert className="h-3 w-3 shrink-0" /> {error}</p>}
        </div>
    );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
    const { invalid, className, ...rest } = props;
    return (
        <input
            {...rest}
            className={[
                'block w-full rounded-xl border bg-background/80 px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition',
                'placeholder:text-foreground/35 focus:ring-4 focus:ring-foreground/5',
                invalid ? 'border-rose-400 focus:border-rose-500' : 'border-foreground/15 focus:border-foreground/40',
                className || '',
            ].join(' ')}
        />
    );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
    const { invalid, className, ...rest } = props;
    return (
        <textarea
            {...rest}
            className={[
                'block w-full resize-y rounded-xl border bg-background/80 px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition',
                'placeholder:text-foreground/35 focus:ring-4 focus:ring-foreground/5',
                invalid ? 'border-rose-400 focus:border-rose-500' : 'border-foreground/15 focus:border-foreground/40',
                className || '',
            ].join(' ')}
        />
    );
}

function Counter({ value, max }: { value: number; max: number }) {
    const over = value > max;
    return (
        <span className={['text-[11px] tabular-nums', over ? 'text-rose-600' : 'text-foreground/45'].join(' ')}>
            {value}/{max}
        </span>
    );
}

// ─── Step 1: The Essentials ─────────────────────────────────────────────────

type StepProps = {
    data: FormData;
    errors: Record<string, string>;
    update: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
};

function StepBasics({ data, errors, update }: StepProps) {
    const favicon = useMemo(() => {
        try {
            const u = new URL(data.website);
            return `https://www.google.com/s2/favicons?domain=${u.hostname}&sz=64`;
        } catch { return null; }
    }, [data.website]);

    return (
        <div className="grid gap-5">
            <Field label="Tool name" required error={errors.name} htmlFor="name"
                right={<Counter value={data.name.length} max={60} />}>
                <TextInput id="name" placeholder="e.g. Submajic" value={data.name}
                    onChange={(e) => update('name', e.target.value)} invalid={!!errors.name} />
            </Field>

            <Field label="One-line tagline" required error={errors.tagline} htmlFor="tagline"
                right={<Counter value={data.tagline.length} max={90} />}>
                <TextInput id="tagline" placeholder="Auto-caption videos in 30+ languages"
                    value={data.tagline} onChange={(e) => update('tagline', e.target.value)} invalid={!!errors.tagline} />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
                <Field label="Website URL" required error={errors.website} htmlFor="website"
                    hint="Live product URL — not a waitlist page.">
                    <div className="relative">
                        <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <TextInput id="website" inputMode="url" placeholder="https://yourtool.com" className="pl-9"
                            value={data.website} onChange={(e) => update('website', e.target.value)} invalid={!!errors.website} />
                        {favicon && URL_RE.test(data.website) && (
                            <img src={favicon} alt="" className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded" />
                        )}
                    </div>
                </Field>
                <Field label="Logo URL" error={errors.logoUrl} htmlFor="logo"
                    hint="Square PNG/SVG, min 256px. Leave blank to auto-generate.">
                    <TextInput id="logo" inputMode="url" placeholder="https://yourtool.com/logo.png"
                        value={data.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} invalid={!!errors.logoUrl} />
                </Field>
            </div>
        </div>
    );
}

// ─── Step 2: Positioning ────────────────────────────────────────────────────

function StepDetails({ data, errors, update }: StepProps) {
    const [feat, setFeat] = useState('');
    const [pro, setPro] = useState('');
    const [con, setCon] = useState('');

    function addFeature(v: string) {
        const t = v.trim();
        if (!t) return;
        update('keyFeatures', [...data.keyFeatures, t].slice(0, 8));
        setFeat('');
    }

    function addToList(field: 'pros' | 'cons', value: string, setter: (v: string) => void) {
        const t = value.trim();
        if (!t) return;
        update(field, [...data[field], t].slice(0, 8));
        setter('');
    }

    function TagInput({ items, onAdd, onRemove, placeholder, error }: {
        items: string[]; onAdd: (v: string) => void; onRemove: (i: number) => void;
        placeholder: string; error?: string;
    }) {
        const [val, setVal] = useState('');
        return (
            <div>
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-foreground/15 bg-background/80 p-2">
                    {items.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-foreground">
                            {f}
                            <button type="button" aria-label={`Remove ${f}`} onClick={() => onRemove(i)}
                                className="ml-0.5 rounded-full p-0.5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    <input value={val} onChange={(e) => setVal(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); onAdd(val); setVal(''); }
                        }}
                        placeholder={items.length ? 'Add another…' : placeholder}
                        className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-foreground/35" />
                </div>
                {error && <p className="mt-1.5 flex items-center gap-1 text-[12px] text-rose-600"><CircleAlert className="h-3 w-3 shrink-0" /> {error}</p>}
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <Field label="Primary category" required error={errors.category}>
                <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES.map((c) => {
                        const active = data.category === c.slug;
                        return (
                            <button key={c.slug} type="button" onClick={() => update('category', c.slug)}
                                aria-pressed={active}
                                className={[
                                    'rounded-full px-3 py-1.5 text-xs font-medium transition',
                                    active ? 'bg-foreground text-primary-foreground'
                                           : 'border border-foreground/15 bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground',
                                ].join(' ')}>
                                {c.label}
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Who is it for?" required error={errors.audiences}
                hint="Pick every audience where you&apos;d expect real traction.">
                <div className="grid gap-2 sm:grid-cols-2">
                    {AUDIENCES.map((a) => {
                        const active = data.audiences.includes(a.key);
                        return (
                            <button key={a.key} type="button"
                                onClick={() => {
                                    const s = new Set(data.audiences);
                                    s.has(a.key) ? s.delete(a.key) : s.add(a.key);
                                    update('audiences', Array.from(s) as Audience[]);
                                }}
                                aria-pressed={active}
                                className={[
                                    'group relative flex items-start gap-3 rounded-2xl border p-3 text-left transition',
                                    active ? 'border-foreground bg-foreground/5' : 'border-foreground/12 bg-background/60 hover:border-foreground/25',
                                ].join(' ')}>
                                <span className={['mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition',
                                    active ? 'border-foreground bg-foreground text-primary-foreground' : 'border-foreground/25 bg-background'].join(' ')}>
                                    {active && <Check className="h-3 w-3" />}
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium text-foreground">{a.key}</span>
                                    <span className="block text-[12px] text-foreground/55">{a.blurb}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Description" required error={errors.description}
                right={<Counter value={data.description.length} max={600} />}
                hint="What does it actually do? Skip marketing fluff — describe the outcome and how it gets there.">
                <TextArea rows={5} placeholder="Submajic auto-captions video with speaker-aware timing…"
                    value={data.description} onChange={(e) => update('description', e.target.value)} invalid={!!errors.description} />
            </Field>

            <Field label="Key features (min 3)" required error={errors.keyFeatures}
                hint="Type a feature and press Enter. Keep them concrete, not slogans.">
                <div className="flex flex-wrap gap-1.5 rounded-xl border border-foreground/15 bg-background/80 p-2">
                    {data.keyFeatures.map((f, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-xs text-foreground">
                            <Zap className="h-3 w-3 text-foreground/50" /> {f}
                            <button type="button" aria-label={`Remove ${f}`}
                                onClick={() => update('keyFeatures', data.keyFeatures.filter((_, idx) => idx !== i))}
                                className="ml-0.5 rounded-full p-0.5 text-foreground/50 hover:bg-foreground/10 hover:text-foreground transition-colors">
                                <X className="h-3 w-3" />
                            </button>
                        </span>
                    ))}
                    <input
                        value={feat}
                        onChange={(e) => setFeat(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                                e.preventDefault();
                                addFeature(feat);
                            }
                        }}
                        placeholder={data.keyFeatures.length ? 'Add another…' : 'e.g. Speaker diarization'}
                        className="min-w-[160px] flex-1 bg-transparent px-2 py-1 text-sm outline-none placeholder:text-foreground/35"
                    />
                </div>
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Pros (min 1)" hint="What makes this tool stand out? Press Enter to add.">
                    <TagInput items={data.pros} placeholder="e.g. Real-time collaboration"
                        onAdd={(v) => addToList('pros', v, setPro)}
                        onRemove={(i) => update('pros', data.pros.filter((_, idx) => idx !== i))} />
                </Field>
                <Field label="Cons (min 1)" hint="Honest limitations help readers. Press Enter to add.">
                    <TagInput items={data.cons} placeholder="e.g. Steep learning curve"
                        onAdd={(v) => addToList('cons', v, setCon)}
                        onRemove={(i) => update('cons', data.cons.filter((_, idx) => idx !== i))} />
                </Field>
            </div>

            <Field label="Notes for the review team" error={undefined}
                hint="Optional. Launch context, differentiators, or anything the HyzenPro editors should know.">
                <TextArea rows={3} placeholder="We're launching on Product Hunt next Tuesday…"
                    value={data.reviewNotes} onChange={(e) => update('reviewNotes', e.target.value)} />
            </Field>
        </div>
    );
}

// ─── Step 3: Pricing Model ─────────────────────────────────────────────────

function StepPricing({ data, errors, update }: StepProps) {
    const tiers = data.pricingTiers;

    function updateTier(i: number, patch: Partial<PricingTierForm>) {
        const next = [...tiers];
        next[i] = { ...next[i], ...patch };
        update('pricingTiers', next);
    }

    function addTier() {
        update('pricingTiers', [...tiers, createEmptyTier()]);
    }

    function removeTier(i: number) {
        update('pricingTiers', tiers.filter((_, idx) => idx !== i));
    }

    function moveTier(from: number, to: number) {
        if (to < 0 || to >= tiers.length) return;
        const next = [...tiers];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        update('pricingTiers', next);
    }

    function addFeatureToTier(i: number, value: string) {
        const v = value.trim();
        if (!v || tiers[i].features.includes(v)) return;
        updateTier(i, { features: [...tiers[i].features, v] });
    }

    function removeFeatureFromTier(i: number, fi: number) {
        updateTier(i, { features: tiers[i].features.filter((_, idx) => idx !== fi) });
    }

    function addLimitationToTier(i: number, value: string) {
        const v = value.trim();
        if (!v || tiers[i].limitations.includes(v)) return;
        updateTier(i, { limitations: [...tiers[i].limitations, v] });
    }

    function removeLimitationFromTier(i: number, li: number) {
        updateTier(i, { limitations: tiers[i].limitations.filter((_, idx) => idx !== li) });
    }

    const [featureInputs, setFeatureInputs] = useState<Record<number, string>>({});
    const [limitInputs, setLimitInputs] = useState<Record<number, string>>({});

    return (
        <div className="grid gap-6">
            <Field label="Pricing model" required>
                <div className="grid gap-2 sm:grid-cols-2">
                    {PRICING_ORDER.map((p) => {
                        const meta = PRICING_META[p];
                        const active = data.pricing === p;
                        return (
                            <button key={p} type="button" onClick={() => update('pricing', p)}
                                aria-pressed={active}
                                className={[
                                    'flex items-center gap-3 rounded-2xl border p-3 text-left transition',
                                    active ? 'border-foreground bg-foreground/5' : 'border-foreground/12 bg-background/60 hover:border-foreground/25',
                                ].join(' ')}>
                                <span className={['grid h-9 w-9 shrink-0 place-items-center rounded-xl',
                                    active ? 'bg-foreground text-primary-foreground' : 'bg-foreground/5 text-foreground/70'].join(' ')}>
                                    <DollarSign className="h-4 w-4" />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-sm font-medium">{meta.label}</span>
                                    <span className="block text-[12px] text-foreground/55">{meta.hint}</span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Field>

            {PRICING_META[data.pricing].needsPrice && (
                <div className="grid gap-5 md:grid-cols-2">
                    <Field label="Starting price" required error={errors.startingPrice}
                        hint="Cheapest paid tier, per user, monthly.">
                        <TextInput placeholder="e.g. $19/mo" value={data.startingPrice}
                            onChange={(e) => update('startingPrice', e.target.value)} invalid={!!errors.startingPrice} />
                    </Field>
                    <Field label="Free tier available?">
                        <label className="flex items-center gap-3 rounded-xl border border-foreground/15 bg-background/80 px-3.5 py-2.5 cursor-pointer">
                            <input type="checkbox" checked={data.hasFreeTier}
                                onChange={(e) => update('hasFreeTier', e.target.checked)}
                                className="h-4 w-4 rounded border-foreground/30 accent-foreground" />
                            <span className="text-sm text-foreground/80">Yes, there&apos;s a free tier or trial credit.</span>
                        </label>
                    </Field>
                </div>
            )}

            <div className="border-t border-foreground/10 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-heading text-lg">Pricing Plans</h3>
                        <p className="text-sm text-foreground/55">Add detailed pricing tiers for a professional comparison table.</p>
                    </div>
                    <button type="button" onClick={addTier}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-foreground/15 bg-background/80 px-3 py-1.5 text-sm font-medium hover:border-foreground/30 transition">
                        <Plus className="h-3.5 w-3.5" /> Add plan
                    </button>
                </div>

                {tiers.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-foreground/15 bg-background/40 p-8 text-center">
                        <DollarSign className="mx-auto mb-3 h-8 w-8 text-foreground/25" />
                        <p className="text-sm text-foreground/55">No pricing plans yet. Click &quot;Add plan&quot; to create one.</p>
                    </div>
                )}

                <div className="grid gap-4">
                    {tiers.map((tier, i) => (
                        <div key={i} className="rounded-2xl border border-foreground/12 bg-background/60 p-4 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col gap-0.5">
                                        <button type="button" onClick={() => moveTier(i, i - 1)} disabled={i === 0}
                                            className="rounded p-0.5 text-foreground/40 hover:text-foreground disabled:opacity-20"><ChevronLeft className="h-3 w-3 -rotate-90" /></button>
                                        <button type="button" onClick={() => moveTier(i, i + 1)} disabled={i === tiers.length - 1}
                                            className="rounded p-0.5 text-foreground/40 hover:text-foreground disabled:opacity-20"><ChevronRight className="h-3 w-3 -rotate-90" /></button>
                                    </div>
                                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-foreground/5 text-xs font-semibold text-foreground/60">{i + 1}</span>
                                </div>
                                <button type="button" onClick={() => removeTier(i)}
                                    className="rounded-lg p-1.5 text-foreground/40 hover:text-red-600 hover:bg-red-50 transition"><X className="h-4 w-4" /></button>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Plan name" hint="e.g. Starter, Pro, Enterprise">
                                    <TextInput placeholder="e.g. Pro" value={tier.name}
                                        onChange={(e) => updateTier(i, { name: e.target.value })} />
                                </Field>
                                <Field label="Badge" hint="Optional — e.g. Most Popular, Best Value">
                                    <TextInput placeholder="e.g. Most Popular" value={tier.badge}
                                        onChange={(e) => updateTier(i, { badge: e.target.value })} />
                                </Field>
                            </div>

                            <Field label="Description" hint="One-liner for this tier.">
                                <TextInput placeholder="e.g. For professionals and small teams" value={tier.description}
                                    onChange={(e) => updateTier(i, { description: e.target.value })} />
                            </Field>

                            <div className="grid gap-3 sm:grid-cols-4">
                                <Field label="Monthly price">
                                    <TextInput placeholder="e.g. 29" value={tier.monthlyPrice}
                                        onChange={(e) => updateTier(i, { monthlyPrice: e.target.value })} />
                                </Field>
                                <Field label="Annual price">
                                    <TextInput placeholder="e.g. 290" value={tier.annualPrice}
                                        onChange={(e) => updateTier(i, { annualPrice: e.target.value })} />
                                </Field>
                                <Field label="Currency">
                                    <select value={tier.currency}
                                        onChange={(e) => updateTier(i, { currency: e.target.value })}
                                        className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2.5 text-sm"
                                        aria-label="Currency"
                                    >
                                        {DEFAULT_CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                                <Field label="Billing period">
                                    <select value={tier.billingPeriod}
                                        onChange={(e) => updateTier(i, { billingPeriod: e.target.value })}
                                        className="w-full rounded-xl border border-foreground/15 bg-background/80 px-3 py-2.5 text-sm"
                                        aria-label="Billing period"
                                    >
                                        {BILLING_PERIODS.map((bp) => <option key={bp} value={bp}>{bp}</option>)}
                                    </select>
                                </Field>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="CTA label" hint="Button text, e.g. Get Started">
                                    <TextInput placeholder="e.g. Get Started" value={tier.ctaLabel}
                                        onChange={(e) => updateTier(i, { ctaLabel: e.target.value })} />
                                </Field>
                                <Field label="CTA URL" hint="Link to pricing page or signup">
                                    <TextInput placeholder="https://..." value={tier.ctaUrl}
                                        onChange={(e) => updateTier(i, { ctaUrl: e.target.value })} />
                                </Field>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <Field label="Free trial" hint="e.g. 14-day, 100 credits">
                                    <TextInput placeholder="e.g. 14-day free trial" value={tier.freeTrial}
                                        onChange={(e) => updateTier(i, { freeTrial: e.target.value })} />
                                </Field>
                                <Field label="Money-back guarantee" hint="e.g. 30-day">
                                    <TextInput placeholder="e.g. 30-day" value={tier.moneyBackGuarantee}
                                        onChange={(e) => updateTier(i, { moneyBackGuarantee: e.target.value })} />
                                </Field>
                                <div className="flex items-end">
                                    <label className="flex items-center gap-3 rounded-xl border border-foreground/15 bg-background/80 px-3.5 py-2.5 cursor-pointer w-full">
                                        <input type="checkbox" checked={tier.isPopular}
                                            onChange={(e) => updateTier(i, { isPopular: e.target.checked })}
                                            className="h-4 w-4 rounded border-foreground/30 accent-foreground" />
                                        <span className="text-sm text-foreground/80">Mark as popular</span>
                                    </label>
                                </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Features" hint="Press Enter to add each feature.">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {tier.features.map((f, fi) => (
                                            <span key={fi} className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-0.5 text-xs text-foreground/70">
                                                {f}
                                                <button type="button" onClick={() => removeFeatureFromTier(i, fi)} className="text-foreground/40 hover:text-red-600"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <input type="text"
                                        value={featureInputs[i] || ''}
                                        onChange={(e) => setFeatureInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addFeatureToTier(i, featureInputs[i] || '');
                                                setFeatureInputs((prev) => ({ ...prev, [i]: '' }));
                                            }
                                        }}
                                        placeholder={tier.features.length ? 'Add another feature…' : 'e.g. Unlimited projects'}
                                        className="w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-foreground/35" />
                                </Field>
                                <Field label="Limitations" hint="Press Enter to add each limitation.">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        {tier.limitations.map((l, li) => (
                                            <span key={li} className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600/80">
                                                {l}
                                                <button type="button" onClick={() => removeLimitationFromTier(i, li)} className="text-red-400 hover:text-red-600"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                    <input type="text"
                                        value={limitInputs[i] || ''}
                                        onChange={(e) => setLimitInputs((prev) => ({ ...prev, [i]: e.target.value }))}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addLimitationToTier(i, limitInputs[i] || '');
                                                setLimitInputs((prev) => ({ ...prev, [i]: '' }));
                                            }
                                        }}
                                        placeholder={tier.limitations.length ? 'Add another limitation…' : 'e.g. 5 GB storage'}
                                        className="w-full bg-transparent px-2 py-1 text-sm outline-none placeholder:text-foreground/35" />
                                </Field>
                            </div>

                            <Field label="Notes" hint="Internal notes for the review team (not shown publicly).">
                                <TextArea rows={2} placeholder="e.g. Price increased from $19 in Jan 2026…"
                                    value={tier.notes} onChange={(e) => updateTier(i, { notes: e.target.value })} />
                            </Field>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Step 4: FAQs ───────────────────────────────────────────────────────────

function StepFAQ({ data, errors, update }: StepProps) {
    const faqs = data.faqs.length > 0 ? data.faqs : [
        { question: '', answer: '' },
        { question: '', answer: '' },
        { question: '', answer: '' },
    ];

    function updateFaq(i: number, patch: Partial<FAQForm>) {
        const next = [...faqs];
        next[i] = { ...next[i], ...patch };
        update('faqs', next);
    }

    const filledCount = faqs.filter((f) => f.question.trim() && f.answer.trim()).length;

    return (
        <div className="grid gap-6">
            <div>
                <p className="text-sm text-foreground/70 mb-1">
                    Add 3 frequently asked questions about your tool. These appear on the public tool page and help readers quickly understand what you offer.
                </p>
                <p className="text-[12px] text-foreground/50">
                    {filledCount}/3 answered
                </p>
            </div>

            {errors.faqs && (
                <p className="flex items-center gap-1 text-[12px] text-rose-600">
                    <CircleAlert className="h-3 w-3 shrink-0" /> {errors.faqs}
                </p>
            )}

            <div className="grid gap-4">
                {faqs.map((faq, i) => (
                    <div key={i} className="rounded-2xl border border-foreground/12 bg-background/60 p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-foreground/5 text-xs font-semibold text-foreground/60">
                                {i + 1}
                            </span>
                            <span className="text-sm font-medium text-foreground/80">
                                Question {i + 1}
                            </span>
                            {faq.question.trim() && faq.answer.trim() && (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 ml-auto" />
                            )}
                        </div>

                        <Field label="Question" hint="What readers commonly want to know.">
                            <TextInput
                                placeholder={`e.g. ${i === 0 ? 'Is there a free plan?' : i === 1 ? 'Does it support integrations?' : 'What languages are supported?'}`}
                                value={faq.question}
                                onChange={(e) => updateFaq(i, { question: e.target.value })}
                            />
                        </Field>

                        <Field label="Answer" hint="Keep it concise and specific to your tool.">
                            <TextArea
                                rows={3}
                                placeholder="A clear, honest answer — 1 to 3 sentences works best."
                                value={faq.answer}
                                onChange={(e) => updateFaq(i, { answer: e.target.value })}
                            />
                        </Field>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Step 5: Media & Proof ─────────────────────────────────────────────────

function StepMedia({ data, errors, update }: StepProps) {
    const [url, setUrl] = useState('');

    function add() {
        const v = url.trim();
        if (!v || data.screenshots.length >= 6) return;
        update('screenshots', [...data.screenshots, v]);
        setUrl('');
    }

    function move(from: number, to: number) {
        if (to < 0 || to >= data.screenshots.length) return;
        const arr = [...data.screenshots];
        const [x] = arr.splice(from, 1);
        arr.splice(to, 0, x);
        update('screenshots', arr);
    }

    return (
        <div className="grid gap-6">
            <Field label="Screenshot URLs" error={errors.screenshots}
                hint="Up to 6. Direct image URLs (PNG/JPG/WebP). Wide 16:9 crops look best in the listing.">
                <div className="flex gap-2">
                    <TextInput placeholder="https://…/screenshot.png" value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} />
                    <button type="button" onClick={add}
                        className="inline-flex items-center gap-1 rounded-xl bg-foreground px-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shrink-0">
                        <Plus className="h-4 w-4" /> Add
                    </button>
                </div>
                {data.screenshots.length > 0 && (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {data.screenshots.map((s, i) => (
                            <li key={s + i} className="group relative overflow-hidden rounded-xl border border-foreground/10 bg-background/70">
                                <div className="aspect-video w-full bg-foreground/5">
                                    {URL_RE.test(s) ? (
                                        <img src={s} alt="" loading="lazy" className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="grid h-full w-full place-items-center text-[11px] text-rose-600">Invalid URL</div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-2 px-2 py-1.5">
                                    <span className="flex items-center gap-1 text-[11px] text-foreground/50">
                                        <GripVertical className="h-3 w-3" /> #{i + 1}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button type="button" onClick={() => move(i, i - 1)}
                                            className="rounded p-1 text-foreground/60 hover:bg-foreground/5 transition-colors" aria-label="Move up">↑</button>
                                        <button type="button" onClick={() => move(i, i + 1)}
                                            className="rounded p-1 text-foreground/60 hover:bg-foreground/5 transition-colors" aria-label="Move down">↓</button>
                                        <button type="button" onClick={() => update('screenshots', data.screenshots.filter((_, idx) => idx !== i))}
                                            className="rounded p-1 text-foreground/60 hover:bg-rose-500/10 hover:text-rose-600 transition-colors" aria-label="Remove">
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Field>

            <Field label="Demo video URL" error={errors.demoVideo}
                hint="YouTube, Loom or Vimeo. 60 seconds beats 5 minutes.">
                <TextInput inputMode="url" placeholder="https://youtu.be/…" value={data.demoVideo}
                    onChange={(e) => update('demoVideo', e.target.value)} invalid={!!errors.demoVideo} />
            </Field>
        </div>
    );
}

// ─── Step 6: About You ─────────────────────────────────────────────────────

function StepContact({ data, errors, update }: StepProps) {
    const socialIcons = {
        twitter: Twitter, linkedin: Linkedin, youtube: Youtube, github: Github,
    } as const;

    return (
        <div className="grid gap-6">
            <div className="grid gap-5 md:grid-cols-2">
                <Field label="Your name" required error={errors.submitterName} htmlFor="sname">
                    <TextInput id="sname" value={data.submitterName}
                        onChange={(e) => update('submitterName', e.target.value)} invalid={!!errors.submitterName} />
                </Field>
                <Field label="Email" required error={errors.submitterEmail} htmlFor="semail"
                    hint="We only email about this submission.">
                    <TextInput id="semail" type="email" value={data.submitterEmail}
                        onChange={(e) => update('submitterEmail', e.target.value)} invalid={!!errors.submitterEmail} />
                </Field>
            </div>

            <Field label="Your relationship to the tool" required>
                <div className="flex flex-wrap gap-1.5">
                    {ROLES.map((r) => {
                        const active = data.submitterRole === r;
                        return (
                            <button key={r} type="button" onClick={() => update('submitterRole', r)}
                                aria-pressed={active}
                                className={[
                                    'rounded-full px-3 py-1.5 text-xs font-medium transition',
                                    active ? 'bg-foreground text-primary-foreground'
                                           : 'border border-foreground/15 bg-background text-foreground/70 hover:border-foreground/30 hover:text-foreground',
                                ].join(' ')}>
                                {r}
                            </button>
                        );
                    })}
                </div>
            </Field>

            <Field label="Socials (optional)"
                hint="Full URLs. Helps us credit you and coordinate a launch push.">
                <div className="grid gap-2 sm:grid-cols-2">
                    {(Object.keys(socialIcons) as (keyof typeof socialIcons)[]).map((k) => {
                        const Icon = socialIcons[k];
                        return (
                            <div key={k} className="relative">
                                <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                                <TextInput className="pl-9" placeholder={`https://${k}.com/…`}
                                    value={data.socials[k] || ''}
                                    onChange={(e) => update('socials', { ...data.socials, [k]: e.target.value })} />
                            </div>
                        );
                    })}
                </div>
            </Field>
        </div>
    );
}

// ─── Step 7: Review & Publish ──────────────────────────────────────────────

function StepReview({ data, errors, update, jump }: StepProps & { jump: (i: number) => void }) {
    const categoryLabel = CATEGORIES.find((c) => c.slug === data.category)?.label || data.category || '—';
    const faqCount = data.faqs.filter((f) => f.question.trim() && f.answer.trim()).length;
    const rows: { label: string; value: React.ReactNode; step: number }[] = [
        { label: 'Name',      value: data.name || '—', step: 0 },
        { label: 'Tagline',   value: data.tagline || '—', step: 0 },
        { label: 'Website',   value: data.website || '—', step: 0 },
        { label: 'Category',  value: categoryLabel, step: 1 },
        { label: 'Audiences', value: data.audiences.join(', ') || '—', step: 1 },
        { label: 'Pros',      value: data.pros.filter(Boolean).join('; ') || '—', step: 1 },
        { label: 'Cons',      value: data.cons.filter(Boolean).join('; ') || '—', step: 1 },
        { label: 'Pricing',   value: `${data.pricing}${PRICING_META[data.pricing].needsPrice ? ` · ${data.startingPrice || '—'}` : ''}`, step: 2 },
        { label: 'FAQs',      value: `${faqCount} question(s) answered`, step: 3 },
        { label: 'Media',     value: `${data.screenshots.length} screenshot(s)${data.demoVideo ? ' · demo' : ''}`, step: 4 },
        { label: 'Contact',   value: `${data.submitterName || '—'} · ${data.submitterEmail || '—'}`, step: 5 },
    ];

    return (
        <div className="grid gap-6">
            <div className="overflow-hidden rounded-2xl border border-foreground/10">
                {rows.map((r, i) => (
                    <div key={r.label}
                        className={['flex items-center justify-between gap-3 px-4 py-3 text-sm',
                            i > 0 ? 'border-t border-foreground/10' : '',
                            'bg-background/60'].join(' ')}>
                        <div className="flex min-w-0 items-center gap-3">
                            <span className="w-24 shrink-0 text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground/50">{r.label}</span>
                            <span className="min-w-0 truncate text-foreground/85">{r.value}</span>
                        </div>
                        <button type="button" onClick={() => jump(r.step)}
                            className="text-[12px] text-foreground/60 hover:text-foreground hover:underline transition-colors shrink-0">
                            Edit
                        </button>
                    </div>
                ))}
            </div>

            <div className="grid gap-2 rounded-2xl border border-foreground/10 bg-cream/60 p-4 text-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.agreeGuidelines}
                        onChange={(e) => update('agreeGuidelines', e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-foreground/30 accent-foreground" />
                    <span className="text-foreground/80">
                        I&apos;ve read and agree to the editorial guidelines. The tool works as described and I&apos;m authorized to submit it.
                        <span className="ml-0.5 text-rose-600">*</span>
                    </span>
                </label>
                {errors.agreeGuidelines && <p className="pl-7 text-[12px] text-rose-600">{errors.agreeGuidelines}</p>}

                <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={data.agreeContact}
                        onChange={(e) => update('agreeContact', e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-foreground/30 accent-foreground" />
                    <span className="text-foreground/80">
                        You may contact me with review feedback and one launch-week email. No newsletter enrollment.
                    </span>
                </label>
            </div>
        </div>
    );
}

// ─── Live Preview Card ─────────────────────────────────────────────────────

function PreviewCard({ data }: { data: FormData }) {
    const initials = (data.name || '??').split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
    const categoryLabel = CATEGORIES.find((c) => c.slug === data.category)?.label || 'Category';
    return (
        <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-card p-5 shadow-[0_20px_60px_-40px_rgb(0,0,0,0.15)]">
            <div className="flex items-start justify-between">
                <span className="inline-flex items-center rounded-md bg-foreground/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/60">
                    {categoryLabel}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-foreground/50">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-500" /> New
                </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-foreground/10 bg-gradient-to-br from-foreground/10 to-foreground/5 text-sm font-semibold text-foreground">
                    {data.logoUrl && URL_RE.test(data.logoUrl)
                        ? <img src={data.logoUrl} alt="" className="h-full w-full object-cover" />
                        : <span>{initials}</span>}
                </div>
                <div className="min-w-0">
                    <h3 className="truncate font-serif text-lg leading-tight">{data.name || 'Your tool name'}</h3>
                    <p className="mt-0.5 truncate text-[12px] text-foreground/55">
                        {data.pricing}{PRICING_META[data.pricing].needsPrice && data.startingPrice ? ` · ${data.startingPrice}` : ''}
                    </p>
                </div>
            </div>

            <p className="mt-3 line-clamp-3 text-sm text-foreground/70">
                {data.tagline || 'A one-line pitch will appear here as you type.'}
            </p>

            {data.audiences.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                    {data.audiences.slice(0, 3).map((a) => (
                        <span key={a} className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] text-foreground/60">{a.split(' ')[0]}</span>
                    ))}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-foreground/10 pt-3">
                <span className="text-[11px] text-foreground/50">
                    {data.keyFeatures.filter(Boolean).length} feature{data.keyFeatures.filter(Boolean).length === 1 ? '' : 's'}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    Visit <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
            </div>
        </article>
    );
}

// ─── Success Card ──────────────────────────────────────────────────────────

function SuccessCard({ data, onReset, onClose }: { data: FormData; onReset: () => void; onClose: () => void }) {
    const first = data.submitterName.trim().split(' ')[0] || 'there';
    return (
        <div className="w-full max-w-2xl rounded-3xl border border-foreground/10 bg-card p-10 text-center shadow-[0_30px_80px_-60px_rgb(0,0,0,0.35)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-700">
                <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="mt-6 font-serif text-4xl leading-tight tracking-tight">
                Thanks, {first}. <span className="italic text-foreground/70">We&apos;ve got it.</span>
            </h2>
            <p className="mt-4 text-foreground/70">
                <strong className="text-foreground">{data.name || 'Your tool'}</strong> is queued for editorial review. Expect a note at{' '}
                <strong className="text-foreground">{data.submitterEmail}</strong> within 5 business days — either a publish notice or a short list of edits.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a href="/ai-tools-directory/"
                    className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                    Explore the directory <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href="/compare/tools/"
                    className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background px-5 py-2.5 text-sm font-medium text-foreground/85 hover:bg-foreground/5 transition-colors">
                    See comparisons
                </a>
                <button onClick={() => { onReset(); onClose(); }}
                    className="text-sm text-foreground/60 underline-offset-4 hover:text-foreground hover:underline transition-colors">
                    Submit another
                </button>
            </div>
        </div>
    );
}
