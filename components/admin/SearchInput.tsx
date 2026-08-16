'use client';

import { Search } from 'lucide-react';
import { useAdminSearch } from '@/hooks/useSearch';

export function SearchInput({ placeholder = 'Search…' }: { placeholder?: string }) {
    const { inputValue, setInputValue } = useAdminSearch();

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition"
            />
        </div>
    );
}
