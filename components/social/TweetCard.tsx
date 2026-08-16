import Image from 'next/image';

interface TweetCardProps {
    avatar: string;
    name: string;
    handle: string;
    text: string;
    date: string;
    likes?: number;
    retweets?: number;
    tweetUrl?: string;
    mediaUrl?: string;
}

export default function TweetCard({ avatar, name, handle, text, date, likes, retweets, tweetUrl, mediaUrl }: TweetCardProps) {
    const content = (
        <div className="group flex h-full min-h-[280px] w-[320px] flex-col justify-between bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black dark:hover:border-white hover:shadow-[8px_8px_0px_#000] dark:hover:shadow-[8px_8px_0px_#fff]">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-800">
                        {avatar ? (
                            <Image src={avatar} alt={name} width={44} height={44} className="object-cover w-full h-full" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg font-heading text-gray-400">
                                {name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-bold text-sm text-black dark:text-white leading-tight">{name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">@{handle}</div>
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                            <span className="inline-block h-2 w-2 rounded-full bg-sky-500" />
                            Verified on X
                        </div>
                    </div>
                </div>
                <svg className="w-5 h-5 text-black dark:text-white opacity-20 group-hover:opacity-100 transition-opacity flex-shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            </div>

            {/* Tweet Text */}
            <p className="mb-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{text}</p>
            {mediaUrl ? (
                <div className="mb-6 overflow-hidden border border-gray-100 dark:border-gray-800">
                    <Image
                        src={mediaUrl}
                        alt={`Media shared by ${name}`}
                        width={640}
                        height={360}
                        className="h-auto w-full object-cover"
                    />
                </div>
            ) : null}

            {/* Footer */}
            <div className="mt-auto flex flex-wrap items-center gap-4 border-t border-gray-100 pt-4 text-[11px] text-gray-600 dark:border-gray-800 dark:text-gray-400">
                <span>{date}</span>
                {likes !== undefined && likes > 0 && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {likes}
                    </span>
                )}
                {retweets !== undefined && retweets > 0 && (
                    <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                        </svg>
                        {retweets}
                    </span>
                )}
                {tweetUrl ? (
                    <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.2em] text-black dark:text-white">
                        View tweet
                    </span>
                ) : null}
            </div>
        </div>
    );

    if (!tweetUrl) {
        return content;
    }

    return (
        <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            aria-label={`View original X post by ${name}`}
            className="block h-full w-fit"
        >
            {content}
        </a>
    );
}
