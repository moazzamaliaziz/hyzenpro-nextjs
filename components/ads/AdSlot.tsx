'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type SlotFormat = 'auto' | 'rectangle' | 'horizontal' | 'vertical';

type PublicAdSlot = {
    id: string;
    label: string;
    description: string;
    area: string;
    placementHint: string;
    format: SlotFormat;
    enabled: boolean;
    network: 'adsense' | 'affiliate' | 'custom';
    code: string;
    notes: string;
    updatedAt: string | null;
};

interface AdSlotProps {
    slot: string;
    format?: SlotFormat;
    className?: string;
    priority?: boolean;
}

const SLOT_HEIGHTS: Record<SlotFormat, string> = {
    auto: 'min-h-[90px]',
    horizontal: 'min-h-[90px]',
    rectangle: 'min-h-[250px]',
    vertical: 'min-h-[280px]',
};

function executeAdCode(target: HTMLDivElement, code: string) {
    target.innerHTML = '';

    const fragment = document.createRange().createContextualFragment(code);
    const scripts = Array.from(fragment.querySelectorAll('script'));

    for (const originalScript of scripts) {
        const recreatedScript = document.createElement('script');

        for (const attr of Array.from(originalScript.attributes)) {
            recreatedScript.setAttribute(attr.name, attr.value);
        }

        if (originalScript.src) {
            const existing = document.querySelector<HTMLScriptElement>(`script[src="${originalScript.src}"]`);
            if (existing) {
                originalScript.remove();
                continue;
            }
        }

        recreatedScript.textContent = originalScript.textContent;
        originalScript.replaceWith(recreatedScript);
    }

    target.appendChild(fragment);
}

export default function AdSlot({
    slot,
    format = 'auto',
    className = '',
    priority = false,
}: AdSlotProps) {
    const viewRef = useRef<HTMLDivElement | null>(null);
    const hostRef = useRef<HTMLDivElement | null>(null);
    const [slotConfig, setSlotConfig] = useState<PublicAdSlot | null>(null);
    const [hasLoaded, setHasLoaded] = useState(priority);
    const [isVisible, setIsVisible] = useState(priority);

    useEffect(() => {
        if (priority || !viewRef.current) {
            setIsVisible(true);
            setHasLoaded(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (entry?.isIntersecting) {
                    setIsVisible(true);
                    setHasLoaded(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '240px 0px',
            }
        );

        observer.observe(viewRef.current);
        return () => observer.disconnect();
    }, [priority]);

    useEffect(() => {
        if (!hasLoaded) {
            return;
        }

        let cancelled = false;

        async function fetchSlot() {
            const response = await fetch(`/api/ads?slot=${encodeURIComponent(slot)}`);
            const data = await response.json();

            if (!cancelled) {
                setSlotConfig(data.slot || null);
            }
        }

        void fetchSlot();

        return () => {
            cancelled = true;
        };
    }, [hasLoaded, slot]);

    useEffect(() => {
        const host = hostRef.current;
        if (!host) {
            return;
        }

        host.innerHTML = '';

        if (!slotConfig?.enabled || !slotConfig.code) {
            return;
        }

        executeAdCode(host, slotConfig.code);
        window.dispatchEvent(new CustomEvent('hyzenpro-monetize-active', { detail: { slot: slotConfig.id } }));
    }, [slotConfig]);

    const slotFormat = useMemo(() => slotConfig?.format || format, [slotConfig?.format, format]);

    if (!isVisible && !priority) {
        return <div ref={viewRef} className={`${SLOT_HEIGHTS[slotFormat]} ${className}`} aria-hidden="true" />;
    }

    if (!slotConfig?.enabled || !slotConfig.code) {
        return null;
    }

    return (
        <div
            ref={viewRef}
            className={`rounded-2xl border border-gray-200 bg-gray-50 ${SLOT_HEIGHTS[slotFormat]} overflow-hidden ${className}`}
            data-monetize-slot={slotConfig.id}
            data-monetize-network={slotConfig.network}
        >
            <div
                ref={hostRef}
                className="relative w-full h-full px-2 py-2"
                data-slot-shell={slotConfig.id}
                aria-label={`${slotConfig.label} placement`}
            />
        </div>
    );
}
