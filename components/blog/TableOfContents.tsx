'use client';

import { useState, useEffect } from 'react';

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    items?: TOCItem[];
}

export default function TableOfContents({ items = [] }: TableOfContentsProps) {
    const [toc, setToc] = useState<TOCItem[]>(items);
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const article = document.querySelector('article');
        if (!article) return;

        const headings = Array.from(article.querySelectorAll('h2, h3'));
        const items = headings.map((heading) => {
            const text = heading.textContent || '';
            const id = heading.id; // ID is now guaranteed to be set by the server

            return {
                id,
                text,
                level: heading.tagName === 'H2' ? 2 : 3
            };
        });

        // The heading list is derived from the post DOM once after mount.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToc(items);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-100px 0px -70% 0px' }
        );

        headings.forEach((heading) => observer.observe(heading));
        return () => observer.disconnect();
    }, []);

    if (toc.length === 0) return null;

    return (
        <nav className="toc-container mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-100">
            <h4 className="font-heading text-lg text-black mb-4 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                TABLE OF CONTENTS
            </h4>
            <ul className="space-y-2">
                {toc.map((item) => (
                    <li
                        key={item.id}
                        style={{ paddingLeft: item.level === 3 ? '1.5rem' : '0' }}
                    >
                        <a
                            href={`#${item.id}`}
                            className={`text-sm transition-colors hover:text-black ${activeId === item.id ? 'text-black font-bold' : 'text-gray-700'
                                }`}
                        >
                            {item.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
