export type EditorialAuthor = {
    name: string;
    slug: string;
    role: string;
    bio: string;
    avatar?: string;
    socialLinks?: {
        twitter?: string;
        linkedin?: string;
        website?: string;
    };
};

export const EDITORIAL_AUTHORS: Record<string, EditorialAuthor> = {
    'ali-malik': {
        name: 'Ali Malik',
        slug: 'ali-malik',
        role: 'AI Tools Editor',
        bio: 'Ali Malik reviews AI software for creators, marketers, and small teams. His HyzenPro coverage focuses on hands-on workflow testing, pricing clarity, practical limitations, and how each tool fits into a real production stack.',
        avatar: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/02/naq1p620_ali-malik.png',
        socialLinks: {
            website: 'https://hyzenpro.com/about-us/',
        },
    },
    'rana-aqib': {
        name: 'Rana Aqib',
        slug: 'rana-aqib',
        role: 'AI Workflow Researcher',
        bio: 'Rana Aqib covers AI automation, video tools, coding assistants, and emerging productivity software. His reviews emphasize repeatable testing, buyer tradeoffs, and clear recommendations for different user types.',
        avatar: 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/07/02/z98zdccq_rana-aqib.png',
        socialLinks: {
            website: 'https://hyzenpro.com/about-us/',
        },
    },
};

export function getEditorialAuthor(slug?: string | null) {
    if (slug && EDITORIAL_AUTHORS[slug]) {
        return EDITORIAL_AUTHORS[slug];
    }

    return EDITORIAL_AUTHORS['ali-malik'];
}

export function findEditorialAuthor(slug?: string | null) {
    return slug ? EDITORIAL_AUTHORS[slug] : undefined;
}
