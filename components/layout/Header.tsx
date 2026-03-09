import prisma from '@/lib/prisma';
import HeaderClient from './HeaderClient';

const defaultNavLinks = [
    { href: '/', label: 'Home' },
    {
        href: '/ai-tools-directory',
        label: 'AI Tools',
        children: [
            { href: '/ai-tools-directory/', label: 'All Tools' },
            { href: '/ai-tools-directory/ai-video-tools/', label: 'Video Tools' },
            { href: '/ai-tools-directory/ai-writing-tools/', label: 'Writing Tools' },
            { href: '/ai-tools-directory/ai-coding-tools/', label: 'Coding Tools' },
            { href: '/ai-tools-directory/ai-image-tools/', label: 'Image Tools' },
            { href: '/ai-tools-directory/ai-marketing-tools/', label: 'Marketing Tools' },
            { href: '/ai-tools-directory/ai-automation-tools/', label: 'Automation Tools' },
        ],
    },
    { href: '/blog', label: 'Blog' },
    { href: '/find-tools', label: 'Find Tools' },
    { href: '/about-us', label: 'About' },
    { href: '/contact', label: 'Contact' },
];

export default async function Header() {
    let navLinks = defaultNavLinks;
    try {
        const navContent = await prisma.siteContent.findUnique({
            where: { sectionId: 'header-nav' }
        });
        if (navContent?.content && Array.isArray((navContent.content as any).links)) {
            navLinks = (navContent.content as any).links;
        }
    } catch (e) {
        console.error('Failed to load header nav:', e);
    }

    return <HeaderClient navLinks={navLinks} />;
}
