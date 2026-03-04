'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/ai-tools-directory', label: 'AI Tools' },
    { href: '/blog', label: 'Blog' },
    { href: '/about-us', label: 'About' },
    { href: '/contact', label: 'Contact' },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                        ? 'py-3 bg-black/95 backdrop-blur-lg border-b border-white/10'
                        : 'py-5 bg-transparent'
                    }`}
            >
                <nav className="container flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="relative z-10" prefetch={true}>
                        <img
                            src="/images/logo.png"
                            alt="HyzenPro"
                            className={`transition-all duration-300 ${scrolled ? 'h-8' : 'h-10'}`}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                prefetch={true}
                                className={`group relative text-sm font-medium tracking-wider uppercase transition-colors ${isActive(link.href)
                                        ? 'text-white'
                                        : 'text-white/70 hover:text-white'
                                    }`}
                            >
                                {link.label}
                                <span
                                    className={`absolute -bottom-1 left-0 h-[2px] bg-white transition-all duration-300 ${isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}
                                />
                            </Link>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <div className="hidden lg:block">
                        <Link
                            href="/submit-ai-tool"
                            prefetch={true}
                            className="px-6 py-3 bg-white text-black text-sm font-semibold uppercase tracking-wider hover:bg-white/90 transition-all rounded-lg"
                        >
                            Submit Tool
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden relative z-10 w-10 h-10 flex items-center justify-center"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                    >
                        <div className="w-6 h-5 relative">
                            <span className={`absolute left-0 w-full h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'top-2 rotate-45' : 'top-0'}`} />
                            <span className={`absolute left-0 top-2 w-full h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'opacity-0' : 'opacity-100'}`} />
                            <span className={`absolute left-0 w-full h-0.5 bg-white transition-all duration-300 ${menuOpen ? 'top-2 -rotate-45' : 'top-4'}`} />
                        </div>
                    </button>
                </nav>
            </header>

            {/* Mobile Menu Overlay - Simplified animation */}
            {menuOpen && (
                <div className="fixed inset-0 z-40 bg-black animate-fade-in">
                    <div className="container h-full flex flex-col justify-center">
                        <nav className="space-y-6">
                            {navLinks.map((link, index) => (
                                <div
                                    key={link.href}
                                    className="animate-slide-up"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <Link
                                        href={link.href}
                                        prefetch={true}
                                        className={`block font-heading text-5xl md:text-7xl transition-colors ${isActive(link.href)
                                                ? 'text-white'
                                                : 'text-white/70 hover:text-white'
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
                                className="inline-block px-8 py-4 bg-white text-black font-semibold uppercase tracking-wider rounded-lg"
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

