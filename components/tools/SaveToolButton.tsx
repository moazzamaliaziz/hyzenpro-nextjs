'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { buildAdminLoginUrl } from '@/lib/admin';

export default function SaveToolButton({
    toolId,
    className = '',
    showLabel = false,
    savedLabel = 'Saved to My Stack',
    unsavedLabel = 'Add to My Stack',
    initialSaved = false,
    skipInitialFetch = false,
    externalLoading = false,
    onSavedChange,
}: {
    toolId: string;
    className?: string;
    showLabel?: boolean;
    savedLabel?: string;
    unsavedLabel?: string;
    initialSaved?: boolean;
    skipInitialFetch?: boolean;
    externalLoading?: boolean;
    onSavedChange?: (toolId: string, saved: boolean) => void;
}) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [loading, setLoading] = useState(!skipInitialFetch);

    useEffect(() => {
        if (skipInitialFetch) {
            setIsSaved(initialSaved);
            setLoading(false);
            return;
        }

        if (!session) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        const checkSavedStatus = async () => {
            try {
                const res = await fetch(`/api/user/saved-tools?toolId=${encodeURIComponent(toolId)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) setIsSaved(data.saved);
                }
            } catch (err) {
                console.error('Failed to check saved status', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkSavedStatus();
        return () => { isMounted = false; };
    }, [session, toolId, skipInitialFetch, initialSaved]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push(buildAdminLoginUrl(window.location.href));
            return;
        }

        const originalState = isSaved;
        const nextState = !isSaved;
        setIsSaved(nextState);
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

            const res = await fetch(url, options);
            if (!res.ok) {
                throw new Error('Failed to toggle save state');
            }
        } catch (error) {
            console.error(error);
            setIsSaved(originalState);
            onSavedChange?.(toolId, originalState);
        } finally {
            setLoading(false);
        }
    };

    const isBusy = (loading || externalLoading) && !!session;

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
