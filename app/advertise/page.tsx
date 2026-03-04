import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterBox from '@/components/marketing/NewsletterBox';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Advertise With Us | HyzenPro',
    description: 'Partner with HyzenPro to reach thousands of AI enthusiasts, developers, and businesses. Explore our advertising and sponsorship opportunities.',
    openGraph: {
        title: 'Advertise With Us | HyzenPro',
        description: 'Partner with HyzenPro to reach AI enthusiasts worldwide',
        type: 'website',
    },
};

export default function AdvertisePage() {
    return (
        <div className="dark-bg">
            <Header />

            <main className="pt-24">
                {/* Hero */}
                <section className="section bg-black text-white text-center">
                    <div className="container max-w-4xl">
                        <span className="section-tag text-gray-400">PARTNERSHIPS</span>
                        <h1 className="heading-lg mb-6">
                            ADVERTISE
                            <span className="block text-gray-500">WITH HYZENPRO</span>
                        </h1>
                        <p className="section-description text-gray-400">
                            Reach thousands of AI enthusiasts, developers, and businesses actively looking for the best AI tools.
                        </p>
                    </div>
                </section>

                {/* Stats */}
                <section className="py-16 bg-white">
                    <div className="container">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            <div>
                                <div className="font-heading text-5xl text-black mb-2">50K+</div>
                                <div className="text-gray-600">Monthly Visitors</div>
                            </div>
                            <div>
                                <div className="font-heading text-5xl text-black mb-2">200+</div>
                                <div className="text-gray-600">AI Tools Listed</div>
                            </div>
                            <div>
                                <div className="font-heading text-5xl text-black mb-2">85%</div>
                                <div className="text-gray-600">Tech Decision Makers</div>
                            </div>
                            <div>
                                <div className="font-heading text-5xl text-black mb-2">4.8★</div>
                                <div className="text-gray-600">User Satisfaction</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Advertising Options */}
                <section className="section bg-[#f5f5f5]">
                    <div className="container max-w-6xl">
                        <h2 className="font-heading text-4xl text-black text-center mb-12">ADVERTISING OPTIONS</h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Featured Listing */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm">
                                <div className="text-4xl mb-4">⭐</div>
                                <h3 className="font-heading text-2xl text-black mb-2">Featured Listing</h3>
                                <div className="text-3xl font-bold text-black mb-4">$199<span className="text-lg font-normal text-gray-500">/month</span></div>
                                <ul className="space-y-3 mb-6 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Priority placement in category
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        "Featured" badge on listing
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Homepage showcase
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Enhanced tool profile
                                    </li>
                                </ul>
                                <a href="mailto:advertise@hyzenpro.com?subject=Featured Listing Inquiry" className="block text-center btn-dark">
                                    Get Started
                                </a>
                            </div>

                            {/* Sponsored Review */}
                            <div className="bg-black rounded-2xl p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-white text-black text-xs font-bold px-4 py-1">POPULAR</div>
                                <div className="text-4xl mb-4">📝</div>
                                <h3 className="font-heading text-2xl mb-2">Sponsored Review</h3>
                                <div className="text-3xl font-bold mb-4">$499<span className="text-lg font-normal text-gray-400">/article</span></div>
                                <ul className="space-y-3 mb-6 text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        In-depth review article
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        SEO optimized content
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        Social media promotion
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        Newsletter feature
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400">✓</span>
                                        Permanent backlink
                                    </li>
                                </ul>
                                <a href="mailto:advertise@hyzenpro.com?subject=Sponsored Review Inquiry" className="block text-center btn-primary">
                                    Get Started
                                </a>
                            </div>

                            {/* Banner Ads */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm">
                                <div className="text-4xl mb-4">🎯</div>
                                <h3 className="font-heading text-2xl text-black mb-2">Banner Advertising</h3>
                                <div className="text-3xl font-bold text-black mb-4">$99<span className="text-lg font-normal text-gray-500">/week</span></div>
                                <ul className="space-y-3 mb-6 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Site-wide banner display
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Multiple banner sizes
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Click tracking & analytics
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-500">✓</span>
                                        Targeted placement options
                                    </li>
                                </ul>
                                <a href="mailto:advertise@hyzenpro.com?subject=Banner Advertising Inquiry" className="block text-center btn-dark">
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Partner */}
                <section className="section bg-white">
                    <div className="container max-w-4xl">
                        <h2 className="font-heading text-4xl text-black text-center mb-12">WHY PARTNER WITH US</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="flex gap-4">
                                <div className="text-3xl">🎯</div>
                                <div>
                                    <h3 className="font-heading text-xl text-black mb-2">Targeted Audience</h3>
                                    <p className="text-gray-600">Reach tech-savvy professionals actively searching for AI solutions</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-3xl">📈</div>
                                <div>
                                    <h3 className="font-heading text-xl text-black mb-2">High Intent Traffic</h3>
                                    <p className="text-gray-600">Our visitors are looking to discover and adopt new AI tools</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-3xl">💎</div>
                                <div>
                                    <h3 className="font-heading text-xl text-black mb-2">Quality Content</h3>
                                    <p className="text-gray-600">Your brand appears alongside our trusted, expert reviews</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="text-3xl">🤝</div>
                                <div>
                                    <h3 className="font-heading text-xl text-black mb-2">Flexible Options</h3>
                                    <p className="text-gray-600">Custom packages available to match your marketing goals</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact CTA */}
                <section className="section bg-black text-white text-center">
                    <div className="container max-w-3xl">
                        <h2 className="font-heading text-4xl mb-6">READY TO GROW?</h2>
                        <p className="text-gray-400 mb-8">Contact us to discuss custom advertising packages tailored to your needs.</p>
                        <a href="mailto:advertise@hyzenpro.com" className="btn-primary inline-block">
                            Contact Us: advertise@hyzenpro.com
                        </a>
                    </div>
                </section>

                {/* Newsletter */}
                <section className="py-16 bg-[#f5f5f5]">
                    <div className="container max-w-xl">
                        <NewsletterBox variant="card" />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
