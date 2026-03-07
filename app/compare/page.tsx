'use client';

import { useCompare } from '@/components/compare/CompareContext';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

export default function ComparePage() {
    const { selectedTools, removeTool } = useCompare();
    const [fullTools, setFullTools] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTools = async () => {
            if (selectedTools.length === 0) {
                setLoading(false);
                return;
            }

            try {
                const ids = selectedTools.map(t => t.id).join(',');
                const res = await fetch(`/api/tools/compare?ids=${ids}`);
                if (res.ok) {
                    const data = await res.json();
                    setFullTools(data);
                }
            } catch (error) {
                console.error("Failed to fetch compare data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTools();
    }, [selectedTools]);

    if (!loading && selectedTools.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-24 px-4 bg-gray-50 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                    <span className="text-4xl">⚖️</span>
                </div>
                <h1 className="text-3xl font-heading text-black mb-3">Compare Empty</h1>
                <p className="text-gray-500 max-w-md mb-8">
                    You haven't selected any tools to compare yet. Browse the directory and click the scale icon on any tool card.
                </p>
                <Link href="/ai-tools-directory" className="px-6 py-3 bg-black text-white rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-colors">
                    Explore Directory
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-28 pb-24 bg-white relative">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-8">
                    <Link href="/ai-tools-directory" className="inline-flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Directory
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-heading text-black">Feature Matrix</h1>
                    <p className="text-gray-500 mt-2">Side-by-side technical comparison of your selected AI platforms.</p>
                </div>

                {loading ? (
                    <div className="flex animate-pulse gap-6 border-t border-gray-100 pt-8">
                        {[1, 2, 3].slice(0, Math.max(1, selectedTools.length)).map(i => (
                            <div key={i} className="flex-1 bg-gray-50 rounded-3xl h-[600px] border border-gray-100"></div>
                        ))}
                    </div>
                ) : (
                    <div className="overflow-x-auto pb-8 border-t border-gray-100 pt-8">
                        <div className="min-w-[800px] flex gap-6">
                            {fullTools.map((tool) => (
                                <div key={tool.id} className="flex-1 min-w-[300px] max-w-[400px] bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all relative flex flex-col">

                                    {/* Header */}
                                    <div className="p-6 pb-6 border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white relative">
                                        <button
                                            onClick={() => removeTool(tool.id)}
                                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full hover:bg-red-50"
                                            title="Remove from compare"
                                        >
                                            <XCircle className="w-6 h-6" />
                                        </button>
                                        <div className="w-20 h-20 bg-white border border-gray-200 rounded-2xl mb-5 overflow-hidden flex items-center justify-center shadow-sm">
                                            {tool.logo ? <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" /> : tool.name.charAt(0)}
                                        </div>
                                        <h2 className="text-2xl font-heading text-black mb-2">{tool.name}</h2>
                                        <p className="text-sm text-gray-500 line-clamp-3">{tool.shortDescription}</p>
                                    </div>

                                    {/* Financial & Category Metrics */}
                                    <div className="p-6 border-b border-gray-100 bg-white">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Pricing & Category</div>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg font-bold uppercase tracking-wider">{tool.pricingType}</span>
                                            <span className="text-xs px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold uppercase tracking-wider">{tool.primaryCategory}</span>
                                        </div>
                                    </div>

                                    {/* Unified Features List */}
                                    <div className="p-6 border-b border-gray-100 bg-white">
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Core Capabilities</div>
                                        <ul className="space-y-4">
                                            {tool.features && Array.isArray(tool.features) && tool.features.length > 0 ? (
                                                tool.features.map((feat: any, i: number) => (
                                                    <li key={i} className="flex gap-3 text-sm text-gray-700 font-medium">
                                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                        <span className="leading-snug">{feat.name || feat}</span>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="text-sm text-gray-400 italic">No capabilities listed.</li>
                                            )}
                                        </ul>
                                    </div>

                                    {/* Pros & Cons Container */}
                                    <div className="flex flex-col flex-1 divide-y divide-gray-100 border-b border-gray-100">
                                        {/* Pros */}
                                        <div className="p-6 bg-emerald-50/20 flex-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-4">Advantages</div>
                                            <ul className="space-y-3">
                                                {tool.pros && Array.isArray(tool.pros) && tool.pros.length > 0 ? (
                                                    tool.pros.map((pro: string, i: number) => (
                                                        <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                                                            <span className="text-emerald-500 font-bold mt-0.5">+</span>
                                                            <span className="leading-snug">{pro}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-sm text-gray-400 italic">None listed.</li>
                                                )}
                                            </ul>
                                        </div>

                                        {/* Cons */}
                                        <div className="p-6 bg-red-50/20 flex-1">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-4">Limitations</div>
                                            <ul className="space-y-3">
                                                {tool.cons && Array.isArray(tool.cons) && tool.cons.length > 0 ? (
                                                    tool.cons.map((con: string, i: number) => (
                                                        <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                                                            <span className="text-red-400 font-bold mt-0.5">-</span>
                                                            <span className="leading-snug">{con}</span>
                                                        </li>
                                                    ))
                                                ) : (
                                                    <li className="text-sm text-gray-400 italic">None listed.</li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Unified Footer CTA */}
                                    <div className="p-6 bg-gray-50 mt-auto flex flex-col gap-3">
                                        <a
                                            href={tool.websiteUrl ? `${tool.websiteUrl}?ref=hyzenpro` : '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all hover:-translate-y-0.5"
                                        >
                                            Visit Platform
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                        <Link
                                            href={`/ai-tools-directory/${tool.primaryCategory?.toLowerCase()}/${tool.slug}`}
                                            className="flex items-center justify-center w-full py-3 bg-white border border-gray-200 text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:border-black hover:bg-gray-50 transition-colors"
                                        >
                                            Read Full Review
                                        </Link>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
