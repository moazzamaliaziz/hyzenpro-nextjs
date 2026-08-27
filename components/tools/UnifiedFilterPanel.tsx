'use client';

import { useState, useMemo, useRef, useId, useEffect, useCallback } from 'react';
import { Search, X, ChevronRight, ChevronLeft, Filter, SlidersHorizontal, ArrowDownUp, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { buildAdminLoginUrl } from '@/lib/admin';
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
    features?: string[];
}

interface Category {
    id: string;
    name: string;
    slug: string;
    toolCount: number;
}

interface UnifiedFilterPanelProps {
    tools: Tool[];
    categories?: Category[];
    isCategoryPage?: boolean;
    allPricingTypes?: string[];
    allFeatures?: string[];
}

type SortOption = 'popular' | 'rating' | 'alphabetical';

const INITIAL_VISIBLE_TOOLS = 24;
const VISIBLE_TOOLS_INCREMENT = 24;

export default function UnifiedFilterPanel({
    tools,
    categories = [],
    isCategoryPage = false,
    allPricingTypes = [],
    allFeatures = []
}: UnifiedFilterPanelProps) {
    const mobileSortId = useId();
    const desktopSortId = useId();

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedPricingList, setSelectedPricingList] = useState<string[]>([]);
    const [selectedPricing, setSelectedPricing] = useState('all');
    const [minRating, setMinRating] = useState(0);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>('popular');
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_TOOLS);
    const [savedToolIds, setSavedToolIds] = useState<Set<string>>(new Set());
    const [savedStateLoading, setSavedStateLoading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { data: session, status: sessionStatus } = useSession();
    const handleLogin = useCallback(() => {
        router.push(buildAdminLoginUrl(window.location.href));
    }, [router]);

    const toolIdsParam = useMemo(
        () => tools.map((tool) => tool.id).filter(Boolean).slice(0, 200).join(','),
        [tools],
    );

    useEffect(() => {
        if (!session || !toolIdsParam) {
            setSavedToolIds(new Set());
            setSavedStateLoading(false);
            return;
        }

        let cancelled = false;
        setSavedStateLoading(true);
        fetch(`/api/user/saved-tools?toolIds=${encodeURIComponent(toolIdsParam)}`, {
            credentials: 'include',
            cache: 'no-store',
        })
            .then(async (response) => (response.ok ? response.json() : { savedToolIds: [] }))
            .then((data: { savedToolIds?: string[] }) => {
                if (!cancelled) {
                    setSavedToolIds(new Set(Array.isArray(data.savedToolIds) ? data.savedToolIds : []));
                }
            })
            .catch(() => {
                if (!cancelled) setSavedToolIds(new Set());
            })
            .finally(() => {
                if (!cancelled) setSavedStateLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [session, toolIdsParam]);

    const handleSavedChange = useCallback((toolId: string, saved: boolean) => {
        setSavedToolIds((current) => {
            const next = new Set(current);
            if (saved) next.add(toolId);
            else next.delete(toolId);
            return next;
        });
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 300;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const filteredTools = useMemo(() => {
        return tools.filter((tool) => {
            if (search) {
                const q = search.toLowerCase();
                const matchName = tool.name.toLowerCase().includes(q);
                const matchDesc = tool.shortDescription.toLowerCase().includes(q);
                if (!matchName && !matchDesc) return false;
            }
            if (!isCategoryPage && selectedCategory !== 'all') {
                const matchesPrimary = tool.primaryCategory === selectedCategory;
                const matchesIds = tool.categoryIds.includes(selectedCategory);
                if (!matchesPrimary && !matchesIds) return false;
            }
            if (isCategoryPage && selectedPricingList.length > 0) {
                if (!selectedPricingList.includes(tool.pricingType.toLowerCase())) return false;
            }
            if (!isCategoryPage && selectedPricing !== 'all') {
                if (tool.pricingType.toLowerCase() !== selectedPricing.toLowerCase()) return false;
            }
            if (!isCategoryPage && minRating > 0) {
                if ((tool.rating || 0) < minRating) return false;
            }
            if (isCategoryPage && selectedFeatures.length > 0) {
                const toolFeatures = Array.isArray(tool.features) ? tool.features : [];
                const hasFeature = selectedFeatures.some(f => toolFeatures.includes(f));
                if (!hasFeature) return false;
            }
            return true;
        });
    }, [tools, search, selectedCategory, selectedPricing, selectedPricingList, selectedFeatures, isCategoryPage, minRating]);

    const sortedTools = useMemo(() => {
        const result = [...filteredTools];
        return result.sort((a, b) => {
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            if (sortBy === 'popular') return (b.views || 0) - (a.views || 0);
            return a.name.localeCompare(b.name);
        });
    }, [filteredTools, sortBy]);

    const hasActiveFilters = useMemo(() => {
        if (isCategoryPage) return selectedPricingList.length > 0 || selectedFeatures.length > 0;
        return search || selectedCategory !== 'all' || selectedPricing !== 'all' || minRating > 0;
    }, [isCategoryPage, search, selectedCategory, selectedPricing, selectedPricingList, selectedFeatures, minRating]);

    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_TOOLS);
    }, [search, selectedCategory, selectedPricing, minRating, selectedPricingList, selectedFeatures, sortBy]);

    const visibleTools = useMemo(
        () => sortedTools.slice(0, visibleCount),
        [sortedTools, visibleCount],
    );

    const clearAllFilters = () => {
        setSearch('');
        setSelectedCategory('all');
        setSelectedPricing('all');
        setSelectedPricingList([]);
        setSelectedFeatures([]);
        setMinRating(0);
    };

    const togglePricingCheckbox = (pricing: string) => {
        setSelectedPricingList((prev) =>
            prev.includes(pricing) ? prev.filter((p) => p !== pricing) : [...prev, pricing]
        );
    };

    const toggleFeatureCheckbox = (feature: string) => {
        setSelectedFeatures((prev) =>
            prev.includes(feature) ? prev.filter((f) => f !== feature) : [...prev, feature]
        );
    };

    const topCategories = useMemo(() => {
        return [...categories].sort((a, b) => b.toolCount - a.toolCount).slice(0, 15);
    }, [categories]);

    return (
        <div className="w-full">
            {/* DIRECTORY VIEW — Sticky Filter Bar */}
            {!isCategoryPage && (
                <div className="sticky top-20 z-30 mb-8">
                    <div className="bg-card/85 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-sm">
                        {/* Row 1: Search + Sort */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search AI tools..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-11 pr-10 py-3 bg-muted border border-border rounded-xl text-foreground text-sm placeholder-muted-foreground focus:border-foreground focus:outline-none transition-colors"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                                <label htmlFor={desktopSortId} className="sr-only">Sort tools</label>
                                <select
                                    id={desktopSortId}
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                                    className="text-sm bg-muted border border-border rounded-xl px-3 py-3 focus:outline-none focus:border-foreground cursor-pointer font-medium text-foreground"
                                >
                                    <option value="popular">Most Popular</option>
                                    <option value="rating">Top Rated</option>
                                    <option value="alphabetical">A–Z</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Category chips + Pricing chips */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                            {/* Category chips */}
                            {categories.length > 0 && (
                                <div className="flex-1 min-w-0">
                                    <div
                                        ref={scrollContainerRef}
                                        className="flex overflow-x-auto gap-2 pb-1 scrollbar-none"
                                    >
                                        <button
                                            onClick={() => setSelectedCategory('all')}
                                            className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                                                selectedCategory === 'all'
                                                    ? 'bg-foreground text-background shadow-sm'
                                                    : 'bg-muted text-muted-foreground border border-border hover:border-foreground/20'
                                            }`}
                                        >
                                            All Tools
                                        </button>
                                        {topCategories.map((cat) => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setSelectedCategory(cat.slug)}
                                                className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                                                    selectedCategory === cat.slug
                                                        ? 'bg-foreground text-background shadow-sm'
                                                        : 'bg-muted text-muted-foreground border border-border hover:border-foreground/20'
                                                }`}
                                            >
                                                {cat.name}
                                                <span className={`text-[10px] font-semibold ${
                                                    selectedCategory === cat.slug
                                                        ? 'text-background/60'
                                                        : 'text-muted-foreground/50'
                                                }`}>
                                                    {cat.toolCount}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pricing pills */}
                            <div className="flex flex-wrap gap-1.5">
                                {['all', 'free', 'freemium', 'paid', 'enterprise'].map((price) => (
                                    <button
                                        key={price}
                                        onClick={() => setSelectedPricing(price)}
                                        className={`px-3 py-1.5 text-xs font-medium capitalize rounded-full transition-all duration-200 ${
                                            selectedPricing === price
                                                ? 'bg-foreground text-background shadow-sm'
                                                : 'bg-muted text-muted-foreground border border-border hover:border-foreground/20'
                                        }`}
                                    >
                                        {price}
                                    </button>
                                ))}
                            </div>

                            {/* Clear */}
                            {hasActiveFilters && (
                                <button
                                    onClick={clearAllFilters}
                                    className="px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CATEGORY VIEW LAYOUT */}
            {isCategoryPage && (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Mobile Filters Trigger */}
                    <div className="lg:hidden flex items-center justify-between mb-4">
                        <button
                            onClick={() => setIsMobileFiltersOpen(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm font-medium"
                        >
                            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                            Filters {(selectedPricingList.length + selectedFeatures.length) > 0 && `(${selectedPricingList.length + selectedFeatures.length})`}
                        </button>
                        <div className="flex items-center gap-2">
                            <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                            <label htmlFor={mobileSortId} className="sr-only">Sort tools</label>
                            <select
                                id={mobileSortId}
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="text-sm bg-transparent border-none focus:ring-0 cursor-pointer font-medium text-foreground"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="rating">Top Rated</option>
                                <option value="alphabetical">Alphabetical</option>
                            </select>
                        </div>
                    </div>

                    {/* Left Sidebar Filters on Desktop */}
                    <aside className="w-full lg:w-64 flex-shrink-0 hidden lg:block">
                        <div className="sticky top-24 bg-card/85 backdrop-blur-xl border border-border rounded-2xl p-5 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-serif text-lg flex items-center gap-2 font-bold">
                                    <Filter className="w-4 h-4 text-muted-foreground" /> Filters
                                </h3>
                                {hasActiveFilters && (
                                    <button onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-foreground font-bold">
                                        Clear All
                                    </button>
                                )}
                            </div>

                            {allPricingTypes.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Pricing Type</h4>
                                    <div className="space-y-3">
                                        {allPricingTypes.map((pricing) => {
                                            const isChecked = selectedPricingList.includes(pricing.toLowerCase());
                                            return (
                                                <label key={pricing} className="flex items-center gap-3 cursor-pointer group select-none">
                                                    <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => togglePricingCheckbox(pricing.toLowerCase())} />
                                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isChecked ? 'bg-foreground border-foreground' : 'border-border group-hover:border-foreground/40'}`}>
                                                        {isChecked && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-muted-foreground capitalize group-hover:text-foreground transition-colors">{pricing.replace('-', ' ')}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {allPricingTypes.length > 0 && allFeatures.length > 0 && (
                                <div className="h-px bg-border my-6" />
                            )}

                            {allFeatures.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Key Features</h4>
                                    <div className="space-y-3">
                                        {allFeatures.map((feature) => {
                                            const isChecked = selectedFeatures.includes(feature);
                                            return (
                                                <label key={feature} className="flex items-center gap-3 cursor-pointer group select-none">
                                                    <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggleFeatureCheckbox(feature)} />
                                                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isChecked ? 'bg-foreground border-foreground' : 'border-border group-hover:border-foreground/40'}`}>
                                                        {isChecked && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                                                    </div>
                                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1">{feature}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Mobile Filters Drawer */}
                    {isMobileFiltersOpen && (
                            <>
                                <div
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 lg:hidden"
                                />
                                <div
                                    className="fixed inset-y-0 left-0 w-80 max-w-full bg-card p-6 shadow-2xl z-50 lg:hidden flex flex-col"
                                >
                                    <div className="flex items-center justify-between pb-4 border-b border-border">
                                        <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                                            <Filter className="w-5 h-5" /> Filter Tools
                                        </h3>
                                        <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1.5 hover:bg-muted rounded-lg">
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto py-6 space-y-8">
                                        {allPricingTypes.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Pricing Type</h4>
                                                <div className="space-y-4">
                                                    {allPricingTypes.map((pricing) => {
                                                        const isChecked = selectedPricingList.includes(pricing.toLowerCase());
                                                        return (
                                                            <label key={pricing} className="flex items-center gap-3 cursor-pointer select-none">
                                                                <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => togglePricingCheckbox(pricing.toLowerCase())} />
                                                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isChecked ? 'bg-foreground border-foreground' : 'border-border'}`}>
                                                                    {isChecked && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                                                                </div>
                                                                <span className="text-sm font-medium text-muted-foreground capitalize">{pricing.replace('-', ' ')}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {allFeatures.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Key Features</h4>
                                                <div className="space-y-4">
                                                    {allFeatures.map((feature) => {
                                                        const isChecked = selectedFeatures.includes(feature);
                                                        return (
                                                            <label key={feature} className="flex items-center gap-3 cursor-pointer select-none">
                                                                <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggleFeatureCheckbox(feature)} />
                                                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isChecked ? 'bg-foreground border-foreground' : 'border-border'}`}>
                                                                    {isChecked && <Check className="w-3.5 h-3.5 text-background stroke-[3px]" />}
                                                                </div>
                                                                <span className="text-sm font-medium text-muted-foreground">{feature}</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-border flex gap-3">
                                        <button onClick={clearAllFilters} className="flex-1 py-3 text-sm font-bold text-center border border-border rounded-xl hover:bg-muted">
                                            Reset
                                        </button>
                                        <button onClick={() => setIsMobileFiltersOpen(false)} className="flex-1 py-3 text-sm font-bold text-center bg-foreground text-background rounded-xl">
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="hidden lg:flex justify-between items-center mb-6 px-1">
                            <p className="text-sm text-muted-foreground">
                                Showing <strong className="text-foreground">{sortedTools.length}</strong> verified tools
                            </p>
                            <div className="flex items-center gap-3">
                                <label htmlFor={desktopSortId} className="text-sm text-muted-foreground">Sort by:</label>
                                <div className="relative">
                                    <select
                                        id={desktopSortId}
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                                        className="appearance-none bg-card border border-border rounded-xl py-2 pl-4 pr-10 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 cursor-pointer transition-all"
                                    >
                                        <option value="popular">Most Popular</option>
                                        <option value="rating">Top Rated</option>
                                        <option value="alphabetical">Alphabetical</option>
                                    </select>
                                    <ArrowDownUp className="w-4 h-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {sortedTools.length > 0 ? (
                            <>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {visibleTools.map((tool) => (
                                    <div key={tool.id}>
                                        <ToolCard
                                            tool={tool}
                                            saved={savedToolIds.has(tool.id)}
                                            savedStateLoading={savedStateLoading}
                                            onSavedChange={handleSavedChange}
                                            isAuthenticated={sessionStatus === 'authenticated'}
                                            authLoading={sessionStatus === 'loading'}
                                            onLogin={handleLogin}
                                        />
                                    </div>
                                ))}
                            </div>
                            {visibleTools.length < sortedTools.length && (
                                <div className="mt-8 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setVisibleCount((count) => count + VISIBLE_TOOLS_INCREMENT)}
                                        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                                    >
                                        Load more tools
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                            </>
                        ) : (
                            <div className="text-center py-24 bg-muted border border-border rounded-2xl">
                                <SlidersHorizontal className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                <h3 className="text-xl font-serif font-bold mb-2">No tools match your criteria</h3>
                                <p className="text-muted-foreground mb-6 text-sm max-w-xs mx-auto">
                                    Try adjusting your selected pricing models or feature checkmarks to widen your results.
                                </p>
                                <button onClick={clearAllFilters} className="px-6 py-2.5 bg-foreground text-background font-bold uppercase tracking-wider text-xs rounded-xl hover:opacity-90 transition-opacity">
                                    Clear Filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* GRID VIEW (Directory View) */}
            {!isCategoryPage && (
                <div>
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h2 className="text-xl font-serif font-bold text-foreground">
                            {selectedCategory === 'all'
                                ? 'Explore Premium AI Tools'
                                : `${categories.find((c) => c.slug === selectedCategory)?.name || 'Filtered'} Tools`}
                        </h2>
                        <div className="text-sm text-muted-foreground font-bold bg-muted border border-border px-3 py-1 rounded-full">
                            {sortedTools.length} result{sortedTools.length !== 1 ? 's' : ''}
                        </div>
                    </div>

                    {sortedTools.length > 0 ? (
                        <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {visibleTools.map((tool, i) => (
                                <div key={tool.id}>
                                    <ToolCard
                                        tool={tool}
                                        priority={i < 8}
                                        saved={savedToolIds.has(tool.id)}
                                        savedStateLoading={savedStateLoading}
                                        onSavedChange={handleSavedChange}
                                        isAuthenticated={sessionStatus === 'authenticated'}
                                        authLoading={sessionStatus === 'loading'}
                                        onLogin={handleLogin}
                                    />
                                </div>
                            ))}
                        </div>
                        {visibleTools.length < sortedTools.length && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    type="button"
                                    onClick={() => setVisibleCount((count) => count + VISIBLE_TOOLS_INCREMENT)}
                                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                                >
                                    Load more tools
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        </>
                    ) : (
                        <div className="text-center py-24 bg-muted border border-border rounded-2xl">
                            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-serif font-bold mb-2">No tools match your criteria</h3>
                            <p className="text-muted-foreground mb-6 text-sm max-w-xs mx-auto">
                                We couldn&apos;t find any AI tools matching your exact filter setup. Try broadening your keywords.
                            </p>
                            <button onClick={clearAllFilters} className="px-6 py-2.5 bg-foreground text-background font-bold uppercase tracking-wider text-xs rounded-xl hover:opacity-90 transition-opacity">
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
