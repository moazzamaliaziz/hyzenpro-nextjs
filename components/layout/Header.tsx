import prisma from '@/lib/prisma';
import AdSlot from '@/components/ads/AdSlot';
import { DEFAULT_SITE_LOGO_URL } from '@/lib/branding';
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
    let globalSettings = { siteName: 'HyzenPro', logoUrl: DEFAULT_SITE_LOGO_URL };
    
    try {
        const [navContent, globalContent] = await Promise.all([
            prisma.siteContent.findUnique({ where: { sectionId: 'header-nav' } }),
            prisma.siteContent.findUnique({ where: { sectionId: 'global-settings' } })
        ]);
        
        if (navContent?.content && Array.isArray((navContent.content as any).links)) {
            navLinks = (navContent.content as any).links;
        }
        if (globalContent?.content) {
            globalSettings = globalContent.content as any;
        }
    } catch (e) {
        console.error('Failed to load header nav:', e);
    }
    return (
        <>
            <HeaderClient navLinks={navLinks} globalSettings={globalSettings} />
            <AdSlot slot="site-header" format="horizontal" className="mx-auto mt-28 mb-4 max-w-7xl px-4 sm:px-6 lg:px-8 border-none bg-transparent min-h-0" priority />
        </>
    );
}
