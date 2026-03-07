import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink, Star, ArrowRight } from 'lucide-react';
import { getPricingLabel, getPricingColor, getCategoryIcon } from '@/lib/utils';
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
    };
    priority?: boolean;
}

export default function ToolCard({ tool, priority = false }: ToolCardProps) {
    const category = tool.primaryCategory || 'ai-general-tools';
    const toolUrl = `/ai-tools-directory/${category}/${tool.slug}/`;

    return (
        <div
            className="group relative flex flex-col bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
        >
            <Link
                href={toolUrl}
                prefetch={true}
                className="absolute inset-0 z-10"
                aria-label={tool.name}
            />

            {/* Subtle Gradient Hover Reveal */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/80 dark:from-gray-800/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0" />

            {/* Content Container */}
            <div className="relative z-10 p-6 flex-1 flex flex-col">

                <div className="absolute top-3 right-3 z-20 flex gap-2 items-center">
                    {tool.featured && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-black text-white rounded-full">
                            Featured
                        </span>
                    )}
                    <AddToCompareButton tool={{
                        id: tool.id || '',
                        name: tool.name,
                        slug: tool.slug,
                        logo: tool.logo,
                        category: tool.primaryCategory
                    }} />
                    <SaveToolButton toolId={tool.id ?? "temp"} />
                </div>

                {/* Header: Logo + Name */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden flex items-center justify-center">
                        {tool.logo ? (
                            <Image
                                src={tool.logo}
                                alt={tool.name}
                                width={40}
                                height={40}
                                priority={priority}
                                className="object-contain"
                            />
                        ) : (
                            <span className="text-2xl">{getCategoryIcon(category)}</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-xl text-black dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300 truncate">
                            {tool.name}
                        </h3>
                        {tool.rating && (
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-xs font-semibold text-amber-600">
                                    {tool.rating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2 mb-5">
                    {tool.shortDescription}
                </p>

                {/* Footer */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <span
                        className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full ${getPricingColor(tool.pricingType)}`}
                    >
                        {getPricingLabel(tool.pricingType)}
                    </span>
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-white transition-colors duration-300 flex items-center gap-1">
                        View Details
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                </div>
            </div>
        </div>
    );
}
