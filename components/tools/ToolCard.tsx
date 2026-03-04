import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Star, ArrowRight } from 'lucide-react';
import { getPricingLabel, getPricingColor, getCategoryIcon } from '@/lib/utils';

interface ToolCardProps {
    tool: {
        name: string;
        slug: string;
        shortDescription: string;
        logo?: string | null;
        pricingType: string;
        rating?: number | null;
        primaryCategory?: string | null;
        views?: number;
        featured?: boolean;
    };
}

export default function ToolCard({ tool }: ToolCardProps) {
    const category = tool.primaryCategory || 'ai-general-tools';
    const toolUrl = `/ai-tools-directory/${category}/${tool.slug}/`;

    return (
        <Link
            href={toolUrl}
            className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/5"
        >
            {/* Featured Badge */}
            {tool.featured && (
                <div className="absolute top-3 right-3 z-10">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-accent text-white rounded-full">
                        Featured
                    </span>
                </div>
            )}

            <div className="p-6">
                {/* Header: Logo + Name */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-white/[0.06] border border-white/10 overflow-hidden flex items-center justify-center">
                        {tool.logo ? (
                            <Image
                                src={tool.logo}
                                alt={tool.name}
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        ) : (
                            <span className="text-2xl">{getCategoryIcon(category)}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-xl text-white group-hover:text-accent transition-colors duration-300 truncate">
                            {tool.name}
                        </h3>
                        {tool.rating && (
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-semibold text-amber-400">
                                    {tool.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-white/40 text-sm leading-relaxed line-clamp-2 mb-5">
                    {tool.shortDescription}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                    <span
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${getPricingColor(tool.pricingType).replace('text-', 'text-').replace('bg-', 'bg-')}`}
                    >
                        {getPricingLabel(tool.pricingType)}
                    </span>
                    <span className="text-xs font-medium text-white/30 group-hover:text-accent transition-colors duration-300 flex items-center gap-1">
                        View Details
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </Link>
    );
}
