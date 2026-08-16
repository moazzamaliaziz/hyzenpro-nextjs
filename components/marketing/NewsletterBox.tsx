'use client';

import { useState } from 'react';

interface NewsletterBoxProps {
    variant?: 'inline' | 'card' | 'footer';
    title?: string;
    description?: string;
}

export default function NewsletterBox({
    variant = 'card',
    title = 'Stay Updated on AI',
    description = 'Get weekly insights on the best AI tools, tips, and industry news. No spam, unsubscribe anytime.'
}: NewsletterBoxProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !email.includes('@')) {
            setStatus('error');
            setMessage('Please enter a valid email address');
            return;
        }

        setStatus('loading');

        try {
            // In production, this would call an API endpoint
            // For now, we'll simulate success
            await new Promise(resolve => setTimeout(resolve, 1000));

            setStatus('success');
            setMessage('Thanks for subscribing! Check your email to confirm.');
            setEmail('');
        } catch (error) {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    if (variant === 'inline') {
        return (
            <form onSubmit={handleSubmit} className="newsletter-inline">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    aria-label="Email address for newsletter"
                    className="newsletter-input"
                    disabled={status === 'loading'}
                />
                <button
                    type="submit"
                    className="newsletter-btn"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
                {status !== 'idle' && (
                    <p className={`newsletter-message ${status}`}>{message}</p>
                )}
            </form>
        );
    }

    if (variant === 'footer') {
        return (
            <div className="newsletter-footer">
                <h4 className="font-heading text-xl text-white mb-2">{title}</h4>
                <p className="text-gray-400 text-sm mb-4">{description}</p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        aria-label="Email address for newsletter"
                        className="newsletter-input-dark"
                        disabled={status === 'loading'}
                    />
                    <button
                        type="submit"
                        className="newsletter-btn-dark"
                        disabled={status === 'loading'}
                        aria-label="Subscribe to newsletter"
                    >
                        {status === 'loading' ? '...' : '→'}
                    </button>
                </form>
                {status !== 'idle' && (
                    <p className={`newsletter-message mt-2 ${status}`}>{message}</p>
                )}
            </div>
        );
    }

    // Card variant (default)
    return (
        <div className="newsletter-card">
            <div className="newsletter-card-icon">📬</div>
            <h3 className="newsletter-card-title">{title}</h3>
            <p className="newsletter-card-description">{description}</p>

            <form onSubmit={handleSubmit} className="newsletter-card-form">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    aria-label="Email address for newsletter"
                    className="newsletter-card-input"
                    disabled={status === 'loading'}
                />
                <button
                    type="submit"
                    className="newsletter-card-btn"
                    disabled={status === 'loading'}
                >
                    {status === 'loading' ? 'Subscribing...' : 'Subscribe Free'}
                </button>
            </form>

            {status !== 'idle' && (
                <p className={`newsletter-message mt-4 ${status}`}>{message}</p>
            )}

            <p className="newsletter-card-privacy">
                🔒 We respect your privacy. Unsubscribe anytime.
            </p>
        </div>
    );
}
