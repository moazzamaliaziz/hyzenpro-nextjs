'use client';

import { Play, Youtube } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toolHeadingFont } from '@/lib/tool-page-fonts';
import type { TutorialVideo } from '@/lib/tool-page-types';
import { cn } from '@/lib/utils';

interface ToolPageVideosProps {
    toolName: string;
    videos: TutorialVideo[];
    accent: string;
}

function formatPublishedDate(date: string) {
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function ToolPageVideos({
    toolName,
    videos,
    accent,
}: ToolPageVideosProps) {
    const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

    const videoCards = useMemo(
        () =>
            videos.map((video) => ({
                ...video,
                thumbnail: `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
            })),
        [videos]
    );

    if (videoCards.length === 0) {
        return null;
    }

    return (
        <section id="videos" className="scroll-mt-28 border-t border-[#F3F4F6] pt-10 sm:pt-16">
            <h2 className={cn(toolHeadingFont.className, 'text-[24px] leading-[1.2] text-[#0F0F0F]')}>
                Learn {toolName} - Tutorial Videos
            </h2>
            <p className="mt-4 text-[15px] leading-[1.75] text-[#4B5563]">
                Curated from top YouTube creators.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
                {videoCards.map((video) => {
                    const isActive = activeVideoId === video.videoId;

                    return (
                        <article
                            key={video.videoId}
                            className="rounded-2xl border border-[#E5E7EB] bg-white p-4 transition-colors duration-200 hover:bg-[#FAFAFA]"
                        >
                            <div className="overflow-hidden rounded-[8px] border border-[#E5E7EB]">
                                {isActive ? (
                                    <div className="aspect-video bg-[#0F0F0F]">
                                        <iframe
                                            title={video.title}
                                            className="h-full w-full"
                                            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?rel=0`}
                                            loading="lazy"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setActiveVideoId(video.videoId)}
                                        className="group relative block aspect-video w-full overflow-hidden"
                                    >
                                        <img
                                            src={video.thumbnail}
                                            alt={`${video.title} thumbnail`}
                                            width={480}
                                            height={270}
                                            loading="lazy"
                                            className="h-full w-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/45 transition-opacity duration-200 group-hover:bg-black/35" />
                                        <span
                                            className="absolute left-1/2 top-1/2 inline-flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90"
                                            aria-hidden="true"
                                        >
                                            <Play className="ml-0.5 h-6 w-6 text-black" fill="#111111" />
                                        </span>
                                    </button>
                                )}
                            </div>

                            <div className="mt-4">
                                <h3 className="text-[16px] font-semibold leading-[1.5] text-[#0F0F0F]">
                                    {video.title}
                                </h3>

                                <div className="mt-3 flex items-center gap-3 text-[13px] text-[#6B7280]">
                                    <span
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#E5E7EB] bg-[#F9FAFB] text-[#0F0F0F]"
                                        aria-hidden="true"
                                    >
                                        {video.channelAvatar ? (
                                            <img
                                                src={video.channelAvatar}
                                                alt=""
                                                width={32}
                                                height={32}
                                                className="h-8 w-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <Youtube className="h-4 w-4" />
                                        )}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="truncate">{video.channelName}</div>
                                        <div>{video.views} views - {formatPublishedDate(video.publishedDate)}</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-3">
                                    <a
                                        href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[14px] font-medium text-black transition-colors"
                                    >
                                        Watch on YouTube {'->'}
                                    </a>
                                    {isActive && (
                                        <button
                                            type="button"
                                            onClick={() => setActiveVideoId(null)}
                                            className="text-[14px] font-medium text-[#6B7280]"
                                        >
                                            Close Video
                                        </button>
                                    )}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
