'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowUpRight, Check, ChevronLeft, ChevronRight, CircleAlert, Command, DollarSign,
    Eye, HelpCircle, ImageIcon, Loader2, Send, Sparkles, Tag, User,
} from 'lucide-react';
import { type FormData, type StepProps, createEmptyFormData, normalizeDraft } from './submit-ai-tool/model';
import { completion, normalizedPayload, validate, validateAll } from './submit-ai-tool/validation';

const StepBasics = dynamic(() => import('./submit-ai-tool/StepBasics'), { loading: StepLoading });
const StepDetails = dynamic(() => import('./submit-ai-tool/StepDetails'), { loading: StepLoading });
const StepPricing = dynamic(() => import('./submit-ai-tool/StepPricing'), { loading: StepLoading });
const StepFAQ = dynamic(() => import('./submit-ai-tool/StepFAQ'), { loading: StepLoading });
const StepMedia = dynamic(() => import('./submit-ai-tool/StepMedia'), { loading: StepLoading });
const StepContact = dynamic(() => import('./submit-ai-tool/StepContact'), { loading: StepLoading });
const StepReview = dynamic(() => import('./submit-ai-tool/StepReview'), { loading: StepLoading });
const PreviewCard = dynamic(() => import('./submit-ai-tool/PreviewCard'), { loading: () => <PreviewLoading /> });
const SuccessCard = dynamic(() => import('./submit-ai-tool/SuccessCard'));

const STEPS = [
    { key: 'basics', title: 'The essentials', icon: Sparkles, hint: 'Name, tagline & URL' },
    { key: 'details', title: 'Positioning', icon: Tag, hint: 'Category, audience, features' },
    { key: 'pricing', title: 'Pricing model', icon: DollarSign, hint: 'How users pay' },
    { key: 'faqs', title: 'FAQs', icon: HelpCircle, hint: 'Common questions' },
    { key: 'media', title: 'Media & proof', icon: ImageIcon, hint: 'Screenshots, demo video' },
    { key: 'contact', title: 'About you', icon: User, hint: 'Name, email, socials' },
    { key: 'review', title: 'Review & publish', icon: Eye, hint: 'Final check' },
] as const;

const STORAGE_KEY = 'hzp:submit-draft:v2';
const RATE_KEY = 'hzp:submit-last';

function StepLoading() {
    return <div className="grid min-h-[22rem] animate-pulse place-items-center rounded-2xl bg-foreground/[0.03] text-sm text-foreground/50">Loading this step…</div>;
}

function PreviewLoading() {
    return <div className="h-72 animate-pulse rounded-2xl bg-foreground/[0.04]" aria-hidden="true" />;
}

function errorTargetId(key: string): string {
    if (key.startsWith('tier.')) {
        const [, index, field] = key.split('.');
        return `tier-${index}-${field}`;
    }
    if (key.startsWith('faq.')) {
        const [, index, field] = key.split('.');
        return `faq-${index}-${field}`;
    }
    if (key.startsWith('socials.')) return `social-${key.split('.')[1]}`;
    return {
        category: 'category-group', audiences: 'audience-group', description: 'description', keyFeatures: 'key-features',
        pros: 'pros-group', cons: 'cons-group', pricing: 'pricing-group', startingPrice: 'starting-price', faqs: 'faq-0-question',
        screenshots: 'screenshot-url', demoVideo: 'demo-video', submitterName: 'sname', submitterEmail: 'semail',
        agreeGuidelines: 'agree-guidelines', reviewNotes: 'review-notes',
    }[key] || key;
}

function errorStep(key: string): number {
    if (key === 'name' || key === 'tagline' || key === 'website' || key === 'logoUrl') return 0;
    if (['category', 'audiences', 'description', 'keyFeatures', 'pros', 'cons', 'reviewNotes'].includes(key)) return 1;
    if (key === 'pricing' || key === 'startingPrice' || key.startsWith('tier.')) return 2;
    if (key === 'faqs' || key.startsWith('faq.')) return 3;
    if (key === 'screenshots' || key === 'demoVideo') return 4;
    if (key === 'submitterName' || key === 'submitterEmail' || key.startsWith('socials.')) return 5;
    return 6;
}

function errorLabel(key: string): string {
    if (key.startsWith('tier.')) return `Pricing plan ${Number(key.split('.')[1]) + 1}`;
    if (key.startsWith('faq.')) return `FAQ ${Number(key.split('.')[1]) + 1}`;
    if (key.startsWith('socials.')) return `${key.split('.')[1]} social URL`;
    return {
        name: 'Tool name', tagline: 'Tagline', website: 'Website URL', logoUrl: 'Logo URL', category: 'Primary category',
        audiences: 'Audience', description: 'Description', keyFeatures: 'Key features', pros: 'Pros', cons: 'Cons', pricing: 'Pricing model',
        startingPrice: 'Starting price', faqs: 'FAQs', screenshots: 'Screenshots', demoVideo: 'Demo video', submitterName: 'Your name',
        submitterEmail: 'Email', agreeGuidelines: 'Editorial guidelines', reviewNotes: 'Review notes',
    }[key] || 'Field';
}

export default function SubmitAiToolLeadForm() {
    const [step, setStep] = useState(0);
    const [data, setData] = useState<FormData>(() => createEmptyFormData());
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const [rateBlocked, setRateBlocked] = useState<string | null>(null);
    const [serverError, setServerError] = useState('');
    const formRef = useRef<HTMLDivElement>(null);
    const hydratedRef = useRef(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setData(normalizeDraft(JSON.parse(raw)));
        } catch { /* A corrupt old draft must never block the form. */ }
        hydratedRef.current = true;
    }, []);

    useEffect(() => {
        const media = window.matchMedia('(min-width: 1280px)');
        const syncPreview = () => setShowPreview(media.matches);
        syncPreview();
        media.addEventListener('change', syncPreview);
        return () => media.removeEventListener('change', syncPreview);
    }, []);

    useEffect(() => {
        if (!hydratedRef.current) return;
        const timer = window.setTimeout(() => {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                setSavedAt(Date.now());
            } catch { /* Storage can be unavailable in private/restricted contexts. */ }
        }, 400);
        return () => window.clearTimeout(timer);
    }, [data]);

    useEffect(() => {
        const firstError = Object.keys(errors)[0];
        if (!firstError) return;
        const frame = window.requestAnimationFrame(() => document.getElementById(errorTargetId(firstError))?.focus());
        return () => window.cancelAnimationFrame(frame);
    }, [errors]);

    const update: StepProps['update'] = useCallback((key, value) => {
        setData((current) => ({ ...current, [key]: value }));
        setErrors((current) => {
            const prefix = `${String(key)}.`;
            const next = Object.fromEntries(Object.entries(current).filter(([errorKey]) => errorKey !== String(key) && !errorKey.startsWith(prefix)));
            return Object.keys(next).length === Object.keys(current).length ? current : next;
        });
        setServerError('');
        setRateBlocked(null);
    }, []);

    const pct = useMemo(() => completion(data), [data]);
    const maxVisited = useMemo(() => Math.max(...Array.from(visited)), [visited]);

    const jumpTo = useCallback((nextStep: number) => {
        if (nextStep > maxVisited) return;
        setErrors({});
        setStep(nextStep);
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [maxVisited]);

    const next = useCallback(() => {
        const nextErrors = validate(step, data);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;
        setStep((current) => {
            const nextStep = Math.min(current + 1, STEPS.length - 1);
            setVisited((currentVisited) => new Set(currentVisited).add(nextStep));
            return nextStep;
        });
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [data, step]);

    const back = useCallback(() => {
        setErrors({});
        setStep((current) => Math.max(current - 1, 0));
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, []);

    const submit = useCallback(async () => {
        if (submitting) return;
        const nextErrors = validateAll(data);
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) {
            const firstErrorStep = errorStep(Object.keys(nextErrors)[0]);
            if (firstErrorStep !== step) setStep(firstErrorStep);
            return;
        }

        try {
            const last = Number(localStorage.getItem(RATE_KEY) || 0);
            if (Date.now() - last < 30_000) {
                setRateBlocked('Please wait a moment before submitting again.');
                return;
            }
        } catch { /* Continue if storage is unavailable. */ }

        setRateBlocked(null);
        setServerError('');
        setSubmitting(true);
        try {
            const response = await fetch('/api/tool-submissions', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(normalizedPayload(data)),
            });
            const responseData = await response.json().catch(() => ({}));
            if (!response.ok) {
                setServerError(responseData.error || 'Something went wrong. Please try again.');
                return;
            }
            try { localStorage.setItem(RATE_KEY, String(Date.now())); } catch { /* ignore */ }
            setSubmitted(true);
        } catch {
            setServerError('Network issue. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }, [data, submitting]);

    useEffect(() => {
        function onKey(event: KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
                event.preventDefault();
                if (step < STEPS.length - 1) next(); else void submit();
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [next, step, submit]);

    function clearDraft() {
        const blank = createEmptyFormData();
        setData(blank); setErrors({}); setVisited(new Set([0])); setStep(0); setSavedAt(null); setSubmitted(false);
        try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    }

    const stepProps = { data, errors, update };
    const errorEntries = Object.entries(errors);

    return (
        <div ref={formRef}>
            <div className="grid gap-6 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_340px]">
                <aside className="lg:sticky lg:top-24 lg:self-start">
                    <div className="rounded-3xl border border-foreground/10 bg-card/95 p-5 shadow-[0_20px_60px_-40px_rgb(0,0,0,0.15)] backdrop-blur">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Step {step + 1} / {STEPS.length}</p>
                            <span className="text-[11px] font-medium text-foreground/50">{pct}% complete</span>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10" role="progressbar" aria-label="Submission completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                            <div className="h-full rounded-full bg-foreground transition-[width] duration-300" style={{ width: `${pct}%` }} />
                        </div>
                        <ol className="mt-5 space-y-1">
                            {STEPS.map((item, index) => {
                                const Icon = item.icon; const done = index < step; const active = index === step; const reachable = index <= maxVisited;
                                return <li key={item.key}><button type="button" onClick={() => jumpTo(index)} disabled={!reachable} aria-current={active ? 'step' : undefined} className={['group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition', active ? 'bg-foreground text-primary-foreground' : done ? 'text-foreground hover:bg-foreground/5' : 'text-foreground/50 hover:bg-foreground/5 disabled:cursor-not-allowed'].join(' ')}>
                                    <span className={['grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-semibold', active ? 'bg-primary-foreground/15 text-primary-foreground' : done ? 'bg-emerald-500/15 text-emerald-700' : 'bg-foreground/5 text-foreground/60'].join(' ')}>{done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}</span>
                                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{item.title}</span><span className={['block truncate text-[11px]', active ? 'text-primary-foreground/70' : 'text-foreground/50'].join(' ')}>{item.hint}</span></span>
                                </button></li>;
                            })}
                        </ol>
                        <div className="mt-5 flex items-center justify-between rounded-xl border border-foreground/10 bg-background/60 px-3 py-2 text-[11px] text-foreground/60">
                            <span className="flex items-center gap-1.5"><span className={['h-1.5 w-1.5 rounded-full', savedAt ? 'bg-emerald-500' : 'bg-foreground/30'].join(' ')} aria-hidden="true" />{savedAt ? 'Draft saved' : 'New draft'}</span>
                            <button type="button" onClick={clearDraft} className="transition-colors hover:text-foreground">Clear</button>
                        </div>
                        <p className="mt-3 flex items-center gap-1.5 text-[11px] text-foreground/45"><Command className="h-3 w-3" aria-hidden="true" /> Press ⌘/Ctrl + ↵ to advance</p>
                    </div>
                    <div className="mt-4 hidden rounded-3xl border border-foreground/10 bg-cream/60 p-5 lg:block"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/55">Need a hand?</p><p className="mt-2 text-sm text-foreground/70">Founders: mention your launch date and we&apos;ll try to time the review for it.</p><a href="mailto:submissions@hyzenpro.com" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-foreground hover:underline">submissions@hyzenpro.com <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></a></div>
                </aside>

                <div className="min-w-0">
                    <form id="submit-ai-tool-form" noValidate onSubmit={(event) => { event.preventDefault(); if (step < STEPS.length - 1) next(); else void submit(); }}>
                        <div className="rounded-3xl border border-foreground/10 bg-card p-6 shadow-[0_30px_80px_-60px_rgb(0,0,0,0.15)] md:p-8">
                            <StepHeader step={step} />
                            {errorEntries.length > 0 && <div className="mt-5 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4" role="alert" aria-live="assertive"><p className="text-sm font-semibold text-rose-800">Fix {errorEntries.length === 1 ? 'the highlighted field' : `${errorEntries.length} highlighted fields`} before continuing.</p><ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-rose-700">{errorEntries.map(([key, message]) => <li key={key}><button type="button" className="underline underline-offset-2" onClick={() => document.getElementById(errorTargetId(key))?.focus()}>{errorLabel(key)}: {message}</button></li>)}</ul></div>}
                            <div className="mt-6">
                                {step === 0 && <StepBasics {...stepProps} />}
                                {step === 1 && <StepDetails {...stepProps} />}
                                {step === 2 && <StepPricing {...stepProps} />}
                                {step === 3 && <StepFAQ {...stepProps} />}
                                {step === 4 && <StepMedia {...stepProps} />}
                                {step === 5 && <StepContact {...stepProps} />}
                                {step === 6 && <StepReview {...stepProps} jump={jumpTo} />}
                            </div>
                            {rateBlocked && <div className="mt-5 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-800" role="alert"><CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {rateBlocked}</div>}
                            {serverError && <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700" role="alert"><CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" /> {serverError}</div>}
                        </div>
                        <div className="mt-5 hidden items-center justify-between md:flex"><button type="button" onClick={back} disabled={step === 0} className="inline-flex items-center gap-1.5 rounded-full border border-foreground/15 bg-background px-4 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/5 disabled:opacity-40"><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back</button>{step < STEPS.length - 1 ? <button type="submit" className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity">Continue <ChevronRight className="h-4 w-4" aria-hidden="true" /></button> : <button type="submit" disabled={submitting} className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60">{submitting ? <><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting…</> : <><Send className="h-4 w-4" aria-hidden="true" /> Submit for review</>}</button>}</div>
                    </form>
                </div>

                <aside className="hidden xl:block">{showPreview && <div className="sticky top-24"><p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/55"><Eye className="h-3 w-3" aria-hidden="true" /> Live preview</p><PreviewCard data={data} /><p className="mt-3 text-[11px] leading-relaxed text-foreground/50">This is roughly how your listing will appear in the directory. Editors may refine copy for tone and clarity.</p></div>}</aside>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background/95 px-4 py-3 backdrop-blur md:hidden"><div className="mx-auto flex max-w-6xl items-center justify-between gap-3"><button type="button" onClick={back} disabled={step === 0} className="inline-flex items-center gap-1 rounded-full border border-foreground/15 px-3 py-2 text-sm font-medium text-foreground/80 disabled:opacity-40"><ChevronLeft className="h-4 w-4" aria-hidden="true" /> Back</button><span className="text-[11px] text-foreground/55">{step + 1}/{STEPS.length} · {pct}%</span>{step < STEPS.length - 1 ? <button type="submit" form="submit-ai-tool-form" onClick={(event) => { event.preventDefault(); next(); }} className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-primary-foreground">Continue <ChevronRight className="h-4 w-4" aria-hidden="true" /></button> : <button type="button" onClick={() => void submit()} disabled={submitting} className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />} Submit</button>}</div></div>

            {submitted && <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="submit-success-title"><SuccessCard data={data} onReset={clearDraft} onClose={() => setSubmitted(false)} /></div>}
        </div>
    );
}

function StepHeader({ step }: { step: number }) {
    const item = STEPS[step]; const Icon = item.icon;
    return <div className="flex items-start gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-foreground text-primary-foreground"><Icon className="h-5 w-5" aria-hidden="true" /></div><div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/50">Step {step + 1} · {item.hint}</p><h2 className="mt-1 font-serif text-3xl leading-tight tracking-tight">{item.title}</h2></div></div>;
}
