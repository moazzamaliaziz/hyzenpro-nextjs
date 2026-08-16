import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
    const allItems = [{ label: 'Home', href: '/' }, ...items];

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-1.5 text-sm text-muted-foreground overflow-x-auto pb-1 ${className}`}
        >
            {allItems.map((item, index) => (
                <span key={index} className="flex items-center gap-1.5 whitespace-nowrap">
                    {index > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0 text-muted-foreground/50" />}
                    {index === 0 && <Home className="w-3.5 h-3.5 flex-shrink-0" />}
                    {item.href ? (
                        <Link
                            href={item.href}
                            aria-current={index === allItems.length - 1 ? 'page' : undefined}
                            className={`transition-colors duration-200 hover:text-foreground ${
                                index === allItems.length - 1 ? 'text-foreground font-medium' : ''
                            }`}
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className={index === allItems.length - 1 ? 'text-foreground font-medium' : ''}>
                            {item.label}
                        </span>
                    )}
                </span>
            ))}
        </nav>
    );
}
