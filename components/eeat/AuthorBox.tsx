'use client';

import Link from 'next/link';
import { CheckCircle, Globe, Linkedin, Microscope, Twitter } from 'lucide-react';

interface Author {
    name: string;
    role?: string;
    avatar?: string;
    bio?: string;
    slug?: string | null;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        website?: string;
    };
}

interface AuthorBoxProps {
    author: Author;
    showBio?: boolean;
    variant?: 'compact' | 'full';
}

export default function AuthorBox({ author, showBio = true, variant = 'full' }: AuthorBoxProps) {
    const initials = author.name.split(' ').map((namePart) => namePart[0]).join('').toUpperCase();

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-gray-700 to-gray-900 text-sm font-semibold text-white">
                    {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <div>
                    <div className="text-sm font-semibold">{author.name}</div>
                    {author.role && <div className="text-xs text-gray-500">{author.role}</div>}
                </div>
            </div>
        );
    }

    return (
        <div className="author-box">
            <div className="author-box-header">
                <div className="author-box-avatar">
                    {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold">{initials}</span>
                    )}
                </div>
                <div className="author-box-info">
                    <div className="flex items-center gap-2">
                        {author.slug ? (
                            <Link href={`/author/${author.slug}`} className="font-heading text-xl hover:underline">{author.name}</Link>
                        ) : (
                            <h4 className="font-heading text-xl">{author.name}</h4>
                        )}
                        <span className="author-verified-badge" title="Verified expert">
                            <CheckCircle className="h-4 w-4" aria-hidden="true" />
                        </span>
                    </div>
                    {author.role && (
                        <div className="text-sm text-gray-500">{author.role}</div>
                    )}
                </div>
            </div>

            {showBio && author.bio && (
                <p className="author-box-bio">{author.bio}</p>
            )}

            <div className="author-box-trust">
                <div className="author-trust-badge">
                    <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
                    Expert Verified
                </div>
                <div className="author-trust-badge">
                    <Microscope className="h-4 w-4 text-black" aria-hidden="true" />
                    Hands-on Testing
                </div>
            </div>

            {author.socialLinks && (
                <div className="author-box-social">
                    {author.socialLinks.twitter && (
                        <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="author-social-link">
                            <Twitter className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Twitter</span>
                        </a>
                    )}
                    {author.socialLinks.linkedin && (
                        <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="author-social-link">
                            <Linkedin className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">LinkedIn</span>
                        </a>
                    )}
                    {author.socialLinks.website && (
                        <a href={author.socialLinks.website} target="_blank" rel="noopener noreferrer" className="author-social-link">
                            <Globe className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Website</span>
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
