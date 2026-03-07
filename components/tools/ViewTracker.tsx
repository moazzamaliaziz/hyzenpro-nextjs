'use client';

import { useEffect, useRef } from 'react';

export default function ViewTracker({ toolId }: { toolId: string }) {
    const tracked = useRef(false);

    useEffect(() => {
        if (tracked.current || !toolId) return;
        tracked.current = true;

        // Fire-and-forget — don't block UI rendering
        fetch(`/api/tools/${toolId}/track`, { method: 'POST' }).catch(() => {
            // Silently fail — tracking is non-critical
        });
    }, [toolId]);

    return null; // Invisible component
}
