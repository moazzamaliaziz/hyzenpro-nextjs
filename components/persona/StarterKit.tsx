import Link from 'next/link';
import { Star, ExternalLink } from 'lucide-react';
import ToolLogo from '@/components/ui/ToolLogo';
import { getPricingLabel, getCategoryIcon } from '@/lib/utils';

interface Tool {
    id: string;
    name: string;
    slug: string;
    shortDescription: string;
    logo?: string | null;
    pricingType: string;
    rating?: number | null;
    primaryCategory?: string | null;
}

interface StarterKitProps {
    tools: Tool[];
    notes?: Array<{ toolId: string; note: string }>;
}

const PRICING_STYLES: Record<string, string> = {
    free: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    freemium: 'bg-muted text-muted-foreground border border-border',
    paid: 'bg-foreground text-background',
    enterprise: 'bg-foreground/80 text-background',
};

export default function StarterKit({ tools, notes }: StarterKitProps) {
    if (!tools?.length) return null;

    return (
        <section className="mb-16">
            <h2 className="font-serif text-3xl text-foreground mb-2">
                The <span className="italic text-muted-foreground">starter kit</span>
            </h2>
            <p className="text-muted-foreground mb-8">Our curated top picks to get you started immediately.</p>
            <div className="grid md:grid-cols-3 gap-6">
                {tools.map((tool, i) => {
                    const category = tool.primaryCategory || 'ai-general-tools';
                    const toolUrl = `/ai-tools-directory/${category}/${tool.slug}/`;
                    const toolNote = notes?.find(n => n.toolId === tool.slug)?.note;
                    const pricingStyle = PRICING_STYLES[tool.pricingType] || PRICING_STYLES.freemium;

                    return (
                        <Link key={tool.id} href={toolUrl}
                            className="group relative bg-card border border-border rounded-2xl p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                            <div className="absolute top-4 right-4">
                                <ExternalLink className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-muted border border-border rounded-xl flex items-center justify-center text-2xl">
                                    <ToolLogo logo={tool.logo} name={tool.name} size="sm" />
                                </div>
                                <div>
                                    <h3 className="font-serif text-lg text-foreground group-hover:text-muted-foreground transition-colors">{tool.name}</h3>
                                    {tool.rating && (
                                        <div className="flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span className="text-xs text-muted-foreground">{tool.rating.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">{tool.shortDescription}</p>

                            {toolNote && (
                                <p className="text-xs text-muted-foreground/60 italic border-t border-border pt-3 mt-3">{toolNote}</p>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${pricingStyle}`}>
                                    {getPricingLabel(tool.pricingType)}
                                </span>
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                    View Details →
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
