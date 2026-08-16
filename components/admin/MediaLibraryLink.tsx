'use client';

import Link from 'next/link';
import { ExternalLink, ImagePlus } from 'lucide-react';

interface MediaLibraryLinkProps {
    helperText?: string;
    tone?: 'dark' | 'light';
}

export default function MediaLibraryLink({
    helperText = 'Upload in the Media Library, then paste the generated image URL here.',
    tone = 'dark',
}: MediaLibraryLinkProps) {
    const isLight = tone === 'light';

    return (
        <div className={`mt-2 flex flex-wrap items-center gap-2 text-xs ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
            <Link
                href="/admin/media"
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-medium transition-colors ${
                    isLight
                        ? 'border border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100'
                        : 'border border-accent/25 bg-accent/10 text-accent hover:bg-accent/15'
                }`}
            >
                <ImagePlus className="h-3.5 w-3.5" />
                Open Media Library
                <ExternalLink className="h-3 w-3" />
            </Link>
            <span>{helperText}</span>
        </div>
    );
}
