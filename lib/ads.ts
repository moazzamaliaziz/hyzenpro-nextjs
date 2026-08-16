export const ADS_SECTION_ID = 'ad-management';

export const AD_SLOT_DEFINITIONS = [
    {
        id: 'site-header',
        label: 'Global Header Banner',
        description: 'Renders below the main header across the website.',
        area: 'Header',
        placementHint: 'Good for leaderboard or announcement-style monetization.',
        format: 'horizontal',
    },
    {
        id: 'homepage-top',
        label: 'Homepage Top',
        description: 'Primary monetization block between the hero and top homepage content.',
        area: 'Homepage',
        placementHint: 'Use for premium sponsor banners or responsive AdSense.',
        format: 'horizontal',
    },
    {
        id: 'homepage-bottom',
        label: 'Homepage Bottom',
        description: 'Bottom homepage placement before the final CTA section.',
        area: 'Homepage',
        placementHint: 'Works well for affiliate banners and closing sponsor placements.',
        format: 'horizontal',
    },
    {
        id: 'blog-post-top',
        label: 'Blog Post Top',
        description: 'Renders before article content on blog detail pages.',
        area: 'Blog',
        placementHint: 'Use for in-content responsive ads above the article body.',
        format: 'horizontal',
    },
    {
        id: 'blog-post-bottom',
        label: 'Blog Post Bottom',
        description: 'Renders after article content on blog detail pages.',
        area: 'Blog',
        placementHint: 'Useful for affiliate CTAs or end-of-post AdSense units.',
        format: 'horizontal',
    },
    {
        id: 'tool-detail-bottom',
        label: 'Tool Detail Bottom',
        description: 'Renders below the main tool content area.',
        area: 'Tool Pages',
        placementHint: 'Use for comparison offers, sponsor cards, or wide display ads.',
        format: 'horizontal',
    },
    {
        id: 'tool-sidebar',
        label: 'Tool Sidebar',
        description: 'Sidebar monetization slot on tool detail pages.',
        area: 'Tool Pages',
        placementHint: 'Designed for sticky or medium-rectangle creative.',
        format: 'vertical',
    },
    {
        id: 'quiz-hub-inline',
        label: 'Matcher Hub Inline',
        description: 'Renders within the AI tool matcher hub after the launch categories.',
        area: 'Matcher',
        placementHint: 'Use for sponsor placements tied to discovery intent.',
        format: 'horizontal',
    },
    {
        id: 'quiz-result-primary',
        label: 'Matcher Result Primary',
        description: 'Primary monetization block beneath the top quiz recommendation.',
        area: 'Matcher',
        placementHint: 'Use for affiliate creative or responsive ads after a match is revealed.',
        format: 'horizontal',
    },
    {
        id: 'quiz-result-secondary',
        label: 'Matcher Result Secondary',
        description: 'Secondary matcher placement after comparisons and supporting content.',
        area: 'Matcher',
        placementHint: 'Good for follow-up offers or additional sponsor placements.',
        format: 'horizontal',
    },
    {
        id: 'site-footer',
        label: 'Global Footer Banner',
        description: 'Renders above the footer on every page.',
        area: 'Footer',
        placementHint: 'Best for final sponsor calls or site-wide affiliate creative.',
        format: 'horizontal',
    },
] as const;

export type AdSlotId = (typeof AD_SLOT_DEFINITIONS)[number]['id'];
export type AdNetwork = 'adsense' | 'affiliate' | 'custom';
export type AdFormat = (typeof AD_SLOT_DEFINITIONS)[number]['format'];

export interface StoredAdSlotConfig {
    enabled: boolean;
    network: AdNetwork;
    code: string;
    notes: string;
    updatedAt: string | null;
}

export interface PublicAdSlotConfig extends StoredAdSlotConfig {
    id: AdSlotId;
    label: string;
    description: string;
    area: string;
    placementHint: string;
    format: AdFormat;
}

export type AdSettingsContent = {
    version: number;
    slots: Record<AdSlotId, StoredAdSlotConfig>;
};

const DEFAULT_SLOT_CONFIG: StoredAdSlotConfig = {
    enabled: false,
    network: 'adsense',
    code: '',
    notes: '',
    updatedAt: null,
};

function sanitizeAdCode(value: unknown) {
    return typeof value === 'string' ? value.trim() : '';
}

function sanitizeAdText(value: unknown, maxLength = 240) {
    return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function isAdSlotId(value: string): value is AdSlotId {
    return AD_SLOT_DEFINITIONS.some((slot) => slot.id === value);
}

export function getDefaultAdSettings(): AdSettingsContent {
    return {
        version: 0,
        slots: AD_SLOT_DEFINITIONS.reduce((acc, slot) => {
            acc[slot.id] = { ...DEFAULT_SLOT_CONFIG };
            return acc;
        }, {} as Record<AdSlotId, StoredAdSlotConfig>),
    };
}

export function normalizeAdSettings(raw: unknown): AdSettingsContent {
    const defaults = getDefaultAdSettings();

    if (!raw || typeof raw !== 'object') {
        return defaults;
    }

    const input = raw as Partial<AdSettingsContent> & {
        slots?: Record<string, Partial<StoredAdSlotConfig>>;
    };

    const slots = { ...defaults.slots };

    for (const definition of AD_SLOT_DEFINITIONS) {
        const candidate = input.slots?.[definition.id];
        if (!candidate) {
            continue;
        }

        slots[definition.id] = {
            enabled: Boolean(candidate.enabled),
            network: candidate.network === 'affiliate' || candidate.network === 'custom' ? candidate.network : 'adsense',
            code: sanitizeAdCode(candidate.code),
            notes: sanitizeAdText(candidate.notes, 400),
            updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : null,
        };
    }

    return {
        version: typeof input.version === 'number' ? input.version : 0,
        slots,
    };
}

export function mergeAdSettingsIntoDefinitions(content: AdSettingsContent): PublicAdSlotConfig[] {
    return AD_SLOT_DEFINITIONS.map((definition) => ({
        ...definition,
        ...content.slots[definition.id],
    }));
}

export function upsertSingleAdSlot(
    currentContent: AdSettingsContent,
    slotId: AdSlotId,
    partial: Partial<StoredAdSlotConfig>
): AdSettingsContent {
    return {
        version: Date.now(),
        slots: {
            ...currentContent.slots,
            [slotId]: {
                enabled: Boolean(partial.enabled),
                network: partial.network === 'affiliate' || partial.network === 'custom' ? partial.network : 'adsense',
                code: sanitizeAdCode(partial.code),
                notes: sanitizeAdText(partial.notes, 400),
                updatedAt: new Date().toISOString(),
            },
        },
    };
}

export function getEnabledPublicSlots(content: AdSettingsContent) {
    return mergeAdSettingsIntoDefinitions(content).filter((slot) => slot.enabled && slot.code);
}
