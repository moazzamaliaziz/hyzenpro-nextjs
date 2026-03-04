'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Grid3X3, List } from 'lucide-react';
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
    const [sortBy, setSortBy] = useState<'name' | 'rating' | 'views'>('name');

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
            result = result.filter((t) => t.pricingType === selectedPricing);
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
            return a.name.localeCompare(b.name);
        });

        return result;
    }, [tools, search, selectedCategory, selectedPricing, sortBy]);

    const hasFilters = search || selectedCategory !== 'all' || selectedPricing !== 'all';

    return (
        <div>
            {/* Search & Filters */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 mb-8">
                {/* Search */}
                <div className="relative mb-5">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search AI tools..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-white/25 focus:border-accent/50 focus:outline-none transition-colors text-sm"
                        id="tool-search"
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[160px]">
                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                            Category
                        </label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-white text-sm focus:border-accent/50 focus:outline-none"
                            id="category-filter"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.slug}>
                                    {cat.name} ({cat.toolCount})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex-1 min-w-[140px]">
                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                            Pricing
                        </label>
                        <select
                            value={selectedPricing}
                            onChange={(e) => setSelectedPricing(e.target.value)}
                            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-white text-sm focus:border-accent/50 focus:outline-none"
                            id="pricing-filter"
                        >
                            <option value="all">All Pricing</option>
                            <option value="free">Free</option>
                            <option value="freemium">Freemium</option>
                            <option value="paid">Paid</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>

                    <div className="flex-1 min-w-[120px]">
                        <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                            Sort
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="w-full px-3 py-2.5 bg-white/[0.04] border border-white/10 rounded-lg text-white text-sm focus:border-accent/50 focus:outline-none"
                            id="sort-filter"
                        >
                            <option value="name">Name</option>
                            <option value="rating">Rating</option>
                            <option value="views">Popular</option>
                        </select>
                    </div>

                    {hasFilters && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setSelectedCategory('all');
                                setSelectedPricing('all');
                            }}
                            className="px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-1"
                        >
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>

                {/* Results count */}
                <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
                    <span className="text-xs text-white/25">
                        {filtered.length} tool{filtered.length !== 1 ? 's' : ''} found
                    </span>
                </div>
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
                    <Search className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <h3 className="font-heading text-2xl text-white/40 mb-2">No Tools Found</h3>
                    <p className="text-white/20 text-sm">Try adjusting your filters or search term.</p>
                </div>
            )}
        </div>
    );
}
