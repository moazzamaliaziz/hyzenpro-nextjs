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
            className="group relative flex flex-col bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-black dark:hover:border-white hover:shadow-[8px_8px_0px_#000] dark:hover:shadow-[8px_8px_0px_#fff]"
        >
            <Link
                href={toolUrl}
                prefetch={true}
                className="absolute inset-0 z-10"
                aria-label={tool.name}
            />

            {/* Subtle Solid Hover Reveal */}
            <div className="absolute inset-0 bg-gray-50/50 dark:bg-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />

            {/* Content Container */}
            <div className="relative z-10 p-6 flex-1 flex flex-col">

                <div className="absolute top-3 right-3 z-20 flex gap-2 items-center">
                    {tool.featured && (
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white">
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
                    <div className="flex-shrink-0 w-14 h-14 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center">
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
                                <Star className="w-3.5 h-3.5 fill-black dark:fill-white text-black dark:text-white" />
                                <span className="text-xs font-bold text-black dark:text-white">
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
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 ${getPricingColor(tool.pricingType)}`}
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
