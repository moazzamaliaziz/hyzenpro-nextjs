'use client';

import { Globe } from 'lucide-react';
import type { StepProps } from './model';
import { Field, TextInput, Counter } from './shared';

export default function StepBasics({ data, errors, update }: StepProps) {
    return (
        <div className="grid gap-5">
            <Field label="Tool name" required error={errors.name} htmlFor="name"
                right={<Counter value={data.name.length} max={60} />}>
                <TextInput id="name" placeholder="e.g. Submajic" value={data.name}
                    name="name" required maxLength={60} autoComplete="organization"
                    onChange={(e) => update('name', e.target.value)} invalid={!!errors.name} />
            </Field>

            <Field label="One-line tagline" required error={errors.tagline} htmlFor="tagline"
                right={<Counter value={data.tagline.length} max={90} />}>
                <TextInput id="tagline" placeholder="Auto-caption videos in 30+ languages"
                    value={data.tagline}
                    name="tagline" required maxLength={90}
                    onChange={(e) => update('tagline', e.target.value)} invalid={!!errors.tagline} />
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
                <Field label="Website URL" required error={errors.website} htmlFor="website"
                    hint="Live product URL — not a waitlist page.">
                    <div className="relative">
                        <Globe className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                        <TextInput id="website" name="website" type="url" required inputMode="url" maxLength={2048} placeholder="https://yourtool.com" className="pl-9"
                            value={data.website} onChange={(e) => update('website', e.target.value)} invalid={!!errors.website}
                            aria-describedby={errors.website ? 'submit-website-hint submit-website-error' : 'submit-website-hint'} />
                    </div>
                </Field>
                <Field label="Logo URL" error={errors.logoUrl} htmlFor="logo"
                    hint="Square PNG/SVG, min 256px. Leave blank to auto-generate.">
                    <TextInput id="logo" name="logoUrl" type="url" inputMode="url" maxLength={2048} placeholder="https://yourtool.com/logo.png"
                        value={data.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} invalid={!!errors.logoUrl} />
                </Field>
            </div>
        </div>
    );
}
