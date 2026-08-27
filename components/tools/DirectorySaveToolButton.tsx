'use client';

import { useState } from 'react';
import { Bookmark } from 'lucide-react';

interface DirectorySaveToolButtonProps {
    toolId: string;
    className?: string;
    showLabel?: boolean;
    savedLabel?: string;
    unsavedLabel?: string;
    initialSaved?: boolean;
    externalLoading?: boolean;
    isAuthenticated: boolean;
    authLoading: boolean;
    onLogin: () => void;
    onSavedChange?: (toolId: string, saved: boolean) => void;
}

export default function DirectorySaveToolButton({
    toolId,
    className = '',
    showLabel = false,
    savedLabel = 'Saved to My Stack',
    unsavedLabel = 'Add to My Stack',
    initialSaved = false,
    externalLoading = false,
    isAuthenticated,
    authLoading,
    onLogin,
    onSavedChange,
}: DirectorySaveToolButtonProps) {
    const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(false);
    const isSaved = savedOverride ?? initialSaved;

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isAuthenticated) {
            onLogin();
            return;
        }

        const originalState = isSaved;
        const nextState = !isSaved;
        setSavedOverride(nextState);
        onSavedChange?.(toolId, nextState);
        setLoading(true);

        try {
            const method = originalState ? 'DELETE' : 'POST';
            const url = originalState
                ? `/api/user/saved-tools?toolId=${encodeURIComponent(toolId)}`
                : '/api/user/saved-tools';

            const options: RequestInit = { method };
            if (!originalState) {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify({ toolId });
            }

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Failed to toggle save state');
            }
        } catch (error) {
            console.error(error);
            setSavedOverride(originalState);
            onSavedChange?.(toolId, originalState);
        } finally {
            setLoading(false);
        }
    };

    const isBusy = authLoading || ((loading || externalLoading) && isAuthenticated);

    return (
        <button
            onClick={handleToggleSave}
            disabled={isBusy}
            className={`${showLabel ? 'h-11 rounded-md px-4 gap-2 text-sm font-semibold' : 'p-2 rounded-full'} flex items-center justify-center transition-colors duration-300 ${isSaved
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-white border border-gray-200 text-gray-400 hover:border-black hover:text-black'
                } ${className}`}
            aria-label={isSaved ? 'Remove from Tech Stack' : 'Save to Tech Stack'}
            title={isSaved ? 'Remove from Tech Stack' : 'Save to Tech Stack'}
        >
            <Bookmark
                className={`w-4 h-4 transition-[fill,opacity] duration-300 ${isSaved ? 'fill-white' : 'fill-transparent'
                    } ${isBusy ? 'opacity-50' : 'opacity-100'}`}
            />
            {showLabel ? <span>{isSaved ? savedLabel : unsavedLabel}</span> : null}
        </button>
    );
}
