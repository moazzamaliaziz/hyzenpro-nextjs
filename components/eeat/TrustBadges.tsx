'use client';

import { formatDate } from '@/lib/utils';

interface TrustBadgesProps {
    lastUpdated?: string;
    testedDate?: string;
    showMethodology?: boolean;
}

export default function TrustBadges({ lastUpdated, testedDate, showMethodology = true }: TrustBadgesProps) {
    return (
        <div className="trust-badges">
            <div className="trust-badges-header">
                <h4 className="font-heading text-lg">Why Trust HyzenPro?</h4>
            </div>

            <div className="trust-badges-grid">
                {/* Expert Review Badge */}
                <div className="trust-badge">
                    <div className="trust-badge-icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <div className="trust-badge-content">
                        <div className="trust-badge-title">Expert Reviewed</div>
                        <div className="trust-badge-text">Tested by AI professionals</div>
                    </div>
                </div>

                {/* Hands-on Testing Badge */}
                <div className="trust-badge">
                    <div className="trust-badge-icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <div className="trust-badge-content">
                        <div className="trust-badge-title">Hands-on Testing</div>
                        <div className="trust-badge-text">We actually use the tools</div>
                    </div>
                </div>

                {/* No Sponsored Rankings */}
                <div className="trust-badge">
                    <div className="trust-badge-icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="trust-badge-content">
                        <div className="trust-badge-title">Unbiased Rankings</div>
                        <div className="trust-badge-text">Not influenced by sponsors</div>
                    </div>
                </div>

                {/* Regular Updates */}
                <div className="trust-badge">
                    <div className="trust-badge-icon">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </div>
                    <div className="trust-badge-content">
                        <div className="trust-badge-title">Regularly Updated</div>
                        <div className="trust-badge-text">Content reviewed monthly</div>
                    </div>
                </div>
            </div>

            {/* Dates */}
            <div className="trust-badges-dates">
                {lastUpdated && (
                    <div className="trust-date">
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="font-medium">{formatDate(lastUpdated)}</span>
                    </div>
                )}
                {testedDate && (
                    <div className="trust-date">
                        <span className="text-gray-500">Tested On:</span>
                        <span className="font-medium">{formatDate(testedDate)}</span>
                    </div>
                )}
            </div>

            {/* Methodology Link */}
            {showMethodology && (
                <a href="/how-we-test" className="trust-methodology-link">
                    Learn about our testing methodology →
                </a>
            )}
        </div>
    );
}
