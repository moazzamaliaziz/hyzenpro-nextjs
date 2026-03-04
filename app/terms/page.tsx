import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Terms of Service | HyzenPro',
    description: 'HyzenPro Terms of Service - Terms and conditions for using our website.',
};

export default function TermsPage() {
    return (
        <div className="dark-bg">
            <Header />

            <main className="pt-24">
                {/* Hero */}
                <section className="section bg-black text-white text-center">
                    <div className="container">
                        <p className="section-tag text-gray-400">Legal</p>
                        <h1 className="font-heading text-5xl md:text-7xl mb-6">
                            TERMS OF<br />
                            <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>
                                SERVICE
                            </span>
                        </h1>
                        <p className="text-gray-400">Last updated: January 2024</p>
                    </div>
                </section>

                {/* Content */}
                <section className="section bg-white">
                    <div className="container max-w-4xl">
                        <article className="prose prose-lg max-w-none">
                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                By accessing and using HyzenPro, you accept and agree to be bound by these Terms of Service.
                                If you do not agree to these terms, please do not use our website.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">2. Use of Our Service</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                You may use our website for lawful purposes only. You must not use our website in any way
                                that causes damage to the website or impairs the availability or accessibility of the website.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">3. Intellectual Property</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                All content on HyzenPro, including text, graphics, logos, and images, is the property of
                                HyzenPro and is protected by copyright laws. You may not reproduce, distribute, or create
                                derivative works without our prior written consent.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">4. Disclaimer</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                Our reviews and recommendations are based on our own testing and research. We do not guarantee
                                that any AI tool will meet your specific needs. Always conduct your own research before making
                                decisions.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">5. Affiliate Disclosure</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                Some links on our website may be affiliate links. This means we may earn a commission if you
                                click on a link and make a purchase. This does not affect our editorial integrity or the
                                honesty of our reviews.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">6. Limitation of Liability</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                HyzenPro shall not be liable for any indirect, incidental, special, consequential, or
                                punitive damages arising from your use of our website or services.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">7. Changes to Terms</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                We reserve the right to modify these terms at any time. Your continued use of the website
                                after any changes constitutes acceptance of the new terms.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">8. Contact</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                For any questions regarding these Terms of Service, please contact us at legal@hyzenpro.com.
                            </p>
                        </article>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
