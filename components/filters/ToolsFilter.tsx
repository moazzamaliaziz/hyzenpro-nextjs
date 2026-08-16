'use client';

import { useId, useState } from 'react';

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    icon?: string;
}

interface ToolsFilterProps {
    categories: Category[];
    onFilterChange: (filters: FilterState) => void;
    totalTools: number;
}

export interface FilterState {
    category: string;
    pricing: string;
    sortBy: string;
    searchQuery: string;
}

const PRICING_OPTIONS = [
    { value: '', label: 'All Pricing' },
    { value: 'Free', label: 'Free' },
    { value: 'Freemium', label: 'Freemium' },
    { value: 'Paid', label: 'Paid' },
];

const SORT_OPTIONS = [
    { value: 'rating', label: 'Top Rated' },
    { value: 'name', label: 'A-Z' },
    { value: 'newest', label: 'Newest' },
];

export default function ToolsFilter({ categories, onFilterChange, totalTools }: ToolsFilterProps) {
    const searchId = useId();
    const categoryId = useId();
    const pricingId = useId();
    const sortId = useId();
    const [filters, setFilters] = useState<FilterState>({
        category: '',
        pricing: '',
        sortBy: 'rating',
        searchQuery: '',
    });

    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const defaultFilters: FilterState = {
            category: '',
            pricing: '',
            sortBy: 'rating',
            searchQuery: '',
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const hasActiveFilters = filters.category || filters.pricing || filters.searchQuery;

    return (
        <div className="tools-filter">
            {/* Search Bar */}
            <div className="tools-filter-search">
                <div className="relative">
                    <label htmlFor={searchId} className="sr-only">
                        Search AI tools
                    </label>
                    <input
                        id={searchId}
                        type="text"
                        placeholder="Search AI tools..."
                        value={filters.searchQuery}
                        onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                        className="tools-filter-input"
                    />
                    <svg
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
            </div>

            {/* Filter Row */}
            <div className="tools-filter-row">
                {/* Category Filter */}
                <div className="tools-filter-group">
                    <label htmlFor={categoryId} className="tools-filter-label">Category</label>
                    <select
                        id={categoryId}
                        value={filters.category}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="tools-filter-select"
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.slug}>
                                {cat.icon} {cat.name} ({cat.count})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Pricing Filter */}
                <div className="tools-filter-group">
                    <label htmlFor={pricingId} className="tools-filter-label">Pricing</label>
                    <select
                        id={pricingId}
                        value={filters.pricing}
                        onChange={(e) => handleFilterChange('pricing', e.target.value)}
                        className="tools-filter-select"
                    >
                        {PRICING_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div className="tools-filter-group">
                    <label htmlFor={sortId} className="tools-filter-label">Sort By</label>
                    <select
                        id={sortId}
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="tools-filter-select"
                    >
                        {SORT_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button onClick={clearFilters} className="tools-filter-clear">
                        Clear Filters
                    </button>
                )}
            </div>

            {/* Results Count */}
            <div className="tools-filter-results">
                <span className="text-gray-600">
                    Showing <strong className="text-black">{totalTools}</strong> AI tools
                </span>
            </div>
        </div>
    );
}
