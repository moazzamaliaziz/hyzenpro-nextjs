import ToolLogo from '@/components/ui/ToolLogo';
import Link from 'next/link';
import { Star, ExternalLink, Check } from 'lucide-react';
import { getCategoryIcon } from '@/lib/utils';
import SaveToolButton from './SaveToolButton';
import AddToCompareButton from '@/components/compare/AddToCompareButton';

interface ToolCardProps {
    tool: {
        id?: string;
        name: string;
        slug: string;
        shortDescription: string;
        logo?: string | null;
        pricingType: string;
        rating?: number | null;
        primaryCategory?: string | null;
        views?: number;
        featured?: boolean;
        categoryLabel?: string;
        bestFor?: string;
        startingPrice?: string;
        isTrending?: boolean;
    };
    priority?: boolean;
    saved?: boolean;
    savedStateLoading?: boolean;
    onSavedChange?: (toolId: string, saved: boolean) => void;
}

const PRICING_STYLES: Record<string, string> = {
    free: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    freemium: 'bg-muted text-muted-foreground border border-border',
    paid: 'bg-foreground text-background',
    enterprise: 'bg-foreground/80 text-background',
};

const PRICING_LABELS: Record<string, string> = {
    free: 'Free',
    freemium: 'Freemium',
    paid: 'Paid',
    enterprise: 'Enterprise',
};

export default function ToolCard({
    tool,
    priority = false,
    saved,
    savedStateLoading = false,
    onSavedChange,
}: ToolCardProps) {
    const category = tool.primaryCategory || 'ai-general-tools';
    const toolUrl = `/ai-tools-directory/${category}/${tool.slug}/`;
    const categoryLabel = tool.categoryLabel || category.replace(/-/g, ' ').replace(/^ai /, '');
    const pricingStyle = PRICING_STYLES[tool.pricingType] || PRICING_STYLES.freemium;
    const pricingLabel = PRICING_LABELS[tool.pricingType] || tool.pricingType;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: tool.name,
        url: `https://hyzenpro.com${toolUrl}`,
        applicationCategory: 'AI Tool',
        ...(tool.rating && {
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: tool.rating,
                bestRating: 5,
                worstRating: 1,
                ratingCount: Math.round((tool.views || 100) * 0.3),
                reviewCount: Math.round((tool.views || 100) * 0.3),
            },
        }),
        offers: {
            '@type': 'Offer',
            price: tool.pricingType === 'free' ? '0' : undefined,
            priceCurrency: 'USD',
            availability: 'https://schema.org/OnlineAvailable',
        },
    };

    return (
        <div
            className="group relative flex flex-col bg-card border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-foreground/20"
            itemScope
            itemType="https://schema.org/SoftwareApplication"
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hover glow */}
            <div className="absolute inset-0 bg-foreground/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />

            <div className="relative z-10 p-5 flex-1 flex flex-col">
                {/* Meta row: pill left, icons right */}
                <div className="flex items-center justify-between mb-4">
                    {tool.featured ? (
                        <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-foreground text-background rounded-full">
                            Featured
                        </span>
                    ) : (
                        <span className="px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-muted text-muted-foreground rounded-full">
                            {categoryLabel}
                        </span>
                    )}
                    <div className="flex gap-1.5 items-center">
                        <AddToCompareButton tool={{
                            id: tool.id || '',
                            name: tool.name,
                            slug: tool.slug,
                            logo: tool.logo,
                            category: tool.primaryCategory
                        }} />
                        <SaveToolButton
                            toolId={tool.id ?? 'temp'}
                            initialSaved={saved ?? false}
                            skipInitialFetch={saved !== undefined}
                            externalLoading={savedStateLoading}
                            onSavedChange={onSavedChange}
                        />
                    </div>
                </div>

                {/* Brand row: logo + name + rating */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-muted border border-border rounded-xl overflow-hidden">
                        <ToolLogo logo={tool.logo} name={tool.name} size="sm" priority={priority} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base text-foreground group-hover:text-muted-foreground transition-colors duration-300 truncate">
                                                            <Link href={toolUrl} prefetch={priority} className="focus:outline-none" aria-label={`View details for ${tool.name}`}>

                                <span className="absolute inset-0 z-20" aria-hidden="true" />
                                <span itemProp="name">{tool.name}</span>
                            </Link>
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            {tool.rating && (
                                <>
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-semibold text-foreground/70" itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
                                        <span itemProp="ratingValue">{tool.rating.toFixed(1)}</span>
                                    </span>
                                    <span className="text-xs text-muted-foreground">·</span>
                                </>
                            )}
                            <span className="text-xs text-muted-foreground truncate">{categoryLabel}</span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4" itemProp="description">
                    {tool.shortDescription}
                </p>

                {/* Tag chips */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${pricingStyle}`}>
                        {pricingLabel}
                    </span>
                    {tool.pricingType === 'free' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Free
                        </span>
                    )}
                    {tool.startingPrice && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                            from {tool.startingPrice}
                        </span>
                    )}
                    {tool.isTrending && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                            Trending
                        </span>
                    )}
                </div>

                {/* Best-for sliver */}
                {tool.bestFor && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 mb-3">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{tool.bestFor}</span>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
                    <Link
                        href={toolUrl}
                        prefetch={priority}
                        className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Read review
                    </Link>
                    <a
                        href={`https://hyzenpro.com${toolUrl}`}
                        target="_blank"
                        rel="noreferrer noopener nofollow"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
                    >
                        Visit <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
