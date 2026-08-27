'use client';

import { useState } from 'react';
import { getToolInitials } from '@/lib/tool-page';
import { cn } from '@/lib/utils';
import { HermesAgent, OpenClaw } from '@lobehub/icons';
import { toSecureExternalUrl } from '@/lib/secure-external-url';

interface ToolLogoProps {
    logo?: string | null;
    name: string;
    width?: number;
    height?: number;
    className?: string;
    /** Additional classes for the image element */
    imgClassName?: string;
    /** Additional classes for the container */
    containerClassName?: string;
    /** Container size preset */
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    /** Priority loading for above-fold images */
    priority?: boolean;
    /** Override initials fallback (defaults to getToolInitials(name)) */
    initials?: string;
}

const SIZE_MAP = {
    xs: { container: 'h-8 w-8', fontSize: 'text-xs', iconSize: 20 },
    sm: { container: 'h-10 w-10', fontSize: 'text-sm', iconSize: 24 },
    md: { container: 'h-12 w-12', fontSize: 'text-base', iconSize: 32 },
    lg: { container: 'h-16 w-16', fontSize: 'text-lg', iconSize: 48 },
    xl: { container: 'h-24 w-24', fontSize: 'text-2xl', iconSize: 64 },
} as const;

export default function ToolLogo({
    logo,
    name,
    width,
    height,
    className,
    imgClassName,
    containerClassName,
    size = 'md',
    priority = false,
    initials,
}: ToolLogoProps) {
    const [hasError, setHasError] = useState(false);

    const handleError = () => setHasError(true);
    const secureLogo = toSecureExternalUrl(logo);
    const { container, fontSize, iconSize } = SIZE_MAP[size];

    // LobeHub icons
    if (secureLogo && secureLogo.startsWith('lobehub:')) {
        const iconName = secureLogo.substring(8);
        return (
            <div
                className={cn('flex items-center justify-center overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white', container, containerClassName)}
                aria-label={`${name} logo`}
            >
                {iconName === 'HermesAgent' && <HermesAgent size={iconSize} />}
                {iconName === 'OpenClaw' && <OpenClaw.Color size={iconSize} />}
            </div>
        );
    }

    // Broken or missing logo → initials fallback
    if (!secureLogo || hasError) {
        return (
            <div
                className={cn('flex items-center justify-center rounded-[8px] border border-[#E5E7EB] bg-white font-semibold text-[#0F0F0F]', container, fontSize, containerClassName)}
                aria-label={`${name} initials`}
            >
                {initials || getToolInitials(name)}
            </div>
        );
    }

    // Valid logo URL → render image
    const w = width || iconSize;
    const h = height || iconSize;

    return (
        <div
            className={cn('overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-white', container, containerClassName)}
        >
            <img
                src={secureLogo}
                alt={`${name} logo`}
                width={w}
                height={h}
                className={cn('h-full w-full object-contain', imgClassName)}
                loading={priority ? 'eager' : 'lazy'}
                onError={handleError}
            />
        </div>
    );
}

/**
 * Renders a small inline logo with initials fallback, for compact contexts like compare drawer items.
 */
export function ToolLogoInline({
    logo,
    name,
    className,
}: {
    logo?: string | null;
    name: string;
    className?: string;
}) {
    const [hasError, setHasError] = useState(false);
    const secureLogo = toSecureExternalUrl(logo);

    if (secureLogo && secureLogo.startsWith('lobehub:')) {
        const iconName = secureLogo.substring(8);
        return (
            <div className={cn('flex items-center justify-center w-full h-full p-0.5 bg-white rounded-full overflow-hidden', className)}>
                {iconName === 'HermesAgent' && <HermesAgent size={20} />}
                {iconName === 'OpenClaw' && <OpenClaw.Color size={20} />}
            </div>
        );
    }

    if (!secureLogo || hasError) {
        return (
            <span className={cn('font-serif text-xl text-foreground/40', className)}>
                {name.charAt(0)}
            </span>
        );
    }

    return (
        <img
            src={secureLogo}
            alt={`${name} logo`}
            className={cn('w-full h-full object-cover rounded-full', className)}
            onError={() => setHasError(true)}
        />
    );
}