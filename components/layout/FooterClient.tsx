'use client';

import Link from 'next/link';
import Image from 'next/image';

interface FooterLinks {
    [category: string]: { href: string; label: string }[];
}

export default function FooterClient({ footerLinks, globalSettings }: { footerLinks: FooterLinks, globalSettings: any }) {
    return (
        <footer className="bg-black text-white">
            {/* Newsletter Bar */}
            <div className="border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div>
                            <h3 className="font-heading text-3xl md:text-4xl text-white mb-2">
                                Stay Ahead with AI
                            </h3>
                            <p className="text-white/50 text-sm max-w-md">
                                Get weekly AI tool reviews, comparisons & tutorials delivered to
                                your inbox.
                            </p>
                        </div>
                        <form className="flex flex-col sm:flex-row w-full max-w-md gap-3">
                            <input
                                type="email"
                                placeholder="your@email.com"
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-white/30 focus:outline-none transition-colors text-sm"
                            />
                            <button
                                type="submit"
                                className="px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-gray-100 transition-all duration-300 w-full sm:w-auto"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-4 lg:mb-0">
                        <Link href="/" className="flex items-center gap-3 mb-4">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={globalSettings?.logoUrl || '/images/logo.png'}
                                alt={globalSettings?.siteName || 'HyzenPro'}
                                className="w-10 h-10 object-contain"
                            />
                            <span className="font-heading text-xl tracking-wider text-white uppercase">
                                {globalSettings?.siteName || 'HYZENPRO'}
                            </span>
                        </Link>
                        <p className="text-white/40 text-sm leading-relaxed mb-6">
                            The premier AI tools directory helping creators, developers, and
                            businesses discover the best AI tools.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h4 className="font-heading text-lg tracking-wider text-white mb-4">
                                {title}
                            </h4>
                            <ul className="space-y-2.5">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-white/40 hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-xs">
                        © {new Date().getFullYear()} {globalSettings?.siteName || 'HyzenPro'}. All rights reserved.
                    </p>
                    <p className="text-white/20 text-xs">
                        Made with ❤️ for the AI community
                    </p>
                </div>
            </div>
        </footer>
    );
}
