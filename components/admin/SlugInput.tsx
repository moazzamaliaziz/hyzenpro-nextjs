'use client';

import { useEffect, useState } from 'react';

interface SlugInputProps {
    value: string;
    onChange: (value: string) => void;
    sourceValue?: string; // auto-generate slug from this (e.g., title)
    prefix?: string; // URL prefix like '/ai-tools-directory/'
}

function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function SlugInput({ value, onChange, sourceValue, prefix }: SlugInputProps) {
    const [isCustom, setIsCustom] = useState(false);

    useEffect(() => {
        if (!isCustom && sourceValue) {
            onChange(generateSlug(sourceValue));
        }
    }, [sourceValue, isCustom]);

    return (
        <div>
            <label className="block text-sm text-white/60 mb-1.5">
                URL Slug
                {!isCustom && (
                    <button
                        type="button"
                        onClick={() => setIsCustom(true)}
                        className="ml-2 text-xs text-accent hover:text-accent/80 transition-colors"
                    >
                        Edit manually
                    </button>
                )}
                {isCustom && (
                    <button
                        type="button"
                        onClick={() => {
                            setIsCustom(false);
                            if (sourceValue) onChange(generateSlug(sourceValue));
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
                        setIsCustom(true);
                        onChange(generateSlug(e.target.value));
                    }}
                    className="flex-1 bg-transparent px-4 py-2.5 text-white text-sm focus:outline-none"
                    placeholder="auto-generated-slug"
                    readOnly={!isCustom}
                />
            </div>
        </div>
    );
}
