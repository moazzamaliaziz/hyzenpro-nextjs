'use client';

import { useEffect, useRef } from 'react';

const VIEW_TRACKING_WINDOW_MS = 6 * 60 * 60 * 1000;

export default function ViewTracker({ toolId }: { toolId: string }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current || !toolId) return;
        tracked.current = true;

        const storageKey = `hyzenpro_tool_view_${toolId}`;
        try {
            const lastTrackedAt = Number(window.localStorage.getItem(storageKey) || 0);
            if (Date.now() - lastTrackedAt < VIEW_TRACKING_WINDOW_MS) {
                return;
            }

            window.localStorage.setItem(storageKey, String(Date.now()));
        } catch {
            // Continue without localStorage; view tracking is intentionally non-critical.
        }

        // Fire-and-forget; don't block UI rendering.
        fetch(`/api/tools/${toolId}/track`, { method: 'POST' }).catch(() => {
            // Silently fail; tracking is non-critical.
        });
    }, [toolId]);

    return null;
}
