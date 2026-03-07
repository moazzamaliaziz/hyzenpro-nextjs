'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SaveToolButton({ toolId, className = '' }: { toolId: string; className?: string }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isSaved, setIsSaved] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session) {
            setLoading(false);
            return;
        }

        let isMounted = true;
        const checkSavedStatus = async () => {
            try {
                const res = await fetch(`/api/user/saved-tools?toolId=${toolId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) setIsSaved(data.saved);
                }
            } catch (err) {
                console.error("Failed to check saved status", err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        checkSavedStatus();
        return () => { isMounted = false; };
    }, [session, toolId]);

    const handleToggleSave = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            // Redirect to login if user tries to save without being authenticated
            router.push('/admin/login?callbackUrl=' + encodeURIComponent(window.location.href));
            return;
        }

        const originalState = isSaved;
        setIsSaved(!isSaved); // Optimistic UI update
        setLoading(true);

        try {
            const method = originalState ? 'DELETE' : 'POST';
            const url = originalState
                ? `/api/user/saved-tools?toolId=${toolId}`
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
            setIsSaved(originalState); // Revert optimistic update on error
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggleSave}
            disabled={loading && !!session}
            className={`flex items-center justify-center p-2 rounded-full transition-all duration-300 ${isSaved
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-white border border-gray-200 text-gray-400 hover:border-black hover:text-black'
                } ${className}`}
            aria-label={isSaved ? "Remove from Tech Stack" : "Save to Tech Stack"}
            title={isSaved ? "Remove from Tech Stack" : "Save to Tech Stack"}
        >
            <Bookmark
                className={`w-4 h-4 transition-all duration-300 ${isSaved ? 'fill-white' : 'fill-transparent'
                    } ${loading && session ? 'opacity-50' : 'opacity-100'}`}
            />
        </button>
    );
}
