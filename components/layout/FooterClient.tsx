'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

const platforms = [
    {
        name: 'Product Hunt',
        href: 'https://www.producthunt.com/products/hyzenpro',
        logo: '/images/logos/product-hunt.svg',
        width: 150,
    },
    {
        name: 'G2',
        href: 'https://www.g2.com/products/hyzenpro/reviews',
        logo: '/images/logos/g2.svg',
        width: 80,
    },
    {
        name: 'Indie Hackers',
        href: 'https://www.indiehackers.com/product/hyzenpro',
        logo: '/images/logos/indie-hackers.svg',
        width: 140,
    },
    {
        name: 'Medium',
        href: 'https://medium.com/@ali.malikk',
        logo: '/images/logos/medium.svg',
        width: 120,
    },
];

export default function FooterClient() {
    const t = useTranslations('common');
    const locale = useLocale();
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    const localizedHref = (href: string) => `${localePrefix}${href}`;

    const footerColumns = [
        {
            title: t('footer_ai_tools'),
            links: [
                { label: t('tools'), href: '/ai-tools-directory/' },
                { label: t('video_tools'), href: '/ai-tools-directory/ai-video-tools/' },
                { label: t('writing_tools'), href: '/ai-tools-directory/ai-writing-tools/' },
                { label: t('coding_tools'), href: '/ai-tools-directory/ai-coding-tools/' },
                { label: t('image_tools'), href: '/ai-tools-directory/ai-image-tools/' },
                { label: t('automation_tools'), href: '/ai-tools-directory/ai-automation-tools/' },
            ],
        },
        {
            title: t('footer_compare'),
            links: [
                { label: t('footer_side_by_side'), href: '/compare/tools/' },
                { label: t('footer_find_quiz'), href: '/find-tools/' },
                { label: t('footer_editors_choice'), href: '/#editors-pick' },
                { label: t('footer_buyers_quiz'), href: '/find-tools/' },
            ],
        },
        {
            title: t('footer_resources'),
            links: [
                { label: t('blog'), href: '/blog/' },
                { label: t('footer_how_we_review'), href: '/how-we-test/' },
                { label: t('footer_submit'), href: '/submit-ai-tool/' },
            ],
        },
        {
            title: t('footer_company'),
            links: [
                { label: t('footer_about'), href: '/about-us/' },
                { label: t('contact'), href: '/contact/' },
                { label: t('footer_advertise'), href: '/advertise/' },
                { label: t('footer_privacy'), href: '/privacy-policy/' },
                { label: t('footer_terms'), href: '/terms-of-service/' },
            ],
        },
    ];

    return (
        <footer className="border-t border-foreground/10 bg-card">
            <div className="mx-auto max-w-6xl px-6 py-16">
                {/* Header */}
                <div className="mb-12 max-w-xl">
                    <div className="flex items-center gap-3 mb-2">
                        <Image
                            src="/logo-main.png"
                            alt="HyzenPro"
                            width={180}
                            height={48}
                            className="h-16 sm:h-20 md:h-24 w-auto object-contain"
                            priority={false}
                        />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/50">
                        {t('footer_tagline')}
                    </p>
                </div>

                {/* Platform Logos */}
                <div className="mb-12 border-b border-foreground/10 pb-10">
                    <p className="mb-6 text-center text-xs uppercase tracking-widest text-foreground/40">{t('listed_on')}</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10">
                        {platforms.map((platform) => (
                            <Link
                                key={platform.name}
                                href={platform.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center opacity-50 transition hover:opacity-100"
                                aria-label={`View HyzenPro on ${platform.name}`}
                            >
                                <Image
                                    src={platform.logo}
                                    alt={`${platform.name} logo`}
                                    width={platform.width}
                                    height={34}
                                    className="h-7 w-auto object-contain sm:h-8"
                                    priority={false}
                                />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* 4-Column Grid */}
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    {footerColumns.map((col) => (
                        <div key={col.title}>
                            <h3 className="text-sm font-semibold">{col.title}</h3>
                            <ul className="mt-4 space-y-2.5">
                                {col.links.map((link) => (
                                    <li key={link.href}>
                                        <Link href={localizedHref(link.href)} className="text-sm text-foreground/50 transition hover:text-foreground">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Legal Bar */}
            <div className="border-t border-foreground/10">
                <div className="mx-auto max-w-6xl px-6 py-6">
                    <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
                        <p className="text-xs text-foreground/40">
                            &copy; {new Date().getFullYear()} HyzenPro. {t('all_rights')}
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-xs text-foreground/40">
                            <Link href={localizedHref('/privacy-policy/')} className="transition hover:text-foreground">{t('footer_privacy_short')}</Link>
                            <Link href={localizedHref('/terms-of-service/')} className="transition hover:text-foreground">{t('footer_terms_short')}</Link>
                            <Link href={localizedHref('/contact/')} className="transition hover:text-foreground">{t('footer_contact')}</Link>
                            <Link href={localizedHref('/advertise/')} className="transition hover:text-foreground">{t('footer_advertise')}</Link>
                            <Link href={localizedHref('/submit-ai-tool/')} className="transition hover:text-foreground">{t('footer_submit_short')}</Link>
                        </div>
                    </div>
                    <p className="mt-4 text-center text-[11px] text-foreground/30">
                        {t('independent')}
                    </p>
                </div>
            </div>
        </footer>
    );
}
