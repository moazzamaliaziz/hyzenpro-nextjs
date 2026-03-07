'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CompareTool {
    id: string;
    name: string;
    slug: string;
    logo?: string | null;
    category?: string | null;
}

interface CompareContextType {
    selectedTools: CompareTool[];
    addTool: (tool: CompareTool) => void;
    removeTool: (id: string) => void;
    clearTools: () => void;
    isToolSelected: (id: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: React.ReactNode }) {
    const [selectedTools, setSelectedTools] = useState<CompareTool[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    // Hydrate from localStorage on client load
    useEffect(() => {
        setIsMounted(true);
        try {
            const saved = localStorage.getItem('hyzenpro_compare_tools');
            if (saved) {
                setSelectedTools(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to parse compare tools from local storage', e);
        }
    }, []);

    // Sync to localStorage on change
    useEffect(() => {
        if (!isMounted) return;
        localStorage.setItem('hyzenpro_compare_tools', JSON.stringify(selectedTools));
    }, [selectedTools, isMounted]);

    const addTool = (tool: CompareTool) => {
        if (selectedTools.length >= 3) {
            alert('You can only compare up to 3 tools at a time.');
            return;
        }
        if (!selectedTools.find((t) => t.id === tool.id)) {
            setSelectedTools([...selectedTools, tool]);
        }
    };

    const removeTool = (id: string) => {
        setSelectedTools(selectedTools.filter((t) => t.id !== id));
    };

    const clearTools = () => {
        setSelectedTools([]);
    };

    const isToolSelected = (id: string) => {
        return selectedTools.some((t) => t.id === id);
    };

    return (
        <CompareContext.Provider value={{ selectedTools, addTool, removeTool, clearTools, isToolSelected }}>
            {children}
        </CompareContext.Provider>
    );
}

export function useCompare() {
    const context = useContext(CompareContext);
    if (context === undefined) {
        throw new Error('useCompare must be used within a CompareProvider');
    }
    return context;
}
