import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | HyzenPro',
    description: 'Learn about HyzenPro — your trusted AI tools directory providing expert reviews, comparisons, and practical guidance.',
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                {/* Hero */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'About' }]} className="mb-8" />

                    <div className="text-center mb-16">
                        <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">About Us</span>
                        <h1 className="font-heading text-5xl md:text-7xl text-black mb-4">Your Trusted AI Resource</h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            HyzenPro is your go-to destination for discovering the best AI tools. We provide expert reviews, detailed comparisons, and practical guidance.
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <section className="py-12 bg-gray-50 border-y border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                            {[
                                { number: '500+', label: 'Tools Reviewed' },
                                { number: '50K+', label: 'Monthly Readers' },
                                { number: '100+', label: 'Comparisons' },
                                { number: '4.8★', label: 'Average Rating' },
                            ].map((stat) => (
                                <div key={stat.label}>
                                    <div className="font-heading text-4xl text-black mb-1">{stat.number}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Mission */}
                <section className="py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">Our Mission</span>
                        <h2 className="font-heading text-4xl text-black mb-6">Helping You Navigate the AI Landscape</h2>
                        <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
                            With hundreds of AI tools launching every month, it can be overwhelming to find the right one for your needs. Our mission is to cut through the noise and provide you with honest, detailed reviews that help you make informed decisions. We test each tool extensively so you don&apos;t have to.
                        </p>
                    </div>
                </section>

                {/* Values */}
                <section className="py-16 bg-gray-50 border-y border-gray-100">
                    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">Our Values</span>
                            <h2 className="font-heading text-4xl text-black">What We Stand For</h2>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { icon: '🎯', title: 'Honest Reviews', description: 'We provide unbiased, in-depth reviews based on real testing and practical usage.' },
                                { icon: '🔬', title: 'Thorough Testing', description: 'Every tool we review is tested extensively before we publish our findings.' },
                                { icon: '💡', title: 'User-First', description: 'Our recommendations are based on what works best for real users like you.' },
                                { icon: '🚀', title: 'Stay Updated', description: 'We continuously update our reviews as AI tools evolve and improve.' },
                            ].map((value) => (
                                <div key={value.title} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                                    <div className="text-3xl mb-4">{value.icon}</div>
                                    <h3 className="font-heading text-xl text-black mb-2">{value.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-16 text-center">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-heading text-4xl text-black mb-4">Ready to Find Your Perfect AI Tool?</h2>
                        <p className="text-gray-500 mb-8">Browse our comprehensive directory and read in-depth reviews.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/ai-tools-directory/" className="px-8 py-4 bg-black text-white font-bold uppercase tracking-wider text-sm rounded-full hover:bg-gray-800 transition-colors">
                                Browse AI Tools
                            </Link>
                            <Link href="/contact/" className="px-8 py-4 bg-transparent border-2 border-gray-200 text-black font-bold uppercase tracking-wider text-sm rounded-full hover:border-black transition-colors">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
