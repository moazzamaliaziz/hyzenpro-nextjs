import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How We Test AI Tools | Our Review Methodology | HyzenPro',
    description: 'Learn about our rigorous testing methodology for AI tools. We use hands-on testing, expert evaluation, and real-world scenarios to provide honest reviews.',
};

export default function HowWeTestPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                {/* Hero */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'How We Test' }]} className="mb-8" />

                    <div className="text-center mb-16">
                        <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold mb-3">E-E-A-T Methodology</span>
                        <h1 className="font-heading text-5xl md:text-7xl text-black mb-4">How We Test AI Tools</h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Our rigorous testing methodology ensures you get honest, accurate, and helpful reviews based on real experience.
                        </p>
                    </div>
                </div>

                {/* Testing Process */}
                <section className="py-16 bg-gray-50 border-y border-gray-100">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-heading text-4xl text-black text-center mb-12">Our Testing Process</h2>

                        <div className="space-y-10">
                            {[
                                { step: '1', title: 'Hands-on Testing', desc: 'We don\'t just read the marketing copy – we actually use each tool. Our team spends hours exploring features, testing edge cases, and evaluating real-world performance.' },
                                { step: '2', title: 'Feature Analysis', desc: 'We document every feature, noting strengths and limitations. We compare promised features against actual functionality and evaluate the quality of output or results.' },
                                { step: '3', title: 'Pricing Evaluation', desc: 'We analyze pricing models to determine value for money. We consider free tiers, trial periods, subscription costs, and compare pricing against competitors.' },
                                { step: '4', title: 'User Experience Assessment', desc: 'We evaluate the overall user experience including interface design, learning curve, documentation quality, and customer support responsiveness.' },
                                { step: '5', title: 'Honest Scoring', desc: 'We compile our findings into a balanced score that reflects the tool\'s overall value. We highlight both pros and cons, helping you understand exactly what you\'re getting.' },
                            ].map((item) => (
                                <div key={item.step} className="flex gap-6">
                                    <div className="flex-shrink-0 w-14 h-14 bg-black text-white rounded-xl flex items-center justify-center font-heading text-2xl">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-2xl text-black mb-2">{item.title}</h3>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Our Commitment */}
                <section className="py-16">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="font-heading text-4xl text-black text-center mb-12">Our Commitment to You</h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-green-50 border border-green-100 rounded-xl">
                                <h3 className="font-heading text-xl text-green-700 mb-3">✓ Independence</h3>
                                <p className="text-gray-600 text-sm">Our rankings are not influenced by sponsorships or affiliate relationships. We always prioritize reader value.</p>
                            </div>
                            <div className="p-6 bg-gray-100 dark:bg-gray-900 border border-blue-100 rounded-xl">
                                <h3 className="font-heading text-xl text-black dark:text-white mb-3">✓ Transparency</h3>
                                <p className="text-gray-600 text-sm">We clearly disclose affiliate links and sponsored content. You always know when we may earn a commission.</p>
                            </div>
                            <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl">
                                <h3 className="font-heading text-xl text-purple-700 mb-3">✓ Regular Updates</h3>
                                <p className="text-gray-600 text-sm">AI tools evolve rapidly. We regularly re-test and update our reviews to ensure accuracy.</p>
                            </div>
                            <div className="p-6 bg-amber-50 border border-amber-100 rounded-xl">
                                <h3 className="font-heading text-xl text-amber-700 mb-3">✓ Expert Team</h3>
                                <p className="text-gray-600 text-sm">Our reviewers are experienced professionals with backgrounds in AI, software development, and content creation.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
