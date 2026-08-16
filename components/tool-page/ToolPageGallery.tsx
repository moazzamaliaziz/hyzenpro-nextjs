'use client';

import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toolHeadingFont } from '@/lib/tool-page-fonts';
import type { Screenshot } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPageGalleryProps {
    toolName: string;
    screenshots: Screenshot[];
}

export default function ToolPageGallery({
    toolName,
    screenshots,
}: ToolPageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    useEffect(() => {
        if (activeIndex === null) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setActiveIndex(null);
            }

            if (event.key === 'ArrowRight') {
                setActiveIndex((current) => (current === null ? null : (current + 1) % screenshots.length));
            }

            if (event.key === 'ArrowLeft') {
                setActiveIndex((current) => (current === null ? null : (current - 1 + screenshots.length) % screenshots.length));
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = '';
        };
    }, [activeIndex, screenshots.length]);

    if (screenshots.length === 0) {
        return null;
    }

    const activeScreenshot = activeIndex === null ? null : screenshots[activeIndex];

    return (
        <section id="screenshots" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
            <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                See {toolName} in Action
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
                {screenshots.map((screenshot, index) => (
                    <figure key={screenshot.url} className="group">
                        <button
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className="relative block w-full overflow-hidden rounded-[8px] border border-[#E5E7EB] bg-[#F9FAFB]"
                        >
                            <img
                                src={screenshot.url}
                                alt={screenshot.alt}
                                width={screenshot.width}
                                height={screenshot.height}
                                loading="lazy"
                                className="h-auto w-full object-cover"
                            />
                            <span className="absolute inset-0 bg-black/0 transition-colors duration-200 group-hover:bg-black/10" />
                            <span className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/92 text-[#0F0F0F] opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                <Search className="h-4 w-4" />
                            </span>
                        </button>
                        <figcaption className="mt-3 text-center text-[13px] leading-[1.7] text-[#6B7280]">
                            {screenshot.caption}
                        </figcaption>
                    </figure>
                ))}
            </div>

            {activeScreenshot && (
                <div className="fixed inset-0 z-[120] bg-black/90 p-4 sm:p-8">
                    <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setActiveIndex(null)}
                            className="absolute right-0 top-0 inline-flex h-12 w-12 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                            aria-label="Close screenshot lightbox"
                        >
                            <X className="h-6 w-6" />
                        </button>

                        <div className="relative flex w-full items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveIndex((current) =>
                                        current === null ? 0 : (current - 1 + screenshots.length) % screenshots.length
                                    )
                                }
                                className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                                aria-label="Previous screenshot"
                            >
                                <ChevronLeft className="h-6 w-6" />
                            </button>

                            <div className="max-h-[82vh] overflow-hidden rounded-[8px] border border-white/10 bg-white">
                                <img
                                    src={activeScreenshot.url}
                                    alt={activeScreenshot.alt}
                                    width={activeScreenshot.width}
                                    height={activeScreenshot.height}
                                    className="max-h-[82vh] h-auto w-auto max-w-full object-contain"
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveIndex((current) =>
                                        current === null ? 0 : (current + 1) % screenshots.length
                                    )
                                }
                                className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                                aria-label="Next screenshot"
                            >
                                <ChevronRight className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mt-4 max-w-3xl text-center text-[13px] leading-[1.7] text-white/80">
                            {activeScreenshot.caption}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
