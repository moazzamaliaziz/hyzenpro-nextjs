'use client';

import { useState } from 'react';
import { GripVertical, Plus, X } from 'lucide-react';
import { isValidHttpUrl, type StepProps } from './model';
import { Field, TextInput } from './shared';

export default function StepMedia({ data, errors, update }: StepProps) {
    const [url, setUrl] = useState('');
    const [failedScreenshots, setFailedScreenshots] = useState<Record<string, boolean>>({});

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
            <Field label="Screenshot URLs" fieldId="screenshot-url" error={errors.screenshots}
                hint="Up to 6. Direct image URLs (PNG/JPG/WebP). Wide 16:9 crops look best in the listing.">
                <div className="flex gap-2">
                    <TextInput id="screenshot-url" name="screenshots" type="url" inputMode="url" maxLength={2048} placeholder="https://…/screenshot.png" value={url}
                        aria-describedby={errors.screenshots ? 'submit-screenshot-url-hint submit-screenshot-url-error' : 'submit-screenshot-url-hint'}
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
                                    {isValidHttpUrl(s) && !failedScreenshots[s] ? (
                                        <img src={s} alt={`Screenshot ${i + 1} preview`} loading="lazy" decoding="async" onError={() => setFailedScreenshots((current) => ({ ...current, [s]: true }))} className="h-full w-full object-cover" />
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
                                            className="rounded p-1 text-foreground/60 hover:bg-rose-500/10 hover:text-rose-600 transition-colors" aria-label={`Remove screenshot ${i + 1}`}>
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </Field>

            <Field label="Demo video URL" fieldId="demo-video" error={errors.demoVideo}
                hint="YouTube, Loom or Vimeo. 60 seconds beats 5 minutes.">
                <TextInput id="demo-video" name="demoVideo" type="url" inputMode="url" maxLength={2048} placeholder="https://youtu.be/…" value={data.demoVideo}
                    onChange={(e) => update('demoVideo', e.target.value)} invalid={!!errors.demoVideo} />
            </Field>
        </div>
    );
}
