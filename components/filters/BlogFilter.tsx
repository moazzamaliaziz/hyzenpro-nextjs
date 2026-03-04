'use client';

import { useState } from 'react';

interface Category {
    name: string;
    slug: string;
    count?: number;
}

interface BlogFilterProps {
    categories: Category[];
    onFilterChange: (filters: BlogFilterState) => void;
    totalPosts: number;
}

export interface BlogFilterState {
    category: string;
    sortBy: string;
    searchQuery: string;
}

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title', label: 'A-Z' },
];

export default function BlogFilter({ categories, onFilterChange, totalPosts }: BlogFilterProps) {
    const [filters, setFilters] = useState<BlogFilterState>({
        category: '',
        sortBy: 'newest',
        searchQuery: '',
    });

    const handleFilterChange = (key: keyof BlogFilterState, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const defaultFilters: BlogFilterState = {
            category: '',
            sortBy: 'newest',
            searchQuery: '',
        };
        setFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const hasActiveFilters = filters.category || filters.searchQuery;

    return (
        <div className="blog-filter">
            {/* Search */}
            <div className="blog-filter-search">
                <input
                    type="text"
                    placeholder="Search articles..."
                    value={filters.searchQuery}
                    onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                    className="blog-filter-input"
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

            {/* Category Pills */}
            <div className="blog-filter-categories">
                <button
                    onClick={() => handleFilterChange('category', '')}
                    className={`blog-filter-pill ${filters.category === '' ? 'active' : ''}`}
                >
                    All Articles
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat.slug}
                        onClick={() => handleFilterChange('category', cat.slug)}
                        className={`blog-filter-pill ${filters.category === cat.slug ? 'active' : ''}`}
                    >
                        {cat.name}
                        {cat.count && <span className="ml-1 opacity-60">({cat.count})</span>}
                    </button>
                ))}
            </div>

            {/* Sort & Results */}
            <div className="blog-filter-row">
                <span className="text-gray-600">
                    Showing <strong className="text-black">{totalPosts}</strong> articles
                </span>
                <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="blog-filter-select"
                >
                    {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
