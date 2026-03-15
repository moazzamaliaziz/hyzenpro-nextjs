'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu, X, ChevronDown } from 'lucide-react';
import CommandPalette from './CommandPalette';
import ThemeToggle from '@/components/theme/ThemeToggle';

interface NavLink {
    href: string;
    label: string;
    children?: { href: string; label: string }[];
}

export default function HeaderClient({ navLinks, globalSettings }: { navLinks: NavLink[], globalSettings: any }) {
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
                    ? 'py-3 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm'
                    : 'py-5 bg-transparent'
                    }`}
            >
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative z-10 flex items-center gap-3 group" prefetch={true}>
                        <div className="relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={globalSettings?.logoUrl || '/images/logo.png'}
                                alt={globalSettings?.siteName || 'HyzenPro'}
                                className="transition-all duration-300 relative z-10 object-contain"
                                style={{ width: scrolled ? 44 : 56, height: scrolled ? 44 : 56 }}
                            />
                        </div>
                        <span className="font-heading text-2xl tracking-wider text-black dark:text-white uppercase truncate max-w-[150px] sm:max-w-none">
                            {globalSettings?.siteName || 'HYZENPRO'}
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
                                        ? 'text-black dark:text-white bg-gray-100 dark:bg-white/10'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                        }`}
                                >
                                    {link.label}
                                    {link.children && <ChevronDown className="w-3 h-3 transition-transform" />}
                                </Link>

                                {/* Dropdown */}
                                {link.children && dropdownOpen === link.href && (
                                    <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-xl shadow-xl py-2 animate-fade-in">
                                        {link.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className="block px-4 py-2.5 text-sm text-gray-600 hover:text-black hover:bg-gray-50 transition-all"
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
                        <ThemeToggle />

                        {session && (
                            <>
                                <Link
                                    href="/my-stack"
                                    prefetch={true}
                                    className="hidden lg:inline-flex px-4 py-2 text-sm font-medium tracking-wider uppercase text-black hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    My Stack
                                </Link>
                                <Link
                                    href="/vendor"
                                    prefetch={true}
                                    className="hidden lg:inline-flex px-4 py-2 text-sm font-medium tracking-wider uppercase text-black hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Vendor
                                </Link>
                            </>
                        )}

                        <Link
                            href="/submit-ai-tool"
                            prefetch={true}
                            className="hidden lg:inline-flex px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 rounded-lg"
                        >
                            Submit Tool
                        </Link>

                        <button
                            className="lg:hidden relative z-10 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-black"
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
                <div className="fixed inset-0 z-40 bg-white dark:bg-gray-950 animate-fade-in overflow-y-auto">
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
                                        className={`block font-heading text-4xl md:text-6xl transition-all duration-300 ${isActive(link.href)
                                            ? 'text-black dark:text-white'
                                            : 'text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white hover:translate-x-2'
                                            }`}
                                        onClick={(e) => {
                                            if (link.children) e.preventDefault();
                                            else setMenuOpen(false);
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                    {link.children && (
                                        <div className="flex flex-wrap gap-2 mt-4 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
                                            {link.children.map(child => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="text-sm px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
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
                                    className="animate-slide-up pt-6 border-t border-gray-100 dark:border-gray-800"
                                    style={{ animationDelay: `${navLinks.length * 0.08}s` }}
                                >
                                    <Link
                                        href="/my-stack"
                                        prefetch={true}
                                        className={`block font-heading text-4xl md:text-6xl transition-all duration-300 ${isActive('/my-stack')
                                            ? 'text-black dark:text-white'
                                            : 'text-gray-400 dark:text-gray-600 hover:text-black dark:hover:text-white hover:translate-x-2'
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
                                className="inline-flex w-full justify-center px-8 py-4 bg-black dark:bg-white text-white dark:text-black text-white font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 shadow-lg shadow-black/10 dark:shadow-white/10"
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
