'use client';

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface SectionLink {
    id: string;
    label: string;
}

interface ToolPageTableOfContentsProps {
    sections: SectionLink[];
    accent: string;
    className?: string;
}

export default function ToolPageTableOfContents({
    sections,
    accent,
    className,
}: ToolPageTableOfContentsProps) {
    const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
    const [mobileOpen, setMobileOpen] = useState(false);

    const orderedSections = useMemo(() => sections.filter((section) => Boolean(section.id)), [sections]);

    useEffect(() => {
        if (orderedSections.length === 0) {
            return;
        }

        const observers: IntersectionObserver[] = [];

        orderedSections.forEach((section) => {
            const node = document.getElementById(section.id);
            if (!node) {
                return;
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    const entry = entries[0];
                    if (entry?.isIntersecting) {
                        setActiveSection(section.id);
                    }
                },
                {
                    rootMargin: '-20% 0px -60% 0px',
                    threshold: 0.2,
                }
            );

            observer.observe(node);
            observers.push(observer);
        });

        return () => observers.forEach((observer) => observer.disconnect());
    }, [orderedSections]);

    if (orderedSections.length === 0) {
        return null;
    }

    return (
        <div className={className}>
            <div className="lg:hidden">
                <button
                    type="button"
                    onClick={() => setMobileOpen((current) => !current)}
                    className="flex min-h-[44px] w-full items-center justify-between rounded-[6px] border border-[#E5E7EB] bg-white px-4 py-3 text-left text-[13px] font-medium text-[#0F0F0F]"
                >
                    <span>Jump to section</span>
                    <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', mobileOpen && 'rotate-180')} />
                </button>

                <div
                    className={cn(
                        'overflow-hidden transition-[max-height,opacity] duration-300',
                        mobileOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                    )}
                >
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                        {orderedSections.map((section) => {
                            const isActive = activeSection === section.id;

                            return (
                                <Link
                                    key={section.id}
                                    href={`#${section.id}`}
                                    onClick={() => setMobileOpen(false)}
                                    className="whitespace-nowrap rounded-full border border-[#E5E7EB] px-4 py-2 text-[13px] leading-6 transition-colors"
                                    style={{
                                        borderColor: isActive ? '#111111' : '#E5E7EB',
                                        color: isActive ? '#111111' : '#6B7280',
                                        backgroundColor: isActive ? '#F5F5F5' : '#FFFFFF',
                                    }}
                                >
                                    {section.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            <nav className="hidden lg:block" aria-label="Tool detail table of contents">
                <div className="rounded-[8px] bg-white px-1">
                    <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.22em] text-[#6B7280]">
                        On This Page
                    </div>
                    <ul className="space-y-2">
                        {orderedSections.map((section) => {
                            const isActive = activeSection === section.id;

                            return (
                                <li key={section.id}>
                                    <Link
                                        href={`#${section.id}`}
                                        className="relative block pl-4 text-[13px] leading-7 text-[#6B7280] transition-colors hover:text-[#0F0F0F]"
                                        style={{
                                            color: isActive ? '#0F0F0F' : '#6B7280',
                                        }}
                                    >
                                        <span
                                            className="absolute left-0 top-1/2 h-6 -translate-y-1/2 rounded-full"
                                            style={{
                                                width: isActive ? 2 : 1,
                                                backgroundColor: isActive ? '#111111' : '#E5E7EB',
                                            }}
                                            aria-hidden="true"
                                        />
                                        {section.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </nav>
        </div>
    );
}
