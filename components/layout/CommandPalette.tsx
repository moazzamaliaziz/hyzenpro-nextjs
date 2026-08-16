'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, X, ArrowRight, Box, FileText, Loader2, Zap } from 'lucide-react';
import Link from 'next/link';

interface SearchResult {
    tools: { id: string; name: string; slug: string; primaryCategory: string | null }[];
    posts: { id: string; title: string; slug: string }[];
}

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResult>({ tools: [], posts: [] });
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Toggle logic for Cmd+K / Ctrl+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Auto-focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setQuery('');
            setResults({ tools: [], posts: [] });
        }
    }, [isOpen]);

    // Debounced search fetch
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults({ tools: [], posts: [] });
            return;
        }

        const timer = setTimeout(async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/search-cmd?q=${encodeURIComponent(query)}`);
                const data = await res.json();
                setResults(data);
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:border-gray-300 transition-colors group cursor-text"
            >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                <span className="w-40 text-left">Search the registry...</span>
                <div className="flex items-center gap-1 ml-4">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-500 font-semibold uppercase">⌘</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-500 font-semibold uppercase">K</kbd>
                </div>
            </button>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-white/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-2xl bg-white rounded-2xl shadow-[0_20px_40px_-5px_rgba(0,0,0,0.2)] border border-gray-200 overflow-hidden flex flex-col animate-slide-up"
                style={{ maxHeight: '70vh' }}
            >
                {/* Search Header */}
                <div className="flex items-center px-4 py-4 border-b border-gray-100 bg-gray-50">
                    <Search className="w-5 h-5 text-gray-400 mr-3 hidden sm:block" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for AI models, tools, categories..."
                        className="flex-1 bg-transparent border-none outline-none text-black text-lg placeholder:text-gray-400"
                    />
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin ml-3" />
                    ) : (
                        <div className="flex gap-1.5 ml-3 hidden sm:flex">
                            <kbd className="px-2 py-1 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-400 font-semibold shadow-sm">ESC</kbd>
                        </div>
                    )}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1 sm:hidden ml-2 rounded-md hover:bg-gray-200 text-gray-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto p-2 bg-white hidden-scrollbar">
                    {query.length < 2 && (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            <Command className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                            Type at least 2 characters to search the global registry.
                        </div>
                    )}

                    {query.length >= 2 && results.tools.length === 0 && results.posts.length === 0 && !isLoading && (
                        <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No results found for "{query}". Try a different term like "video" or "GPT".
                        </div>
                    )}

                    {results.tools.length > 0 && (
                        <div className="mb-4">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                AI Tools & Models
                            </div>
                            <div className="space-y-1 mt-1">
                                {results.tools.map(tool => (
                                    <Link
                                        key={tool.id}
                                        href={`/ai-tools-directory/${tool.primaryCategory || 'general'}/${tool.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200">
                                                <Box className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-black group-hover:text-black">{tool.name}</div>
                                                <div className="text-xs text-gray-400 capitalize">{tool.primaryCategory?.replace(/-/g, ' ')}</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {results.posts.length > 0 && (
                        <div>
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-widest border-t border-gray-100 mt-2 pt-4">
                                Research & Articles
                            </div>
                            <div className="space-y-1 mt-1">
                                {results.posts.map(post => (
                                    <Link
                                        key={post.id}
                                        href={`/blog/${post.slug}`}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-gray-100"
                                    >
                                        <div className="flex items-center gap-3 truncate">
                                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                            </div>
                                            <div className="text-sm font-medium text-black truncate">{post.title}</div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-black transition-colors shrink-0 ml-2" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Links Suggestions (only shown when empty) */}
                    {query.length === 0 && (
                        <div className="mt-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
                                Quick Navigation
                            </div>
                            <div className="space-y-1 mt-1">
                                <Link onClick={() => setIsOpen(false)} href="/ai-tools-directory" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group border border-transparent hover:border-gray-100 text-sm font-medium text-black">
                                    <Box className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                                    Explore Top Tools
                                </Link>
                                <Link onClick={() => setIsOpen(false)} href="/compare/tools/" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group border border-transparent hover:border-gray-100 text-sm font-medium text-black">
                                    <Zap className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors" />
                                    Compare AI Models
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Banner */}
                <div className="bg-gray-50 border-t border-gray-100 px-4 py-3 text-xs text-gray-500 font-medium flex justify-between items-center hidden sm:flex">
                    <div className="flex items-center gap-2">
                        <span>Navigate with</span>
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-500 font-semibold shadow-sm">↑</kbd>
                        <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] font-mono text-gray-500 font-semibold shadow-sm">↓</kbd>
                    </div>
                    <div>HyzenPro Directory 2.0</div>
                </div>
            </div>
        </div>
    );
}
