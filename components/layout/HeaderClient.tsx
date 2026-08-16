'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { resolveSiteLogoUrl } from '@/lib/branding';

const CommandPalette = dynamic(() => import('./CommandPalette'), {
    ssr: false,
    loading: () => (
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground">
            <span className="w-40 text-left">Search the registry...</span>
        </div>
    ),
});

interface NavLink {
    href: string;
    label: string;
    children?: { href: string; label: string }[];
}

export default function HeaderClient({ navLinks, globalSettings }: { navLinks: NavLink[], globalSettings: any }) {
    const resolvedLogoUrl = resolveSiteLogoUrl(globalSettings?.logoUrl);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
    const { data: session } = useSession();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
        setDropdownOpen(null);
    }, [pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? 'py-3 bg-background/95 backdrop-blur-xl border-b border-border shadow-sm'
                    : 'py-5 bg-transparent'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" aria-label="HyzenPro home" className="relative z-10 flex items-center shrink-0" prefetch={true}>
                        <div className={`relative transition-[width] duration-300 ${scrolled ? 'w-[64px] sm:w-[72px] lg:w-[80px]' : 'w-[72px] sm:w-[80px] lg:w-[92px]'}`}>
                            <Image
                                src={resolvedLogoUrl}
                                alt="HyzenPro logo"
                                className="relative z-10 h-auto w-full object-contain"
                                width={600}
                                height={600}
                                sizes="(min-width: 1024px) 92px, (min-width: 640px) 80px, 72px"
                                priority
                            />
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <div
                                key={link.href}
                                className="relative"
                                onMouseEnter={() => link.children ? setDropdownOpen(link.href) : undefined}
                                onMouseLeave={() => setDropdownOpen(null)}
                            >
                                <Link
                                    href={link.href}
                                    prefetch={true}
                                    className={`group relative px-4 py-2 text-sm font-medium tracking-wider uppercase transition-all duration-300 flex items-center gap-1 rounded-lg ${isActive(link.href)
                                        ? 'text-foreground bg-muted'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }`}
                                >
                                    {link.label}
                                    {link.children && <ChevronDown className="w-3 h-3 transition-transform" />}
                                </Link>

                                {/* Dropdown */}
                                {link.children && dropdownOpen === link.href && (
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-card border border-border rounded-xl shadow-xl py-2 animate-fade-in">
                                        {link.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Command Palette + CTA + Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        <CommandPalette />

                        {session && (
                            <>
                                <Link
                                    href="/my-stack"
                                    prefetch={true}
                                    className="hidden lg:inline-flex px-4 py-2 text-sm font-medium tracking-wider uppercase text-foreground hover:bg-muted rounded-lg transition-colors"
                                >
                                    My Stack
                                </Link>

                            </>
                        )}

                        <Link
                            href="/submit-ai-tool"
                            prefetch={true}
                            className="hidden lg:inline-flex px-5 py-2.5 bg-foreground text-background text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all duration-300 rounded-lg"
                        >
                            Submit Tool
                        </Link>

                        <button
                            className="lg:hidden relative z-10 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-foreground"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 bg-background animate-fade-in overflow-y-auto">
                    <div className="max-w-7xl mx-auto px-4 py-24 min-h-screen flex flex-col justify-center">
                        <nav className="space-y-6">
                            {navLinks.map((link, index) => (
                                <div
                                    key={link.href}
                                    className="animate-slide-up"
                                    style={{ animationDelay: `${index * 0.08}s` }}
                                >
                                    <Link
                                        href={link.href}
                                        prefetch={true}
                                        className={`block font-heading text-3xl md:text-5xl transition-all duration-300 ${isActive(link.href)
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:translate-x-2'
                                            }`}
                                        onClick={(e) => {
                                            if (link.children) e.preventDefault();
                                            else setMenuOpen(false);
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                    {link.children && (
                                        <div className="flex flex-wrap gap-2 mt-4 pl-4 border-l-2 border-border">
                                            {link.children.map(child => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="text-sm px-4 py-2 rounded-lg bg-muted text-foreground/80 hover:bg-foreground hover:text-background transition-colors"
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {session && (
                                <div
                                    className="animate-slide-up pt-6 border-t border-border"
                                    style={{ animationDelay: `${navLinks.length * 0.08}s` }}
                                >
                                    <Link
                                        href="/my-stack"
                                        prefetch={true}
                                        className={`block font-heading text-3xl md:text-5xl transition-all duration-300 ${isActive('/my-stack')
                                            ? 'text-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:translate-x-2'
                                            }`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        My Stack
                                    </Link>
                                </div>
                            )}
                        </nav>

                        <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                            <Link
                                href="/submit-ai-tool"
                                prefetch={true}
                                className="inline-flex w-full justify-center px-8 py-4 bg-foreground text-background font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-all duration-300 shadow-lg"
                                onClick={() => setMenuOpen(false)}
                            >
                                Submit AI Tool
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
