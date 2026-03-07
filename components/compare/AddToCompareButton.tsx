'use client';

import { useCompare, CompareTool } from './CompareContext';
import { Scale } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function AddToCompareButton({ tool, className = '' }: { tool: CompareTool; className?: string }) {
    const { addTool, removeTool, isToolSelected } = useCompare();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className={`flex items-center justify-center p-2 rounded-full border border-gray-200 text-transparent bg-white pointer-events-none ${className}`}>
                <Scale className="w-4 h-4 opacity-50" />
            </button>
        );
    }

    const isSelected = isToolSelected(tool.id);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isSelected) {
            removeTool(tool.id);
        } else {
            addTool(tool);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ${isSelected
                    ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white border border-gray-200 text-gray-400 hover:border-blue-600 hover:text-blue-600'
                } ${className}`}
            aria-label={isSelected ? "Remove from Compare" : "Add to Compare"}
            title={isSelected ? "Remove from Compare" : "Add to Compare"}
        >
            <Scale className={`w-4 h-4 transition-all duration-300 ${isSelected ? 'fill-white opacity-100' : 'opacity-80'}`} />
        </button>
    );
}
