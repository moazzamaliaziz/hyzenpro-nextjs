'use client';

import { useEffect } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        twttr?: {
            widgets?: {
                load?: (element?: HTMLElement) => void;
            };
        };
    }
}

interface EmbeddedTweet {
    tweetId: string;
    tweetUrl: string;
    embedHtml: string;
}

interface XEmbedRailProps {
    tweets: EmbeddedTweet[];
}

export default function XEmbedRail({ tweets }: XEmbedRailProps) {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const root = document.getElementById('homepage-x-embed-rail');
        if (root && window.twttr?.widgets?.load) {
            window.twttr.widgets.load(root);
        }
    }, [tweets]);

    if (tweets.length === 0) {
        return null;
    }

    return (
        <>
            <Script
                id="twitter-widgets-script"
                src="https://platform.twitter.com/widgets.js"
                strategy="lazyOnload"
                onLoad={() => {
                    const root = document.getElementById('homepage-x-embed-rail');
                    if (root && window.twttr?.widgets?.load) {
                        window.twttr.widgets.load(root);
                    }
                }}
            />

            <div
                id="homepage-x-embed-rail"
                className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {tweets.map((tweet) => (
                    <article
                        key={tweet.tweetId}
                        className="min-w-[340px] max-w-[340px] snap-start rounded-[28px] border border-gray-200 bg-white p-4 shadow-[8px_8px_0px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-1 dark:border-gray-800 dark:bg-gray-950 dark:shadow-[8px_8px_0px_rgba(255,255,255,0.08)] sm:min-w-[380px] sm:max-w-[380px]"
                    >
                        <div
                            className="min-h-[240px] overflow-hidden rounded-2xl bg-white"
                            dangerouslySetInnerHTML={{ __html: tweet.embedHtml }}
                        />
                    </article>
                ))}
            </div>
        </>
    );
}
