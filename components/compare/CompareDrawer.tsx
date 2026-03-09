'use client';

import { useCompare } from './CompareContext';
import { X, Scale } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CompareDrawer() {
    const { selectedTools, removeTool, clearTools } = useCompare();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Prevent hydration mismatch
    if (!mounted) return null;
    if (selectedTools.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-6 flex justify-center pointer-events-none animate-slide-up">
            <div className="bg-black text-white p-2.5 pr-4 rounded-full shadow-2xl flex items-center gap-4 border border-gray-800 pointer-events-auto backdrop-blur-xl">

                {/* Tools Selected */}
                <div className="flex items-center pl-2">
                    {selectedTools.map((tool, index) => (
                        <div
                            key={tool.id}
                            className={`relative w-9 h-9 rounded-full border-2 border-black bg-gray-900 flex items-center justify-center text-xs font-bold group ${index > 0 ? '-ml-3' : ''}`}
                            title={tool.name}
                        >
                            {tool.logo ? (
                                <img src={tool.logo} alt={tool.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                                tool.name.charAt(0)
                            )}
                            <button
                                onClick={() => removeTool(tool.id)}
                                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white"
                                aria-label="Remove tool"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {selectedTools.length < 3 && (
                        <div className={`w-9 h-9 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-gray-400 text-xs font-medium ${selectedTools.length > 0 ? '-ml-3' : ''}`}>
                            +
                        </div>
                    )}
                </div>

                <div className="hidden sm:block text-sm font-medium mr-1 tracking-wide">
                    {selectedTools.length} / 3 Selected
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 border-l border-gray-800 pl-4 ml-1">
                    <button
                        onClick={clearTools}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title="Clear all"
                    >
                        <X className="w-4 h-4" />
                    </button>

                    <Link
                        href="/compare"
                        className={`flex items-center gap-1.5 px-4 py-2 bg-black dark:bg-white text-white dark:text-black hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-full transition-all ${selectedTools.length < 2 ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                        <Scale className="w-3 h-3" />
                        Compare
                    </Link>
                </div>

            </div>
        </div>
    );
}
