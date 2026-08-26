import Image from 'next/image';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

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
] as const;

type FooterLink = {
    label: string;
    href: string;
};

type FooterColumn = {
    id: string;
    title: string;
    links: FooterLink[];
};

function withLocale(locale: string, href: string) {
    return locale === 'en' ? href : `/${locale}${href}`;
}

const linkClassName =
    'inline-flex min-h-11 items-center rounded-lg py-2 text-sm text-foreground/60 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2 focus-visible:ring-offset-card';

export default async function Footer() {
    const [locale, nav, common] = await Promise.all([
        getLocale(),
        getTranslations('nav'),
        getTranslations('common'),
    ]);

    const footerColumns: FooterColumn[] = [
        {
            id: 'footer-ai-tools',
            title: common('footer_ai_tools'),
            links: [
                { label: nav('tools'), href: '/ai-tools-directory/' },
                { label: nav('video_tools'), href: '/ai-tools-directory/ai-video-tools/' },
                { label: nav('writing_tools'), href: '/ai-tools-directory/ai-writing-tools/' },
                { label: nav('coding_tools'), href: '/ai-tools-directory/ai-coding-tools/' },
                { label: nav('image_tools'), href: '/ai-tools-directory/ai-image-tools/' },
                { label: nav('automation_tools'), href: '/ai-tools-directory/ai-automation-tools/' },
            ],
        },
        {
            id: 'footer-compare',
            title: common('footer_compare'),
            links: [
                { label: common('footer_side_by_side'), href: '/compare/tools/' },
                { label: common('footer_find_quiz'), href: '/find-tools/' },
                { label: common('footer_editors_choice'), href: '/#editors-pick' },
                { label: common('footer_buyers_quiz'), href: '/find-tools/' },
            ],
        },
        {
            id: 'footer-resources',
            title: common('footer_resources'),
            links: [
                { label: nav('blog'), href: '/blog/' },
                { label: common('footer_how_we_review'), href: '/how-we-test/' },
                { label: common('footer_submit'), href: '/submit-ai-tool/' },
            ],
        },
        {
            id: 'footer-company',
            title: common('footer_company'),
            links: [
                { label: common('footer_about'), href: '/about-us/' },
                { label: nav('contact'), href: '/contact/' },
                { label: common('footer_advertise'), href: '/advertise/' },
                { label: common('footer_privacy'), href: '/privacy-policy/' },
                { label: common('footer_terms'), href: '/terms-of-service/' },
            ],
        },
    ];

    return (
        <footer id="site-footer" className="border-t border-foreground/10 bg-card">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid gap-12 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.95fr)] lg:gap-16">
                    <div className="max-w-md">
                        <Link
                            href={withLocale(locale, '/')}
                            aria-label="HyzenPro home"
                            className="inline-flex rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-4 focus-visible:ring-offset-card"
                        >
                            <Image
                                src="/logo-main.png"
                                alt="HyzenPro"
                                width={180}
                                height={48}
                                sizes="180px"
                                className="h-14 w-auto object-contain sm:h-16"
                            />
                        </Link>
                        <p className="mt-5 text-sm leading-7 text-foreground/60">
                            {common('footer_tagline')}
                        </p>
                        <Link
                            href={withLocale(locale, '/ai-tools-directory/')}
                            className="group mt-6 inline-flex min-h-11 items-center rounded-full border border-foreground/15 px-4 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-foreground/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                        >
                            {common('all_tools')}
                            <span aria-hidden="true" className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
                        </Link>

                        <div className="mt-10 border-t border-foreground/10 pt-6">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/40">
                                {common('listed_on')}
                            </p>
                            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-4">
                                {platforms.map((platform) => (
                                    <a
                                        key={platform.name}
                                        href={platform.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        aria-label={`View HyzenPro on ${platform.name}`}
                                        className="inline-flex min-h-11 items-center rounded-lg opacity-55 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                                    >
                                        <Image
                                            src={platform.logo}
                                            alt=""
                                            width={platform.width}
                                            height={34}
                                            sizes={`${Math.min(platform.width, 150)}px`}
                                            className="h-6 w-auto object-contain sm:h-7"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:pt-2">
                        {footerColumns.map((column) => (
                            <section key={column.id} aria-labelledby={column.id}>
                                <h2 id={column.id} className="text-sm font-semibold text-foreground">
                                    {column.title}
                                </h2>
                                <ul className="mt-4 space-y-1">
                                    {column.links.map((link) => (
                                        <li key={link.href}>
                                            <Link href={withLocale(locale, link.href)} className={linkClassName}>
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </nav>
                </div>
            </div>

            <div className="border-t border-foreground/10">
                <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-6 text-center text-xs text-foreground/45 sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <p>
                        &copy; {new Date().getFullYear()} HyzenPro. {common('all_rights')}
                    </p>
                    <nav aria-label="Legal navigation" className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-end">
                        <Link href={withLocale(locale, '/privacy-policy/')} className="rounded-md px-1 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30">
                            {common('footer_privacy_short')}
                        </Link>
                        <Link href={withLocale(locale, '/terms-of-service/')} className="rounded-md px-1 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30">
                            {common('footer_terms_short')}
                        </Link>
                        <Link href={withLocale(locale, '/contact/')} className="rounded-md px-1 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30">
                            {common('footer_contact')}
                        </Link>
                        <Link href={withLocale(locale, '/advertise/')} className="rounded-md px-1 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30">
                            {common('footer_advertise')}
                        </Link>
                        <Link href={withLocale(locale, '/submit-ai-tool/')} className="rounded-md px-1 py-1 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/30">
                            {common('footer_submit_short')}
                        </Link>
                    </nav>
                </div>
                <p className="mx-auto max-w-6xl px-6 pb-6 text-center text-[11px] leading-5 text-foreground/35">
                    {common('independent')}
                </p>
            </div>
        </footer>
    );
}
