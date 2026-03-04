import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TrustBadges from '@/components/eeat/TrustBadges';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How We Test AI Tools | Our Review Methodology | HyzenPro',
    description: 'Learn about our rigorous testing methodology for AI tools. We use hands-on testing, expert evaluation, and real-world scenarios to provide honest reviews.',
    openGraph: {
        title: 'How We Test AI Tools | HyzenPro',
        description: 'Our rigorous testing methodology ensures you get honest, accurate AI tool reviews.',
        type: 'website',
    },
};

export default function HowWeTestPage() {
    return (
        <div className="dark-bg">
            <Header />

            <main className="pt-24">
                {/* Hero */}
                <section className="section bg-black text-white text-center">
                    <div className="container max-w-4xl">
                        <span className="section-tag text-gray-400">E-E-A-T METHODOLOGY</span>
                        <h1 className="heading-lg mb-6">
                            HOW WE TEST
                            <span className="block text-gray-500">AI TOOLS</span>
                        </h1>
                        <p className="section-description text-gray-400">
                            Our rigorous testing methodology ensures you get honest, accurate, and helpful reviews based on real experience.
                        </p>
                    </div>
                </section>

                {/* Trust Badges */}
                <section className="py-12 bg-white">
                    <div className="container max-w-4xl">
                        <TrustBadges showMethodology={false} />
                    </div>
                </section>

                {/* Testing Process */}
                <section className="section bg-[#f5f5f5]">
                    <div className="container max-w-4xl">
                        <h2 className="font-heading text-4xl text-black text-center mb-12">OUR TESTING PROCESS</h2>

                        <div className="space-y-12">
                            {/* Step 1 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center font-heading text-2xl">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl text-black mb-2">Hands-on Testing</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        We don't just read the marketing copy – we actually use each tool. Our team spends hours exploring features, testing edge cases, and evaluating real-world performance. Every tool we review has been personally tested by our expert team.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center font-heading text-2xl">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl text-black mb-2">Feature Analysis</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        We document every feature, noting strengths and limitations. We compare promised features against actual functionality and evaluate the quality of output or results.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center font-heading text-2xl">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl text-black mb-2">Pricing Evaluation</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        We analyze pricing models to determine value for money. We consider free tiers, trial periods, subscription costs, and compare pricing against competitors to help you make informed decisions.
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center font-heading text-2xl">
                                    4
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl text-black mb-2">User Experience Assessment</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        We evaluate the overall user experience including interface design, learning curve, documentation quality, and customer support responsiveness. A powerful tool is only useful if you can actually use it.
                                    </p>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="flex gap-6">
                                <div className="flex-shrink-0 w-16 h-16 bg-black text-white rounded-xl flex items-center justify-center font-heading text-2xl">
                                    5
                                </div>
                                <div>
                                    <h3 className="font-heading text-2xl text-black mb-2">Honest Scoring</h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        We compile our findings into a balanced score that reflects the tool's overall value. We highlight both pros and cons, helping you understand exactly what you're getting before you commit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Our Commitment */}
                <section className="section bg-white">
                    <div className="container max-w-4xl">
                        <h2 className="font-heading text-4xl text-black text-center mb-12">OUR COMMITMENT TO YOU</h2>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 bg-green-50 border border-green-100 rounded-xl">
                                <h3 className="font-heading text-xl text-green-700 mb-3">✓ Independence</h3>
                                <p className="text-gray-600">Our rankings are not influenced by sponsorships or affiliate relationships. We always prioritize reader value.</p>
                            </div>
                            <div className="p-6 bg-blue-50 border border-blue-100 rounded-xl">
                                <h3 className="font-heading text-xl text-blue-700 mb-3">✓ Transparency</h3>
                                <p className="text-gray-600">We clearly disclose affiliate links and sponsored content. You always know when we may earn a commission.</p>
                            </div>
                            <div className="p-6 bg-purple-50 border border-purple-100 rounded-xl">
                                <h3 className="font-heading text-xl text-purple-700 mb-3">✓ Regular Updates</h3>
                                <p className="text-gray-600">AI tools evolve rapidly. We regularly re-test and update our reviews to ensure accuracy.</p>
                            </div>
                            <div className="p-6 bg-orange-50 border border-orange-100 rounded-xl">
                                <h3 className="font-heading text-xl text-orange-700 mb-3">✓ Expert Team</h3>
                                <p className="text-gray-600">Our reviewers are experienced professionals with backgrounds in AI, software development, and content creation.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="section bg-black text-white text-center">
                    <div className="container max-w-3xl">
                        <h2 className="font-heading text-4xl mb-6">READY TO FIND YOUR PERFECT AI TOOL?</h2>
                        <p className="text-gray-400 mb-8">Browse our curated directory of expert-reviewed AI tools.</p>
                        <a href="/ai-tools-directory" className="btn-primary inline-block">
                            Explore AI Tools Directory
                        </a>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
