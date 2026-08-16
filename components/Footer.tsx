import Link from 'next/link';

const footerLinks = {
    quickLinks: [
        { href: '/', label: 'Home' },
        { href: '/ai-tools-directory', label: 'AI Tools Directory' },
        { href: '/blog', label: 'Blog' },
        { href: '/about-us', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
    ],
    categories: [
        { href: '/ai-tools-directory/ai-writing-tools', label: 'AI Writing Tools' },
        { href: '/ai-tools-directory/ai-image-tools', label: 'AI Image Tools' },
        { href: '/ai-tools-directory/ai-coding-tools', label: 'AI Coding Tools' },
        { href: '/ai-tools-directory/ai-video-tools', label: 'AI Video Tools' },
        { href: '/ai-tools-directory/ai-automation-tools', label: 'AI Automation Tools' },
    ],
    legal: [
        { href: '/privacy-policy', label: 'Privacy Policy' },
        { href: '/terms-of-service', label: 'Terms of Service' },
        { href: '/how-we-test', label: 'How We Test' },
        { href: '/submit-ai-tool', label: 'Submit AI Tool' },
        { href: '/advertise', label: 'Advertise' },
    ],
    social: [
        { href: 'https://twitter.com/hyzenpro', label: 'Twitter', icon: 'X' },
        { href: 'https://linkedin.com/company/hyzenpro', label: 'LinkedIn', icon: 'in' },
        { href: 'https://youtube.com/@hyzenpro', label: 'YouTube', icon: '▶' },
    ],
};

export default function Footer() {
    return (
        <footer className="bg-black border-t border-white/10">
            {/* Main Footer */}
            <div className="container py-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-2">
                        <Link href="/">
                            <img
                                src="/images/logo.png"
                                alt="HyzenPro"
                                className="h-10 mb-4"
                                loading="lazy"
                                width={160}
                                height={40}
                            />
                        </Link>
                        <p className="text-sm text-white/40 mb-5 italic font-serif">Independent. Honest. Refreshed monthly.</p>
                        <p className="text-gray-300 leading-relaxed max-w-sm mb-6">
                            Your trusted AI resource. Expert-tested reviews and comparisons to help you find
                            the perfect AI tools for writing, coding, video, and more.
                        </p>

                        {/* Newsletter Mini */}
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                aria-label="Email address for newsletter"
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-white/30 focus:outline-none transition-colors"
                            />
                            <button className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading text-xl text-white mb-6 tracking-wider">QUICK LINKS</h4>
                        <ul className="space-y-4">
                            {footerLinks.quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h4 className="font-heading text-xl text-white mb-6 tracking-wider">CATEGORIES</h4>
                        <ul className="space-y-4">
                            {footerLinks.categories.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal & Social */}
                    <div>
                        <h4 className="font-heading text-xl text-white mb-6 tracking-wider">LEGAL</h4>
                        <ul className="space-y-4 mb-8">
                            {footerLinks.legal.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-gray-400 hover:text-white transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Social Icons */}
                        <div className="flex gap-3">
                            {footerLinks.social.map((social) => (
                                <a
                                    key={social.href}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white hover:scale-110 transition-all"
                                    aria-label={social.label}
                                >
                                    <span className="text-sm font-bold">{social.icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-sm">
                        &copy; {new Date().getFullYear()} HyzenPro. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <span>Made with love for the AI community</span>
                        <span className="text-gray-700">&bull;</span>
                        <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy</a>
                        <span className="text-gray-700">&bull;</span>
                        <a href="/terms-of-service" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
