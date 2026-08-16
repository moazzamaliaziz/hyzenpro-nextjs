'use client';

import { Twitter, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
    url: string;
    title: string;
}

export default function SocialShare({ url, title }: SocialShareProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return (
        <div className="flex flex-row md:flex-col gap-3">
            <a
                href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-blue-500 hover:border-blue-500 transition-colors shadow-sm"
                aria-label="Share on X (Twitter)"
            >
                <Twitter className="w-5 h-5 fill-current" />
            </a>

            <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-blue-700 hover:border-blue-700 transition-colors shadow-sm"
                aria-label="Share on LinkedIn"
            >
                <Linkedin className="w-5 h-5 fill-current" />
            </a>

            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors shadow-sm"
                aria-label="Share on Facebook"
            >
                <Facebook className="w-5 h-5 fill-current" />
            </a>

            <button
                onClick={handleCopy}
                className="p-3 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-black hover:border-black transition-colors shadow-sm relative group"
                aria-label="Copy link"
            >
                <LinkIcon className="w-5 h-5" />
                {copied && (
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest rounded whitespace-nowrap">
                        Copied!
                    </span>
                )}
            </button>
        </div>
    );
}
