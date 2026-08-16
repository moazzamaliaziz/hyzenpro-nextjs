'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronRight, Command } from 'lucide-react';
import Link from 'next/link';

interface CommandItem {
    label: string;
    description?: string;
    href?: string;
    action?: () => void;
    shortcut?: string;
    category?: string;
}

interface CommandPaletteProps {
    items: CommandItem[];
    trigger?: 'cmd+k' | 'cmd+shift+k';
    placeholder?: string;
}

export function CommandPalette({ items, trigger = 'cmd+k', placeholder = 'Search commands...' }: CommandPaletteProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const filteredItems = items
        .filter((item) =>
            item.label.toLowerCase().includes(query.toLowerCase()) ||
            item.description?.toLowerCase().includes(query.toLowerCase()) ||
            item.shortcut?.toLowerCase().includes(query.toLowerCase())
        )
        .map((item, index) => ({ ...item, originalIndex: index }));

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const modifier = isMac ? e.metaKey : e.ctrlKey;

            if (modifier && e.key.toLowerCase() === (trigger === 'cmd+shift+k' ? 'k' : 'k') && e.shiftKey === (trigger === 'cmd+shift+k')) {
                e.preventDefault();
                setIsOpen(true);
                setQuery('');
                setSelectedIndex(0);
            }

            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [trigger]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 0);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) => Math.min(prev + 1, filteredItems.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) => Math.max(prev - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                const selected = filteredItems[selectedIndex];
                if (selected) {
                    if (selected.href) {
                        window.location.href = selected.href;
                    } else if (selected.action) {
                        selected.action();
                    }
                    setIsOpen(false);
                    setQuery('');
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setQuery('');
                break;
        }
    };

    const handleItemClick = (item: CommandItem & { originalIndex: number }) => {
        if (item.href) {
            window.location.href = item.href;
        } else if (item.action) {
            item.action();
        }
        setIsOpen(false);
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/30" onClick={() => setIsOpen(false)}>
            <div
                className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-4 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={placeholder}
                            className="w-full pl-10 pr-10 py-3 text-base bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            autoFocus
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded">
                            {trigger === 'cmd+shift+k' ? '⇧⌘K' : '⌘K'}
                        </kbd>
                    </div>
                </div>

                <ul
                    ref={listRef}
                    className="max-h-96 overflow-y-auto"
                    role="listbox"
                    aria-label="Commands"
                >
                    {filteredItems.length === 0 ? (
                        <li className="px-4 py-8 text-center text-gray-500">
                            No commands found
                        </li>
                    ) : (
                        filteredItems.map((item, index) => (
                            <li
                                key={item.originalIndex}
                                className={`px-4 py-3 cursor-pointer transition-colors flex items-center gap-3 ${
                                    index === selectedIndex
                                        ? 'bg-indigo-50 text-indigo-900'
                                        : 'hover:bg-gray-50 text-gray-900'
                                }`}
                                onClick={() => handleItemClick(item)}
                                onMouseEnter={() => setSelectedIndex(index)}
                                role="option"
                                aria-selected={index === selectedIndex}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{item.label}</p>
                                    {item.description && (
                                        <p className="text-sm opacity-70 truncate">{item.description}</p>
                                    )}
                                </div>
                                {item.shortcut && (
                                    <kbd className="px-2 py-0.5 text-xs text-gray-400 bg-gray-100 rounded">
                                        {item.shortcut}
                                    </kbd>
                                )}
                                {item.href && <ChevronRight className="w-4 h-4 text-gray-400" />}
                            </li>
                        ))
                    )}
                </ul>

                <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-2">
                    <Command className="w-3 h-3" />
                    <span>{trigger === 'cmd+shift+k' ? '⇧⌘K' : '⌘K'} to open</span>
                </div>
            </div>
        </div>
    );
}