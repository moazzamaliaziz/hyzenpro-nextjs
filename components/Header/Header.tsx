'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowUpRight, ChevronDown, Search } from 'lucide-react';
import { DEFAULT_SITE_LOGO_URL } from '@/lib/branding';
import styles from './Header.module.css';

type MenuLink = { label: string; href: string; desc?: string };
type MenuColumn = { heading: string; links: MenuLink[] };
type BlogLink = { title: string; href: string; tag?: string };
type MenuGroup = {
  label: string;
  href?: string;
  columns?: MenuColumn[];
  blog?: BlogLink[];
};

const NAV: MenuGroup[] = [
  { label: 'AI Tools Directory', href: '/ai-tools-directory/' },
  {
    label: 'Categories',
    columns: [
      {
        heading: 'Popular Categories',
        links: [
          { label: 'AI Video Tools', href: '/ai-tools-directory/ai-video-tools/', desc: 'Editors, generators, captions' },
          { label: 'AI Writing Tools', href: '/ai-tools-directory/ai-writing-tools/', desc: 'Content, copy, and SEO writing' },
          { label: 'AI Coding Tools', href: '/ai-tools-directory/ai-coding-tools/', desc: 'Assistants for developers' },
          { label: 'AI Image Tools', href: '/ai-tools-directory/ai-image-tools/', desc: 'Art generators, editors' },
          { label: 'AI Automation', href: '/ai-tools-directory/ai-automation-tools/', desc: 'Workflow and task automation' },
        ],
      },
      {
        heading: 'Discover',
        links: [
          { label: 'All Tools', href: '/ai-tools-directory/', desc: 'Browse the full directory' },
          { label: 'Find Tools', href: '/find-tools/', desc: 'Take the guided matcher quiz' },
        ],
      },
    ],
  },
  { label: 'Blog', href: '/blog/' },
  { label: 'Compare', href: '/compare/tools/' },
  { label: 'Find Tools', href: '/find-tools/' },
  { label: 'About', href: '/about-us/' },
  { label: 'Contact', href: '/contact/' },
];

const MOBILE_LINKS: MenuLink[] = [
  { label: 'AI Tools Directory', href: '/ai-tools-directory/' },
  { label: 'Categories', href: '/ai-tools-directory/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Compare', href: '/compare/tools/' },
  { label: 'Find Tools', href: '/find-tools/' },
  { label: 'About', href: '/about-us/' },
  { label: 'Contact', href: '/contact/' },
];

export default function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollSentinelRef = useRef<HTMLDivElement | null>(null);

  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  const localizedHref = (href: string) => `${localePrefix}${href}`;

  const navItems: MenuGroup[] = [
    { label: t('tools'), href: '/ai-tools-directory/' },
    {
      label: t('categories'),
      columns: [
        {
          heading: t('popular_categories'),
          links: [
            { label: t('video_tools'), href: '/ai-tools-directory/ai-video-tools/', desc: t('video_tools_desc') },
            { label: t('writing_tools'), href: '/ai-tools-directory/ai-writing-tools/', desc: t('writing_tools_desc') },
            { label: t('coding_tools'), href: '/ai-tools-directory/ai-coding-tools/', desc: t('coding_tools_desc') },
            { label: t('image_tools'), href: '/ai-tools-directory/ai-image-tools/', desc: t('image_tools_desc') },
            { label: t('automation_tools'), href: '/ai-tools-directory/ai-automation-tools/', desc: t('automation_tools_desc') },
          ],
        },
        {
          heading: t('discover'),
          links: [
            { label: t('all_tools'), href: '/ai-tools-directory/', desc: t('all_tools_desc') },
            { label: t('find_tools'), href: '/find-tools/', desc: t('find_tools_desc') },
          ],
        },
      ],
    },
    { label: t('blog'), href: '/blog/' },
    { label: t('compare'), href: '/compare/tools/' },
    { label: t('find_tools'), href: '/find-tools/' },
    { label: t('about'), href: '/about-us/' },
    { label: t('contact'), href: '/contact/' },
  ];

  const mobileLinks: MenuLink[] = [
    { label: t('tools'), href: '/ai-tools-directory/' },
    { label: t('categories'), href: '/ai-tools-directory/' },
    { label: t('blog'), href: '/blog/' },
    { label: t('compare'), href: '/compare/tools/' },
    { label: t('find_tools'), href: '/find-tools/' },
    { label: t('about'), href: '/about-us/' },
    { label: t('contact'), href: '/contact/' },
  ];

  const isDashboardRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/portal-auth');

  useEffect(() => {
    const sentinel = scrollSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    // Route changes must close transient navigation UI; this runs only when
    // pathname changes, never on scroll or continuous layout events.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isMenuOpen]);

  if (isDashboardRoute) return null;

  const isActive = (href?: string) => {
    if (!href) return false;
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href) || false;
  };

  const handleEnter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(label);
  };

  const handleLeave = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  return (
    <>
      <div ref={scrollSentinelRef} className={styles.scrollSentinel} aria-hidden="true" />
      <header
        className={styles.header}
        role="banner"
        onMouseLeave={handleLeave}
      >
        <div className={`${styles.shell} ${isScrolled ? styles.shellScrolled : ''}`}>
          <Link href="/" className={styles.logoLink} aria-label="HyzenPro home">
            <Image
                src={DEFAULT_SITE_LOGO_URL}
                alt="HyzenPro"
                width={600}
                height={600}
                priority
                className={styles.logoImage}
                sizes="(max-width: 640px) 84px, 98px"
              />
          </Link>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            {navItems.map((item) => {
              const hasMenu = Boolean(item.columns || item.blog);
              const isOpen = openMenu === item.label;

              return (
                <div
                  key={item.label}
                  className={styles.navItem}
                  onMouseEnter={() => hasMenu && handleEnter(item.label)}
                >
                  {item.href ? (
                    <Link
                      href={localizedHref(item.href)}
                      className={`${styles.navTrigger} ${isActive(item.href) ? styles.navTriggerActive : ''} ${isOpen ? styles.navTriggerOpen : ''}`}
                      aria-expanded={hasMenu ? isOpen : undefined}
                    >
                      <span>{item.label}</span>
                      {hasMenu && <ChevronDown className={styles.chevron} aria-hidden="true" />}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.navTrigger} ${isOpen ? styles.navTriggerOpen : ''}`}
                      onClick={() => setOpenMenu(isOpen ? null : item.label)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.label}</span>
                      <ChevronDown className={styles.chevron} aria-hidden="true" />
                    </button>
                  )}
                </div>
              );
            })}
          </nav>

          <div className={styles.actions}>
            <Link href={localizedHref('/find-tools/')} className={styles.searchButton} aria-label="Search and find AI tools">
              <Search className={styles.searchIcon} aria-hidden="true" />
            </Link>
            <Link href={localizedHref('/submit-ai-tool/')} className={styles.ctaButton} aria-label={t('submit_tool')}>
              <span>{t('submit_tool')}</span>
              <ArrowUpRight className={styles.ctaIcon} aria-hidden="true" />
            </Link>
            <button
              type="button"
              className={styles.menuBtn}
              aria-label={isMenuOpen ? 'Close menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className={`${styles.bar} ${isMenuOpen ? styles.barTop : ''}`} />
              <span className={`${styles.bar} ${isMenuOpen ? styles.barMid : ''}`} />
              <span className={`${styles.bar} ${isMenuOpen ? styles.barBot : ''}`} />
            </button>
          </div>
        </div>

        <div className={styles.megaLayer} aria-hidden={!openMenu} inert={!openMenu}>
          {navItems.filter((item) => item.columns || item.blog).map((item) => {
            const isOpen = openMenu === item.label;
            return (
              <div
                key={item.label}
                className={`${styles.megaPanel} ${isOpen ? styles.megaPanelOpen : ''}`}
                aria-hidden={!isOpen}
                inert={!isOpen}
                onMouseEnter={() => handleEnter(item.label)}
              >
                {item.blog ? (
                  <div className={styles.blogMega}>
                    <div className={styles.megaHeader}>
                      <div>
                        <p className={styles.eyebrow}>{t('from_the_blog')}</p>
                        <h2>{t('latest_insights')}</h2>
                      </div>
                      <Link href={localizedHref('/blog/')} className={styles.viewAllLink}>
                        {tc('view_all')}
                        <ArrowUpRight className={styles.smallIcon} aria-hidden="true" />
                      </Link>
                    </div>
                    <div className={styles.blogGrid}>
                      {item.blog.map((post) => (
                        <Link key={post.href} href={localizedHref(post.href)} className={styles.blogCard}>
                          <span className={styles.blogTag}>{post.tag}</span>
                          <span className={styles.blogTitle}>{post.title}</span>
                          <span className={styles.blogRead}>
                            {t('read_article')}
                            <ArrowUpRight className={styles.smallIcon} aria-hidden="true" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className={styles.columnsMega}>
                    {item.columns?.map((column) => (
                      <div key={column.heading} className={styles.megaColumn}>
                        <p className={styles.eyebrow}>{column.heading}</p>
                        <ul className={styles.megaList}>
                          {column.links.map((link) => (
                            <li key={link.href}>
                              <Link href={localizedHref(link.href)} className={styles.megaLink}>
                                <span className={styles.megaLinkTitle}>
                                  {link.label}
                                  <ArrowUpRight className={styles.linkArrow} aria-hidden="true" />
                                </span>
                                {link.desc && <span className={styles.megaLinkDesc}>{link.desc}</span>}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`${styles.drawer} ${isMenuOpen ? styles.drawerOpen : ''}`}
        aria-hidden={!isMenuOpen}
        inert={!isMenuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
      >
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.drawerLogo} onClick={() => setIsMenuOpen(false)}>
            <Image
              src={DEFAULT_SITE_LOGO_URL}
              alt="HyzenPro"
              width={600}
              height={600}
              className={styles.drawerLogoImage}
              sizes="140px"
            />
          </Link>
          <button
            type="button"
            className={styles.closeBtn}
            aria-label="Close navigation menu"
            onClick={() => setIsMenuOpen(false)}
          >
            <span aria-hidden="true">x</span>
          </button>
        </div>

        <nav className={styles.drawerNav} aria-label="Mobile primary navigation">
          {mobileLinks.map((item) => (
            <Link
              key={item.href}
              href={localizedHref(item.href)}
              className={`${styles.drawerLink} ${isActive(item.href) ? styles.drawerLinkActive : ''}`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          <Link
            href={localizedHref('/submit-ai-tool/')}
            className={styles.drawerCta}
            aria-label={t('submit_tool')}
            onClick={() => setIsMenuOpen(false)}
          >
            {t('submit_tool')}
          </Link>
        </div>
      </div>

      {isMenuOpen && <button type="button" className={styles.backdrop} aria-label="Close navigation menu" onClick={() => setIsMenuOpen(false)} />}
    </>
  );
}
