'use client';

import { Github, Linkedin, Twitter, Youtube } from 'lucide-react';
import { ROLES, type StepProps } from './model';
import { Field, TextInput } from './shared';

export default function StepContact({ data, errors, update }: StepProps) {
    const socialIcons = {
        twitter: Twitter, linkedin: Linkedin, youtube: Youtube, github: Github,
    } as const;

    const socialError = Object.entries(errors).find(([key]) => key.startsWith('socials.'))?.[1];

    return (
        <div className="grid gap-6">
            <div className="grid gap-5 md:grid-cols-2">
                <Field label="Your name" required error={errors.submitterName} htmlFor="sname">
                    <TextInput id="sname" name="submitterName" minLength={2} maxLength={100} autoComplete="name" value={data.submitterName}
                        onChange={(e) => update('submitterName', e.target.value)} invalid={!!errors.submitterName} />
                </Field>
                <Field label="Email" required error={errors.submitterEmail} htmlFor="semail"
                    hint="We only email about this submission.">
                    <TextInput id="semail" name="submitterEmail" type="email" required maxLength={320} autoComplete="email" value={data.submitterEmail}
                        onChange={(e) => update('submitterEmail', e.target.value)} invalid={!!errors.submitterEmail} />
                </Field>
            </div>

            <Field label="Your relationship to the tool" required fieldId="submitter-role">
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

            <Field label="Socials (optional)" fieldId="socials-group" error={socialError}
                hint="Full URLs. Helps us credit you and coordinate a launch push.">
                <div className="grid gap-2 sm:grid-cols-2">
                    {(Object.keys(socialIcons) as (keyof typeof socialIcons)[]).map((k) => {
                        const Icon = socialIcons[k];
                        return (
                            <div key={k} className="relative">
                                <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
                                <TextInput className="pl-9" id={`social-${k}`} name={`socials.${k}`} type="url" inputMode="url" maxLength={2048} placeholder={`https://${k}.com/…`}
                                    value={data.socials[k] || ''} invalid={!!socialError} aria-describedby={socialError ? 'submit-socials-group-hint submit-socials-group-error' : 'submit-socials-group-hint'}
                                    onChange={(e) => update('socials', { ...data.socials, [k]: e.target.value })} />
                            </div>
                        );
                    })}
                </div>
            </Field>
        </div>
    );
}
