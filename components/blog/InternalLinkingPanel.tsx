import Link from 'next/link';
import type { InternalLinkRecommendation } from '@/lib/blog-seo';

interface InternalLinkingPanelProps {
    links: InternalLinkRecommendation[];
}

export default function InternalLinkingPanel({ links }: InternalLinkingPanelProps) {
    if (links.length === 0) {
        return null;
    }

    return (
        <section className="my-12 border-y border-gray-200 py-8" aria-labelledby="continue-research-heading">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Continue your research</p>
            <h2 id="continue-research-heading" className="mt-3 font-heading text-3xl text-black">
                Build a stronger shortlist
            </h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
                {links.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition-colors hover:border-black hover:bg-white"
                    >
                        <span className="font-semibold text-black">{item.label}</span>
                        <span className="mt-2 block text-sm leading-6 text-gray-600">{item.description}</span>
                    </Link>
                ))}
            </div>
        </section>
    );
}
