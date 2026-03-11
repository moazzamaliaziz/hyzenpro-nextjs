'use client';

import { useState, useMemo } from 'react';
import ToolCard from '@/components/tools/ToolCard';
import { Filter, SlidersHorizontal, ArrowDownUp, Check } from 'lucide-react';

interface Tool {
    id: string;
    name: string;
    slug: string;
    tagline: string;
    description: string;
    logoUrl: string | null;
    pricingType: string;
    pricingPlans: any[];
    features: string[];
    views: number;
    metrics: any;
    status: string;
}

interface CategoryFilterAppProps {
    initialTools: Tool[];
    allPricingTypes: string[];
    allFeatures: string[];
}

type SortOption = 'popular' | 'newest' | 'alphabetical';

export default function CategoryFilterApp({ initialTools, allPricingTypes, allFeatures }: CategoryFilterAppProps) {
    const [selectedPricing, setSelectedPricing] = useState<string[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Filter Logic
    const filteredTools = useMemo(() => {
        return initialTools.filter(tool => {
            // Pricing Filter
            if (selectedPricing.length > 0 && !selectedPricing.includes(tool.pricingType)) {
                return false;
            }

            // Features Filter (Tool must have AT LEAST ONE of the selected features)
            if (selectedFeatures.length > 0) {
                const hasFeature = selectedFeatures.some(f => tool.features.includes(f));
                if (!hasFeature) return false;
            }

            return true;
        });
    }, [initialTools, selectedPricing, selectedFeatures]);

    // Sort Logic
    const sortedTools = useMemo(() => {
        const tools = [...filteredTools];
        switch (sortBy) {
            case 'popular':
                return tools.sort((a, b) => b.views - a.views);
            case 'newest':
                // In a real app we'd sort by createdAt. Assuming views roughly correlates or we default to initial state
                return tools;
            case 'alphabetical':
                return tools.sort((a, b) => a.name.localeCompare(b.name));
            default:
                return tools;
        }
    }, [filteredTools, sortBy]);

    const togglePricing = (pricing: string) => {
        setSelectedPricing(prev => 
            prev.includes(pricing) ? prev.filter(p => p !== pricing) : [...prev, pricing]
        );
    };

    const toggleFeature = (feature: string) => {
        setSelectedFeatures(prev => 
            prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
        );
    };

    const clearFilters = () => {
        setSelectedPricing([]);
        setSelectedFeatures([]);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden flex items-center justify-between mb-4">
                <button
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters {(selectedPricing.length > 0 || selectedFeatures.length > 0) && `(${selectedPricing.length + selectedFeatures.length})`}
                </button>
                
                <div className="flex items-center gap-2">
                    <ArrowDownUp className="w-4 h-4 text-gray-500" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer"
                    >
                        <option value="popular">Most Popular</option>
                        <option value="alphabetical">Alphabetical</option>
                    </select>
                </div>
            </div>

            {/* Sidebar Filters */}
            <aside className={`w-full lg:w-64 flex-shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:sticky lg:top-24 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-heading text-lg flex items-center gap-2">
                            <Filter className="w-4 h-4" /> Filters
                        </h3>
                        {(selectedPricing.length > 0 || selectedFeatures.length > 0) && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-red-500 hover:text-red-600 font-medium"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {/* Pricing Filter */}
                    <div className="mb-8 block">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Pricing</h4>
                        <div className="space-y-3">
                            {allPricingTypes.map(pricing => (
                                <label key={pricing} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        selectedPricing.includes(pricing)
                                            ? 'bg-black border-black dark:bg-white dark:border-white'
                                            : 'border-gray-300 dark:border-gray-700 group-hover:border-gray-400'
                                    }`}>
                                        {selectedPricing.includes(pricing) && <Check className="w-3 h-3 text-white dark:text-black" />}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{pricing.replace('-', ' ')}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 dark:bg-gray-800 my-6" />

                    {/* Features Filter */}
                    <div className="mb-4 block">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Key Features</h4>
                        <div className="space-y-3">
                            {allFeatures.map(feature => (
                                <label key={feature} className="flex items-center gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                        selectedFeatures.includes(feature)
                                            ? 'bg-black border-black dark:bg-white dark:border-white'
                                            : 'border-gray-300 dark:border-gray-700 group-hover:border-gray-400'
                                    }`}>
                                        {selectedFeatures.includes(feature) && <Check className="w-3 h-3 text-white dark:text-black" />}
                                    </div>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 line-clamp-1">{feature}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
                {/* Desktop Sort Header */}
                <div className="hidden lg:flex justify-between items-center mb-6">
                    <p className="text-sm text-gray-500">
                        Showing <strong className="text-black dark:text-white">{sortedTools.length}</strong> tools
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="appearance-none bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg py-2 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white cursor-pointer"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                            <ArrowDownUp className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                {sortedTools.length > 0 ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sortedTools.map((tool) => (
                            <ToolCard key={tool.id} tool={tool} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
                        <Filter className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-heading mb-2">No tools match your filters</h3>
                        <p className="text-gray-500 mb-6">Try adjusting your pricing or feature selections.</p>
                        <button
                            onClick={clearFilters}
                            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold uppercase tracking-wider text-sm rounded-lg"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
