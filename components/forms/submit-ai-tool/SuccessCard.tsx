'use client';

import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { FormData } from './model';

export default function SuccessCard({ data, onReset, onClose }: { data: FormData; onReset: () => void; onClose: () => void }) {
    const first = data.submitterName.trim().split(' ')[0] || 'there';
    return (
        <div className="w-full max-w-2xl rounded-3xl border border-foreground/10 bg-card p-10 text-center shadow-[0_30px_80px_-60px_rgb(0,0,0,0.35)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/15 text-emerald-700">
                <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 id="submit-success-title" className="mt-6 font-serif text-4xl leading-tight tracking-tight">
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
