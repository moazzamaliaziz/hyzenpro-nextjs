'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';

const navLinks = [
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
    { href: '/about-us', label: 'About' },
    { href: '/contact', label: 'Contact' },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
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
                        ? 'py-3 bg-black/95 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-black/50'
                        : 'py-5 bg-transparent'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative z-10 flex items-center gap-3 group" prefetch={true}>
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <Image
                                src="/images/logo.png"
                                alt="HyzenPro"
                                width={scrolled ? 32 : 40}
                                height={scrolled ? 32 : 40}
                                className="transition-all duration-300 relative z-10"
                                priority
                            />
                        </div>
                        <span className="font-heading text-2xl tracking-wider text-white">
                            HYZENPRO
                        </span>
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
                                            ? 'text-white bg-white/10'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                    {link.children && <ChevronDown className="w-3 h-3 transition-transform" />}
                                </Link>

                                {/* Dropdown */}
                                {link.children && dropdownOpen === link.href && (
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 animate-fade-in">
                                        {link.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className="block px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* CTA + Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/submit-ai-tool"
                            prefetch={true}
                            className="hidden lg:inline-flex px-5 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-accent hover:text-white transition-all duration-300 rounded-lg"
                        >
                            Submit Tool
                        </Link>

                        <button
                            className="lg:hidden relative z-10 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
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
                <div className="fixed inset-0 z-40 bg-black/98 backdrop-blur-2xl animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 h-full flex flex-col justify-center">
                        <nav className="space-y-4">
                            {navLinks.map((link, index) => (
                                <div
                                    key={link.href}
                                    className="animate-slide-up"
                                    style={{ animationDelay: `${index * 0.08}s` }}
                                >
                                    <Link
                                        href={link.href}
                                        prefetch={true}
                                        className={`block font-heading text-5xl md:text-7xl transition-all duration-300 ${isActive(link.href)
                                                ? 'text-white'
                                                : 'text-white/40 hover:text-white hover:translate-x-4'
                                            }`}
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </div>
                            ))}
                        </nav>

                        <div className="mt-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                            <Link
                                href="/submit-ai-tool"
                                prefetch={true}
                                className="inline-block px-8 py-4 bg-white text-black font-bold uppercase tracking-widest rounded-lg hover:bg-accent hover:text-white transition-all duration-300"
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
