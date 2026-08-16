'use client';

import { Shield, Clock, CheckCircle2 } from 'lucide-react';

type Variant = 'banner' | 'modal';

interface VendorReviewNoticeProps {
    variant?: Variant;
    onAcknowledge?: () => void;
}

export default function VendorReviewNotice({ variant = 'banner', onAcknowledge }: VendorReviewNoticeProps) {
    const content = (
        <>
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white">
                    <Shield className="h-5 w-5" />
                </div>
                <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
                    <p className="font-semibold text-black text-base">
                        Editorial review before publication
                    </p>
                    <p>
                        At HyzenPro, every submitted tool goes through a detailed review process before publication.
                        Our team carefully checks your website&apos;s privacy policy, security practices, user experience,
                        and overall trustworthiness to ensure it is not misleading, harmful, or spam-related.
                        We also review public reputation platforms like Trustpilot when applicable.
                    </p>
                    <p className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-4 w-4 shrink-0 text-black" />
                        Once verification is complete, approved tools are usually published within{' '}
                        <strong className="text-black">3–4 business days</strong>.
                    </p>
                    <ul className="space-y-1.5">
                        {[
                            'Privacy policy & security practices review',
                            'UX and listing accuracy check',
                            'Reputation screening when applicable',
                        ].map((item) => (
                            <li key={item} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            {onAcknowledge && (
                <button
                    type="button"
                    onClick={onAcknowledge}
                    className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-colors"
                >
                    I understand — continue to submit
                </button>
            )}
        </>
    );

    if (variant === 'modal') {
        return (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
                    {content}
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 mb-6">
            {content}
        </div>
    );
}
