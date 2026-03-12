'use client';

import { useState, useMemo, useRef } from 'react';
import { Search, X, ChevronRight, ChevronLeft } from 'lucide-react';
import ToolCard from '@/components/tools/ToolCard';

interface Tool {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    logo?: string | null;
    pricingType: string;
    rating?: number | null;
    primaryCategory?: string | null;
    views?: number;
    featured?: boolean;
    categoryIds: string[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
    toolCount: number;
}

interface ToolsFilterGridProps {
    tools: Tool[];
    categories: Category[];
}

export default function ToolsFilterGrid({ tools, categories }: ToolsFilterGridProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPricing, setSelectedPricing] = useState('all');
    const [sortBy, setSortBy] = useState<'name' | 'rating' | 'views'>('views');
    
    // Smooth scrolling for categories
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const filtered = useMemo(() => {
        let result = tools;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (t) =>
                    t.name.toLowerCase().includes(q) ||
                    t.shortDescription.toLowerCase().includes(q)
            );
        }

        if (selectedCategory !== 'all') {
            result = result.filter(
                (t) => t.primaryCategory === selectedCategory || t.categoryIds.includes(selectedCategory)
            );
        }

        if (selectedPricing !== 'all') {
            result = result.filter((t) => t.pricingType?.toLowerCase() === selectedPricing.toLowerCase());
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
            return a.name.localeCompare(b.name);
        });

        return result;
    }, [tools, search, selectedCategory, selectedPricing, sortBy]);

    const hasFilters = search || selectedCategory !== 'all' || selectedPricing !== 'all';
    
    // Helper to get top categories for quick filters (top 15 by toolCount)
    const topCategories = [...categories].sort((a, b) => b.toolCount - a.toolCount).slice(0, 15);

    return (
        <div>
            {/* Advanced Filter Dashboard */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 md:p-8 mb-10 shadow-sm relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-gray-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                {/* Main Search Bar */}
                <div className="relative mb-8 max-w-3xl mx-auto z-10">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Search className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search thousands of AI tools..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-14 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-xl text-black text-lg placeholder-gray-400 focus:bg-white focus:border-black focus:ring-4 focus:ring-gray-100 transition-all outline-none"
                    />
                    {search && (
                        <button 
                            onClick={() => setSearch('')}
                            className="absolute inset-y-0 right-5 flex items-center text-gray-400 hover:text-black transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                <div className="space-y-8 z-10 relative">
                    {/* Category Horizon */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                Top Categories
                            </label>
                            
                            {/* Scroll Controls */}
                            <div className="flex items-center gap-1 hidden md:flex">
                                <button onClick={() => scroll('left')} className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button onClick={() => scroll('right')} className="p-1 text-gray-400 hover:text-black hover:bg-gray-100 rounded-md transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div 
                            ref={scrollContainerRef}
                            className="flex overflow-x-auto gap-2 pb-2 scrollbar-none -mx-2 px-2 snap-x"
                        >
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all snap-start ${
                                    selectedCategory === 'all' 
                                    ? 'bg-black text-white shadow-md' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                All Tools
                            </button>
                            {topCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.slug)}
                                    className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium rounded-xl transition-all snap-start flex items-center gap-2 ${
                                        selectedCategory === cat.slug 
                                        ? 'bg-black text-white shadow-md' 
                                        : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {cat.name}
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${selectedCategory === cat.slug ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {cat.toolCount}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between border-t border-gray-100 pt-6">
                        {/* Pricing Pills */}
                        <div>
                            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3 block flex gap-1.5 items-center">
                                Pricing Model
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'free', 'freemium', 'paid', 'enterprise'].map((price) => (
                                    <button
                                        key={price}
                                        onClick={() => setSelectedPricing(price)}
                                        className={`px-4 py-2.5 text-sm font-medium capitalize rounded-xl transition-all ${
                                            selectedPricing === price 
                                            ? 'bg-gray-900 text-white shadow-sm' 
                                            : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {price}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Sort & Clear Actions */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                                {['views', 'rating', 'name'].map((sortType) => (
                                    <button
                                        key={sortType}
                                        onClick={() => setSortBy(sortType as any)}
                                        className={`px-3 py-1.5 text-xs font-semibold capitalize rounded-lg transition-colors ${
                                            sortBy === sortType 
                                            ? 'bg-white text-black shadow-sm border border-gray-200/50' 
                                            : 'text-gray-500 hover:text-black'
                                        }`}
                                    >
                                        {sortType === 'views' ? 'Popular' : sortType}
                                    </button>
                                ))}
                            </div>
                            
                            {hasFilters && (
                                <button
                                    onClick={() => {
                                        setSearch('');
                                        setSelectedCategory('all');
                                        setSelectedPricing('all');
                                    }}
                                    className="px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors hidden sm:block"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results meta */}
            <div className="flex items-center justify-between mb-6 px-1">
                <h2 className="text-xl font-heading text-black">
                    {selectedCategory === 'all' 
                        ? 'Explore All Tools' 
                        : `${categories.find(c => c.slug === selectedCategory)?.name || 'Filtered'} Tools`
                    }
                </h2>
                <div className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">
                    {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((tool, i) => (
                        <ToolCard key={tool.id} tool={tool} priority={i < 8} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-white border border-gray-200 rounded-3xl shadow-sm">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-300" />
                    </div>
                    <h3 className="font-heading text-2xl text-black mb-2">No tools match your criteria</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
                        We couldn't find any AI tools matching your exact filters. Try broadening your search or clearing some filters.
                    </p>
                    <button
                        onClick={() => {
                            setSearch('');
                            setSelectedCategory('all');
                            setSelectedPricing('all');
                        }}
                        className="px-6 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        Clear All Filters
                    </button>
                </div>
            )}
        </div>
    );
}
