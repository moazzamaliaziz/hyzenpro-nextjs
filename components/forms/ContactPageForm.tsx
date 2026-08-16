'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';

const INQUIRY_TYPES = [
    'General question',
    'Partnership',
    'Tool listing update',
    'Advertising',
    'Press / media',
    'Support',
];

export default function ContactPageForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({
        name: '',
        email: '',
        company: '',
        inquiryType: '',
        message: '',
    });

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'We could not send your message right now.');
                return;
            }

            setSuccess(data.message || 'Message sent successfully.');
            setForm({
                name: '',
                email: '',
                company: '',
                inquiryType: '',
                message: '',
            });
        } catch {
            setError('Network issue detected. Please try again or email us directly.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">Name</label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                        className="w-full rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/30 focus:outline-none"
                        placeholder="Your full name"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">Email</label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                        className="w-full rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/30 focus:outline-none"
                        placeholder="you@company.com"
                    />
                </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">Company</label>
                    <input
                        type="text"
                        value={form.company}
                        onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))}
                        className="w-full rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-foreground/30 focus:outline-none"
                        placeholder="Optional"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">Inquiry Type</label>
                    <select
                        required
                        value={form.inquiryType}
                        onChange={(event) => setForm((current) => ({ ...current, inquiryType: event.target.value }))}
                        className="w-full rounded-2xl border border-foreground/10 bg-card px-4 py-3 text-sm text-foreground focus:border-foreground/30 focus:outline-none"
                        aria-label="Inquiry type"
                    >
                        <option value="">Choose a topic</option>
                        {INQUIRY_TYPES.map((type) => (
                            <option key={type} value={type}>
                                {type}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-foreground/50">Message</label>
                <textarea
                    rows={7}
                    required
                    minLength={20}
                    value={form.message}
                    onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                    className="w-full rounded-2xl border border-foreground/10 bg-card px-4 py-4 text-sm leading-relaxed text-foreground placeholder:text-foreground/40 focus:border-foreground/30 focus:outline-none"
                    placeholder="Tell us what you need, what page or tool is involved, and how we can help."
                />
                <p className="mt-2 text-xs text-foreground/40">More context helps us route your message faster.</p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-6 py-4 text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending
                    </>
                ) : (
                    <>
                        <Send className="h-4 w-4" />
                        Send Message
                    </>
                )}
            </button>
        </form>
    );
}
