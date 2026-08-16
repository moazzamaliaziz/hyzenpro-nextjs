'use client';

import { useState, useMemo } from 'react';
import { formatDateShort } from '@/lib/utils';

export interface XReview {
    id: string;
    author: string;
    handle: string;
    avatar?: string;
    content: string;
    date: string;
    likes?: number;
    verified?: boolean;
    toolSlug?: string;
}

interface XReviewsProps {
    reviews: XReview[];
    title?: string;
    subtitle?: string;
    variant?: 'carousel' | 'grid' | 'list';
    showAddReview?: boolean;
    limit?: number;
    toolSlug?: string;
}

export default function XReviews({
    reviews = [],
    title = "COMMUNITY VOICES",
    subtitle = "Real feedback from X (formerly Twitter)",
    variant = 'carousel',
    showAddReview = true,
    limit = 6,
    toolSlug,
}: XReviewsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Filter reviews if toolSlug is provided, otherwise show homepage reviews
    const filteredReviews = useMemo(() => {
        if (!reviews || reviews.length === 0) return [];

        let items = toolSlug
            ? reviews.filter(r => r.toolSlug === toolSlug)
            : reviews.filter(r => !r.toolSlug || r.toolSlug === '');

        // If no tool-specific reviews, show general ones as fallback
        if (toolSlug && items.length === 0) {
            items = reviews.filter(r => !r.toolSlug || r.toolSlug === '').slice(0, 3);
        }

        return items.slice(0, limit);
    }, [reviews, toolSlug, limit]);

    if (filteredReviews.length === 0) return null;

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % filteredReviews.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + filteredReviews.length) % filteredReviews.length);
    };

    const XLogo = ({ className = "w-5 h-5" }) => (
        <svg viewBox="0 0 24 24" className={`${className} fill-current`}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );

    if (variant === 'grid' || variant === 'list') {
        return (
            <div className={`x-reviews-${variant} py-12`}>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <XLogo className="w-4 h-4 text-gray-400" />
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{subtitle}</span>
                        </div>
                        <h2 className="font-heading text-3xl text-black">{title}</h2>
                    </div>
                </div>

                <div className={variant === 'grid' ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
                    {filteredReviews.map((review) => (
                        <div key={review.id} className="group relative bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-black transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gray-100 ring-2 ring-gray-50 group-hover:ring-black/5 transition-all">
                                        <img
                                            src={review.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=random&bold=true`}
                                            alt={review.author}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-black text-sm leading-tight hover:underline cursor-pointer">{review.author}</span>
                                            {review.verified && (
                                                <svg className="w-3.5 h-3.5 text-[#1D9BF0]" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </div>
                                        <span className="text-gray-500 text-xs">{review.handle}</span>
                                    </div>
                                </div>
                                <XLogo className="w-4 h-4 text-black opacity-20 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <p className="text-gray-800 text-[0.9375rem] leading-relaxed mb-4">
                                {review.content}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-[0.75rem] text-gray-600">
                                <span className="hover:text-black cursor-pointer transition-colors">{formatDateShort(review.date)}</span>
                                {review.likes !== undefined && (
                                    <span className="flex items-center gap-1 hover:text-red-500 cursor-pointer transition-colors">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        {review.likes}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="x-reviews-carousel py-20 bg-[#fafafa]">
            <div className="container">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full mb-6">
                        <XLogo className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black text-black uppercase tracking-[0.3em]">{subtitle}</span>
                    </div>
                    <h2 className="font-heading text-4xl md:text-6xl text-black leading-tight">{title}</h2>
                </div>

                <div className="relative max-w-5xl mx-auto px-4">
                    <div className="relative bg-white rounded-[2.5rem] p-8 md:p-16 shadow-[0_10px_50px_rgba(0,0,0,0.05)] border border-gray-100 min-h-[400px] flex flex-col justify-center">
                        <div className="absolute top-10 right-10 opacity-10">
                            <XLogo className="w-12 h-12" />
                        </div>

                        <div className="flex items-center gap-5 mb-10">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-gray-50 shadow-sm">
                                <img
                                    src={filteredReviews[currentIndex].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(filteredReviews[currentIndex].author)}&background=random&bold=true`}
                                    alt={filteredReviews[currentIndex].author}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-2xl text-black">{filteredReviews[currentIndex].author}</span>
                                    {filteredReviews[currentIndex].verified && (
                                        <svg className="w-5 h-5 text-[#1D9BF0]" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <span className="text-gray-500 text-lg">{filteredReviews[currentIndex].handle}</span>
                            </div>
                        </div>

                        <div className="mb-10">
                            <p className="text-2xl md:text-3xl text-gray-800 leading-snug font-medium italic">
                                "{filteredReviews[currentIndex].content}"
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-auto">
                            <div className="text-gray-400 font-medium">
                                {formatDateShort(filteredReviews[currentIndex].date)}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={prevSlide}
                                    className="w-14 h-14 bg-gray-50 text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
                                    aria-label="Previous"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="w-14 h-14 bg-gray-50 text-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all duration-300"
                                    aria-label="Next"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-3 mt-12">
                        {filteredReviews.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? 'bg-black w-10' : 'bg-gray-200 w-4 hover:bg-gray-300'
                                    }`}
                                aria-label={`Slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {showAddReview && (
                    <div className="text-center mt-12">
                        <a
                            href="https://twitter.com/intent/tweet?text=Checking%20out%20@hyzenpro%20for%20the%20best%20AI%20tool%20reviews!%20🚀"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary inline-flex items-center gap-3 px-10 py-5 bg-black text-white rounded-full font-bold hover:scale-105 transition-transform"
                        >
                            <XLogo className="w-5 h-5" />
                            JOIN THE CONVERSATION
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
