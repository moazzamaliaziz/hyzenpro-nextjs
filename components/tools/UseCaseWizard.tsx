'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ArrowRight, ArrowLeft, Sparkles, Video, PenTool, Image as ImageIcon,
    Code, Megaphone, Bot, Music, Search, Zap, CheckCircle2, RotateCcw
} from 'lucide-react';

const USE_CASES = [
    { id: 'ai-video-tools', label: 'Generate Videos', icon: Video, description: 'Create, edit, and produce AI-powered videos' },
    { id: 'ai-writing-tools', label: 'Write Content', icon: PenTool, description: 'Blog posts, copy, emails, and creative writing' },
    { id: 'ai-image-tools', label: 'Create Images', icon: ImageIcon, description: 'Generate, edit, and enhance visual assets' },
    { id: 'ai-code-tools', label: 'Write Code', icon: Code, description: 'AI pair programming and code generation' },
    { id: 'ai-marketing-tools', label: 'Automate Marketing', icon: Megaphone, description: 'SEO, ads, social media, and growth' },
    { id: 'ai-chatbot-tools', label: 'Build Chatbots', icon: Bot, description: 'Customer service and conversational AI' },
    { id: 'ai-audio-tools', label: 'Audio & Voice', icon: Music, description: 'Text-to-speech, music, and audio editing' },
    { id: 'ai-seo-tools', label: 'Optimize SEO', icon: Search, description: 'Keyword research, audits, and rankings' },
    { id: 'ai-automation-tools', label: 'Automate Workflows', icon: Zap, description: 'No-code automation and integrations' },
];

const PRICING_OPTIONS = [
    { id: 'any', label: 'Any Budget', description: 'Show all pricing tiers' },
    { id: 'free', label: 'Free Only', description: 'Completely free to use' },
    { id: 'freemium', label: 'Freemium', description: 'Free tier with paid upgrades' },
    { id: 'paid', label: 'Paid', description: 'Premium tools with paid plans' },
];

const SORT_OPTIONS = [
    { id: 'views', label: 'Most Popular', description: 'Ranked by community adoption' },
    { id: 'rating', label: 'Highest Rated', description: 'Top-rated by verified reviews' },
    { id: 'newest', label: 'Newest First', description: 'Recently added to the directory' },
];

interface ToolResult {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    logo?: string | null;
    pricingType: string;
    rating?: number | null;
    primaryCategory?: string | null;
    views?: number;
}

export default function UseCaseWizard() {
    const [step, setStep] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPricing, setSelectedPricing] = useState('any');
    const [selectedSort, setSelectedSort] = useState('views');
    const [results, setResults] = useState<ToolResult[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (selectedCategory) params.set('category', selectedCategory);
            if (selectedPricing !== 'any') params.set('pricing', selectedPricing);
            params.set('sort', selectedSort);

            const res = await fetch(`/api/tools/recommend?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (step === 3) {
            fetchResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [step]);

    const reset = () => {
        setStep(0);
        setSelectedCategory('');
        setSelectedPricing('any');
        setSelectedSort('views');
        setResults([]);
    };

    const steps = [
        {
            title: 'What do you want to do?',
            subtitle: 'Select the primary use case for the AI tool you need.',
        },
        {
            title: 'What\'s your budget?',
            subtitle: 'Filter by pricing to find tools that fit your plan.',
        },
        {
            title: 'How should we rank them?',
            subtitle: 'Choose how to sort your personalized results.',
        },
        {
            title: 'Your Recommendations',
            subtitle: `Based on your selections, here are the best tools for "${USE_CASES.find(u => u.id === selectedCategory)?.label || 'your use case'}".`,
        },
    ];

    return (
        <div className="w-full max-w-5xl mx-auto">
            {/* Progress Bar */}
            <div className="flex items-center gap-2 mb-12">
                {steps.map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${i <= step ? 'bg-black w-full' : 'bg-transparent w-0'
                                }`}
                        />
                    </div>
                ))}
            </div>

            {/* Step Header */}
            <div className="text-center mb-10">
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Step {step + 1} of {steps.length}
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl text-black mb-2">
                    {steps[step].title}
                </h2>
                <p className="text-gray-500 max-w-lg mx-auto">{steps[step].subtitle}</p>
            </div>

            {/* Step Content */}
            <div className="min-h-[320px]">
                {/* Step 0: Use Case Selection */}
                {step === 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {USE_CASES.map((useCase) => {
                            const Icon = useCase.icon;
                            const isSelected = selectedCategory === useCase.id;
                            return (
                                <button
                                    key={useCase.id}
                                    onClick={() => {
                                        setSelectedCategory(useCase.id);
                                        setTimeout(() => setStep(1), 300);
                                    }}
                                    className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-300 group hover:-translate-y-1 ${isSelected
                                            ? 'border-black bg-black text-white shadow-xl'
                                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${isSelected ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-gray-100'
                                        }`}>
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-black'}`} />
                                    </div>
                                    <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-black'}`}>
                                        {useCase.label}
                                    </div>
                                    <div className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                        {useCase.description}
                                    </div>
                                    {isSelected && (
                                        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-white" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Step 1: Pricing Selection */}
                {step === 1 && (
                    <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {PRICING_OPTIONS.map((option) => {
                            const isSelected = selectedPricing === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setSelectedPricing(option.id);
                                        setTimeout(() => setStep(2), 300);
                                    }}
                                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${isSelected
                                            ? 'border-black bg-black text-white shadow-xl'
                                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg'
                                        }`}
                                >
                                    <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-black'}`}>
                                        {option.label}
                                    </div>
                                    <div className={`text-sm ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                        {option.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Step 2: Sort Selection */}
                {step === 2 && (
                    <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        {SORT_OPTIONS.map((option) => {
                            const isSelected = selectedSort === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        setSelectedSort(option.id);
                                        setTimeout(() => setStep(3), 300);
                                    }}
                                    className={`text-left p-6 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${isSelected
                                            ? 'border-black bg-black text-white shadow-xl'
                                            : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg'
                                        }`}
                                >
                                    <div className={`font-bold text-lg mb-1 ${isSelected ? 'text-white' : 'text-black'}`}>
                                        {option.label}
                                    </div>
                                    <div className={`text-sm ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                        {option.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Step 3: Results */}
                {step === 3 && (
                    <div>
                        {loading ? (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="bg-gray-50 rounded-2xl h-48 animate-pulse border border-gray-100" />
                                ))}
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-4xl mb-4">🔍</div>
                                <p className="text-gray-500 mb-6">No tools found matching your criteria. Try broadening your filters.</p>
                                <button onClick={reset} className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-bold text-sm">
                                    <RotateCcw className="w-4 h-4" /> Start Over
                                </button>
                            </div>
                        ) : (
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.map((tool, index) => (
                                    <Link
                                        key={tool.id}
                                        href={`/ai-tools-directory/${tool.primaryCategory || 'ai-general-tools'}/${tool.slug}`}
                                        className="group relative p-5 bg-white rounded-2xl border border-gray-200 hover:border-black hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="absolute top-3 right-3 px-2 py-0.5 bg-gray-100 rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                                            #{index + 1}
                                        </div>
                                        <div className="w-14 h-14 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center mb-4 overflow-hidden">
                                            {tool.logo ? (
                                                <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-heading text-black">{tool.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-black text-base mb-1 group-hover:text-black dark:text-white transition-colors">{tool.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{tool.shortDescription}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md font-bold uppercase">{tool.pricingType}</span>
                                            {tool.rating && (
                                                <span className="text-[10px] px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded-md font-bold">★ {tool.rating.toFixed(1)}</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-gray-100">
                {step > 0 && step < 3 ? (
                    <button
                        onClick={() => setStep(step - 1)}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                ) : step === 3 ? (
                    <button
                        onClick={reset}
                        className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" /> Start Over
                    </button>
                ) : (
                    <div />
                )}

                {step < 3 && selectedCategory && (
                    <button
                        onClick={() => setStep(step + 1)}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Continue <ArrowRight className="w-4 h-4" />
                    </button>
                )}

                {step === 3 && results.length > 0 && (
                    <Link
                        href="/ai-tools-directory/"
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Browse Full Directory <ArrowRight className="w-4 h-4" />
                    </Link>
                )}
            </div>
        </div>
    );
}
