import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { buildBlogQuery, type BlogListingFilters } from '@/lib/blog-query';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath?: string;
    filters?: Omit<BlogListingFilters, 'page'>;
}

function pageHref(basePath: string, page: number, filters: Omit<BlogListingFilters, 'page'>) {
    return `${basePath}${buildBlogQuery({ ...filters, page })}`;
}

export default function Pagination({
    currentPage,
    totalPages,
    basePath = '/blog/',
    filters = {},
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const pages: (number | '…')[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
        for (let page = 1; page <= totalPages; page += 1) pages.push(page);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('…');

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let page = start; page <= end; page += 1) pages.push(page);

        if (currentPage < totalPages - 2) pages.push('…');
        pages.push(totalPages);
    }

    return (
        <nav aria-label="Blog pagination" className="mt-12 flex flex-wrap items-center justify-center gap-1.5">
            {currentPage > 1 ? (
                <Link
                    href={pageHref(basePath, currentPage - 1, filters)}
                    rel="prev"
                    className="inline-flex min-h-10 items-center gap-1 rounded-full border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Previous</span>
                </Link>
            ) : (
                <span aria-disabled="true" className="inline-flex min-h-10 items-center gap-1 rounded-full border border-gray-100 px-3 text-sm text-gray-300">
                    <ChevronLeft aria-hidden="true" className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only">Previous</span>
                </span>
            )}

            {pages.map((page, index) => page === '…' ? (
                <span key={`ellipsis-${index}`} aria-hidden="true" className="px-2 text-gray-400">…</span>
            ) : (
                <Link
                    key={page}
                    href={pageHref(basePath, page, filters)}
                    aria-current={currentPage === page ? 'page' : undefined}
                    className={`inline-flex min-h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${currentPage === page
                        ? 'border-black bg-black font-semibold text-white'
                        : 'border-gray-200 text-gray-600 hover:border-black hover:text-black'
                        }`}
                >
                    {page}
                </Link>
            ))}

            {currentPage < totalPages ? (
                <Link
                    href={pageHref(basePath, currentPage + 1, filters)}
                    rel="next"
                    className="inline-flex min-h-10 items-center gap-1 rounded-full border border-gray-200 px-3 text-sm text-gray-600 transition-colors hover:border-black hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
                >
                    <span className="sr-only sm:not-sr-only">Next</span>
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </Link>
            ) : (
                <span aria-disabled="true" className="inline-flex min-h-10 items-center gap-1 rounded-full border border-gray-100 px-3 text-sm text-gray-300">
                    <span className="sr-only sm:not-sr-only">Next</span>
                    <ChevronRight aria-hidden="true" className="h-4 w-4" />
                </span>
            )}
        </nav>
    );
}
