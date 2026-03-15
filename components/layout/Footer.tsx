import prisma from '@/lib/prisma';
import FooterClient from './FooterClient';

const defaultFooterLinks = {
    'AI Tools': [
        { href: '/ai-tools-directory/', label: 'All Tools' },
        { href: '/ai-tools-directory/ai-video-tools/', label: 'Video Tools' },
        { href: '/ai-tools-directory/ai-writing-tools/', label: 'Writing Tools' },
        { href: '/ai-tools-directory/ai-coding-tools/', label: 'Coding Tools' },
        { href: '/ai-tools-directory/ai-image-tools/', label: 'Image Tools' },
        { href: '/ai-tools-directory/ai-automation-tools/', label: 'Automation' },
    ],
    Blog: [
        { href: '/blog/', label: 'Latest Posts' },
        { href: '/category/reviews/', label: 'Reviews' },
        { href: '/category/tutorials/', label: 'Tutorials' },
        { href: '/category/comparisons/', label: 'Comparisons' },
    ],
    Company: [
        { href: '/about-us/', label: 'About Us' },
        { href: '/contact/', label: 'Contact' },
        { href: '/how-we-test/', label: 'How We Test' },
        { href: '/advertise/', label: 'Advertise' },
        { href: '/submit-ai-tool/', label: 'Submit Tool' },
    ],
    Legal: [
        { href: '/privacy-policy/', label: 'Privacy Policy' },
        { href: '/terms-of-service/', label: 'Terms of Service' },
    ],
};

export default async function Footer() {
    let footerLinks = defaultFooterLinks;
    let globalSettings = { siteName: 'HyzenPro', logoUrl: '/images/logo.png' };
    
    try {
        const [navContent, globalContent] = await Promise.all([
            prisma.siteContent.findUnique({ where: { sectionId: 'footer-nav' } }),
            prisma.siteContent.findUnique({ where: { sectionId: 'global-settings' } })
        ]);
        
        if (navContent?.content && (navContent.content as any).links) {
            footerLinks = (navContent.content as any).links;
        }
        if (globalContent?.content) {
            globalSettings = globalContent.content as any;
        }
    } catch (e) {
        console.error('Failed to load footer nav:', e);
    }

    return <FooterClient footerLinks={footerLinks} globalSettings={globalSettings} />;
}
