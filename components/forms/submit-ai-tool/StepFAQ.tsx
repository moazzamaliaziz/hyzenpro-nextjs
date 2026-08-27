'use client';

import { CheckCircle2, CircleAlert } from 'lucide-react';
import { Field, TextInput, TextArea } from './shared';
import type { FAQForm, StepProps } from './model';

export default function StepFAQ({ data, errors, update }: StepProps) {
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

                        <Field label="Question" fieldId={`faq-${i}-question`} error={errors[`faq.${i}.question`]} hint="What readers commonly want to know.">
                            <TextInput
                                id={`faq-${i}-question`} name={`faqs.${i}.question`} maxLength={180} placeholder={`e.g. ${i === 0} ? 'Is there a free plan?' : i === 1 ? 'Does it support integrations?' : 'What languages are supported?'}`}
                                value={faq.question}
                                onChange={(e) => updateFaq(i, { question: e.target.value })}
                            />
                        </Field>

                        <Field label="Answer" fieldId={`faq-${i}-answer`} error={errors[`faq.${i}.answer`]} hint="Keep it concise and specific to your tool.">
                            <TextArea
                                id={`faq-${i}-answer`} name={`faqs.${i}.answer`} maxLength={800}
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
