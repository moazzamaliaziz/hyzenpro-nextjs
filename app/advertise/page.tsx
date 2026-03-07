import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Advertise With Us | HyzenPro',
    description: 'Partner with HyzenPro to reach thousands of AI enthusiasts, developers, and businesses. Explore our advertising and sponsorship opportunities.',
};

export default function AdvertisePage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Advertise' }]} className="mb-8" />

                    <div className="text-center mb-16">
                        <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">Partnerships</span>
                        <h1 className="font-heading text-5xl md:text-7xl text-black mb-4">Advertise With HyzenPro</h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Reach thousands of AI enthusiasts, developers, and businesses actively looking for the best AI tools.
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        {[
                            { value: '50K+', label: 'Monthly Visitors' },
                            { value: '200+', label: 'AI Tools Listed' },
                            { value: '85%', label: 'Tech Decision Makers' },
                            { value: '4.8★', label: 'User Satisfaction' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                                <div className="font-heading text-4xl text-black mb-1">{stat.value}</div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">⭐</div>
                            <h3 className="font-heading text-2xl text-black mb-2">Featured Listing</h3>
                            <div className="text-3xl font-bold text-black mb-4">$199<span className="text-lg font-normal text-gray-500">/month</span></div>
                            <ul className="space-y-3 mb-6 text-gray-600 text-sm">
                                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Priority placement in category</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> &quot;Featured&quot; badge on listing</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Homepage showcase</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Enhanced tool profile</li>
                            </ul>
                            <a href="mailto:advertise@hyzenpro.com?subject=Featured Listing Inquiry" className="block text-center px-6 py-3 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors">Get Started</a>
                        </div>

                        <div className="bg-black rounded-2xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-lg">Popular</div>
                            <div className="text-4xl mb-4">📝</div>
                            <h3 className="font-heading text-2xl mb-2">Sponsored Review</h3>
                            <div className="text-3xl font-bold mb-4">$499<span className="text-lg font-normal text-gray-400">/article</span></div>
                            <ul className="space-y-3 mb-6 text-gray-300 text-sm">
                                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> In-depth review article</li>
                                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> SEO optimized content</li>
                                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Social media promotion</li>
                                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Newsletter feature</li>
                                <li className="flex items-start gap-2"><span className="text-green-400">✓</span> Permanent backlink</li>
                            </ul>
                            <a href="mailto:advertise@hyzenpro.com?subject=Sponsored Review Inquiry" className="block text-center px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-gray-100 transition-colors">Get Started</a>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="font-heading text-2xl text-black mb-2">Banner Advertising</h3>
                            <div className="text-3xl font-bold text-black mb-4">$99<span className="text-lg font-normal text-gray-500">/week</span></div>
                            <ul className="space-y-3 mb-6 text-gray-600 text-sm">
                                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Site-wide banner display</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Multiple banner sizes</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Click tracking &amp; analytics</li>
                                <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Targeted placement options</li>
                            </ul>
                            <a href="mailto:advertise@hyzenpro.com?subject=Banner Advertising Inquiry" className="block text-center px-6 py-3 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors">Get Started</a>
                        </div>
                    </div>

                    {/* Contact CTA */}
                    <div className="text-center p-12 bg-gray-50 border border-gray-100 rounded-2xl">
                        <h2 className="font-heading text-3xl text-black mb-3">Ready to Grow?</h2>
                        <p className="text-gray-500 mb-6 text-sm">Contact us to discuss custom advertising packages tailored to your needs.</p>
                        <a href="mailto:advertise@hyzenpro.com" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors">
                            Contact Us
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
