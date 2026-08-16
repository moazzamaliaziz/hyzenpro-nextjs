'use client';

import { useEffect, useState } from 'react';
import { slugify } from '@/lib/utils';

interface SlugInputProps {
    value: string;
    onChange: (value: string) => void;
    sourceValue?: string; // auto-generate slug from this (e.g., title)
    prefix?: string; // URL prefix like '/ai-tools-directory/'
    locked?: boolean;
    lockedMessage?: string;
}

export default function SlugInput({
    value,
    onChange,
    sourceValue,
    prefix,
    locked = false,
    lockedMessage = 'Slug is locked for existing content to protect the live URL.',
}: SlugInputProps) {
    const [isCustom, setIsCustom] = useState(() => Boolean(value));

    useEffect(() => {
        if (!locked && !isCustom && sourceValue) {
            onChange(slugify(sourceValue));
        }
    }, [sourceValue, isCustom, locked, onChange]);

    return (
        <div>
            <label className="block text-sm text-white/60 mb-1.5">
                URL Slug
                {!locked && !isCustom && (
                    <button
                        type="button"
                        onClick={() => setIsCustom(true)}
                        className="ml-2 text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                        Edit manually
                    </button>
                )}
                {!locked && isCustom && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsCustom(false);
                            if (sourceValue) onChange(slugify(sourceValue));
                        }}
                        className="ml-2 text-xs text-white/30 hover:text-white/50 transition-colors"
                    >
                        Auto-generate
                    </button>
                )}
            </label>
            <div className="flex items-center bg-white/[0.03] border border-white/10 rounded-lg overflow-hidden focus-within:border-accent/50 transition-colors">
                {prefix && (
                    <span className="px-3 text-sm text-white/30 bg-white/[0.02] border-r border-white/10 py-2.5 whitespace-nowrap">
                        {prefix}
                    </span>
                )}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        if (locked) return;
                        setIsCustom(true);
                        onChange(slugify(e.target.value));
                    }}
                    className="flex-1 bg-transparent px-4 py-2.5 text-white text-sm focus:outline-none"
                    placeholder="auto-generated-slug"
                    readOnly={locked || !isCustom}
                />
            </div>
            {locked && (
                <p className="mt-1.5 text-xs text-white/35">
                    {lockedMessage}
                </p>
            )}
        </div>
    );
}
