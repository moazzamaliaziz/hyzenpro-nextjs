'use client';

interface Author {
    name: string;
    role?: string;
    avatar?: string;
    bio?: string;
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
    const initials = author.name.split(' ').map(n => n[0]).join('').toUpperCase();

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-semibold text-sm">
                    {author.avatar ? (
                        <img src={author.avatar} alt={author.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        initials
                    )}
                </div>
                <div>
                    <div className="font-semibold text-sm">{author.name}</div>
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
                        <img src={author.avatar} alt={author.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-2xl font-bold">{initials}</span>
                    )}
                </div>
                <div className="author-box-info">
                    <div className="flex items-center gap-2">
                        <h4 className="font-heading text-xl">{author.name}</h4>
                        <span className="author-verified-badge" title="Verified Expert">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </span>
                    </div>
                    {author.role && (
                        <div className="text-gray-500 text-sm">{author.role}</div>
                    )}
                </div>
            </div>

            {showBio && author.bio && (
                <p className="author-box-bio">{author.bio}</p>
            )}

            {/* E-E-A-T Trust Signals */}
            <div className="author-box-trust">
                <div className="author-trust-badge">
                    <span className="text-green-500">✓</span>
                    Expert Verified
                </div>
                <div className="author-trust-badge">
                    <span className="text-blue-500">🔬</span>
                    Hands-on Testing
                </div>
            </div>

            {/* Social Links */}
            {author.socialLinks && (
                <div className="author-box-social">
                    {author.socialLinks.twitter && (
                        <a href={author.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="author-social-link">
                            𝕏
                        </a>
                    )}
                    {author.socialLinks.linkedin && (
                        <a href={author.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="author-social-link">
                            in
                        </a>
                    )}
                    {author.socialLinks.website && (
                        <a href={author.socialLinks.website} target="_blank" rel="noopener noreferrer" className="author-social-link">
                            🌐
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
