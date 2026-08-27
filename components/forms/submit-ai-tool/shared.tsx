'use client';

import { cloneElement, isValidElement, type InputHTMLAttributes, type ReactElement, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { CircleAlert } from 'lucide-react';

export function messageId(fieldId: string, kind: 'label' | 'hint' | 'error'): string {
    return `submit-${fieldId}-${kind}`;
}

function joinIds(...ids: Array<string | undefined>): string | undefined {
    const value = ids.filter(Boolean).join(' ');
    return value || undefined;
}

export function Field({
    label, hint, required, error, htmlFor, fieldId, right, children,
}: {
    label: string; hint?: string; required?: boolean; error?: string;
    htmlFor?: string; fieldId?: string; right?: ReactNode; children: ReactNode;
}) {
    const id = fieldId || htmlFor;
    const hintId = id && hint ? messageId(id, 'hint') : undefined;
    const errorId = id && error ? messageId(id, 'error') : undefined;
    const labelId = id ? messageId(id, 'label') : undefined;
    const describedBy = joinIds(hintId, errorId);
    const childElement = isValidElement(children) ? children as ReactElement<Record<string, unknown>> : null;
    const childProps = childElement?.props || {};
    const child = childElement
        ? cloneElement(childElement, {
            ...(describedBy ? { 'aria-describedby': joinIds(childProps['aria-describedby'] as string | undefined, describedBy) } : {}),
            ...(error ? { 'aria-invalid': true } : {}),
        })
        : children;

    return (
        <div id={!htmlFor && fieldId ? fieldId : undefined} role={!htmlFor && fieldId ? 'group' : undefined} aria-labelledby={!htmlFor && fieldId ? labelId : undefined} tabIndex={!htmlFor && fieldId ? -1 : undefined}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <label id={labelId} htmlFor={htmlFor || undefined} className="text-sm font-medium text-foreground/85">
                    {label}{required && <span className="ml-0.5 text-rose-600" aria-hidden="true">*</span>}
                </label>
                {right}
            </div>
            {child}
            {hint && (
                <p id={hintId} className="mt-1.5 text-[12px] text-foreground/50">{hint}</p>
            )}
            {error && (
                <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1 text-[12px] text-rose-600">
                    <CircleAlert className="h-3 w-3 shrink-0" aria-hidden="true" /> {error}
                </p>
            )}
        </div>
    );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
    const { invalid, className, ...rest } = props;
    return (
        <input
            {...rest}
            aria-invalid={invalid ? true : rest['aria-invalid']}
            className={[
                'block w-full rounded-xl border bg-background/80 px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition',
                'placeholder:text-foreground/35 focus:ring-4 focus:ring-foreground/5',
                invalid ? 'border-rose-400 focus:border-rose-500' : 'border-foreground/15 focus:border-foreground/40',
                className || '',
            ].join(' ')}
        />
    );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
    const { invalid, className, ...rest } = props;
    return (
        <textarea
            {...rest}
            aria-invalid={invalid ? true : rest['aria-invalid']}
            className={[
                'block w-full resize-y rounded-xl border bg-background/80 px-3.5 py-2.5 text-sm text-foreground shadow-sm outline-none transition',
                'placeholder:text-foreground/35 focus:ring-4 focus:ring-foreground/5',
                invalid ? 'border-rose-400 focus:border-rose-500' : 'border-foreground/15 focus:border-foreground/40',
                className || '',
            ].join(' ')}
        />
    );
}

export function Counter({ value, max }: { value: number; max: number }) {
    const over = value > max;
    return (
        <span className={['text-[11px] tabular-nums', over ? 'text-rose-600' : 'text-foreground/45'].join(' ')}>
            {value}/{max}
        </span>
    );
}
