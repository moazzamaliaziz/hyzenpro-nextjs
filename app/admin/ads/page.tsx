'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, Save, ShieldAlert, Sparkles } from 'lucide-react';

type SlotNetwork = 'adsense' | 'affiliate' | 'custom';

interface AdSlotConfig {
    id: string;
    label: string;
    description: string;
    area: string;
    placementHint: string;
    format: 'horizontal' | 'vertical' | 'auto' | 'rectangle';
    enabled: boolean;
    network: SlotNetwork;
    code: string;
    notes: string;
    updatedAt: string | null;
}

const NETWORK_OPTIONS: SlotNetwork[] = ['adsense', 'affiliate', 'custom'];

export default function AdminAdsPage() {
    const [slots, setSlots] = useState<AdSlotConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingSlotId, setSavingSlotId] = useState<string | null>(null);
    const [successSlotId, setSuccessSlotId] = useState<string | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const response = await fetch('/api/admin/ads');
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load ad settings.');
                }

                setSlots(data.slots || []);
            } catch (err: any) {
                setError(err.message || 'Failed to load ad settings.');
            } finally {
                setLoading(false);
            }
        }

        void load();
    }, []);

    const enabledCount = useMemo(() => slots.filter((slot) => slot.enabled && slot.code.trim()).length, [slots]);

    const updateSlot = (slotId: string, changes: Partial<AdSlotConfig>) => {
        setSlots((current) =>
            current.map((slot) => (slot.id === slotId ? { ...slot, ...changes } : slot))
        );
    };

    const saveSlot = async (slotId: string) => {
        const slot = slots.find((item) => item.id === slotId);
        if (!slot) {
            return;
        }

        setSavingSlotId(slotId);
        setError('');
        setSuccessSlotId(null);

        try {
            const response = await fetch('/api/admin/ads', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slotId,
                    slot: {
                        enabled: slot.enabled,
                        network: slot.network,
                        code: slot.code,
                        notes: slot.notes,
                    },
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save this ad slot.');
            }

            setSlots(data.slots || []);
            setSuccessSlotId(slotId);
            window.setTimeout(() => setSuccessSlotId((current) => (current === slotId ? null : current)), 2500);
        } catch (err: any) {
            setError(err.message || 'Failed to save this ad slot.');
        } finally {
            setSavingSlotId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white/30" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                        <Sparkles className="h-3.5 w-3.5" />
                        Centralized Monetization
                    </div>
                    <h1 className="font-heading text-4xl text-white">Ad Management</h1>
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                        Paste AdSense, affiliate, or custom HTML/JS code into any placement. Saving a slot updates that
                        placement immediately across the site with no frontend code edits.
                    </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-white/70">
                    <div className="text-xs uppercase tracking-[0.2em] text-white/35">Live Summary</div>
                    <div className="mt-2 text-2xl font-heading text-white">{enabledCount}</div>
                    <div className="text-xs text-white/40">enabled monetization slot{enabledCount === 1 ? '' : 's'}</div>
                </div>
            </div>

            {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-100">
                <div className="mb-2 flex items-center gap-2 font-semibold">
                    <ShieldAlert className="h-4 w-4" />
                    Admin-only script power
                </div>
                <p className="leading-6 text-amber-100/85">
                    This panel accepts third-party HTML and JavaScript exactly as pasted. Keep access limited to trusted
                    admins because the site will render that code live.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                {slots.map((slot) => (
                    <section key={slot.id} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div>
                                <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">{slot.area}</div>
                                <h2 className="mt-2 font-heading text-2xl text-white">{slot.label}</h2>
                                <p className="mt-2 text-sm leading-6 text-white/50">{slot.description}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-white/45">
                                <div>ID: {slot.id}</div>
                                <div>Format: {slot.format}</div>
                            </div>
                        </div>

                        <div className="mb-5 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/55">
                            {slot.placementHint}
                        </div>

                        <div className="space-y-5">
                            <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
                                <label className="block">
                                    <span className="mb-2 block text-sm text-white/60">Ad Network</span>
                                    <select
                                        value={slot.network}
                                        onChange={(event) => updateSlot(slot.id, { network: event.target.value as SlotNetwork })}
                                        className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-accent/40 focus:outline-none"
                                    >
                                        {NETWORK_OPTIONS.map((network) => (
                                            <option key={network} value={network}>
                                                {network}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="flex items-end">
                                    <span className="flex w-full items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white">
                                        <span className="font-medium">Enabled</span>
                                        <input
                                            type="checkbox"
                                            checked={slot.enabled}
                                            onChange={(event) => updateSlot(slot.id, { enabled: event.target.checked })}
                                            className="h-4 w-4 rounded border-white/20 bg-white/10 text-accent focus:ring-accent/40"
                                        />
                                    </span>
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm text-white/60">Ad Code</span>
                                <textarea
                                    value={slot.code}
                                    onChange={(event) => updateSlot(slot.id, { code: event.target.value })}
                                    rows={10}
                                    placeholder="<script>...third-party ad code...</script>"
                                    spellCheck={false}
                                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 font-mono text-xs text-white focus:border-accent/40 focus:outline-none"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm text-white/60">Internal Notes</span>
                                <textarea
                                    value={slot.notes}
                                    onChange={(event) => updateSlot(slot.id, { notes: event.target.value })}
                                    rows={3}
                                    placeholder="Optional reminder about campaign, sponsor, or affiliate partner."
                                    className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-accent/40 focus:outline-none"
                                />
                            </label>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="text-xs text-white/35">
                                    {slot.updatedAt ? `Last updated ${new Date(slot.updatedAt).toLocaleString()}` : 'Not configured yet'}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => void saveSlot(slot.id)}
                                    disabled={savingSlotId === slot.id}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {savingSlotId === slot.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                    {savingSlotId === slot.id ? 'Saving...' : successSlotId === slot.id ? 'Saved Live' : 'Save Slot'}
                                </button>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
