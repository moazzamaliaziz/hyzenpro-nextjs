import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata = {
    title: 'Terms of Service | HyzenPro',
    description: 'HyzenPro Terms of Service - Terms and conditions for using our website.',
};

export default function TermsPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Terms of Service' }]} className="mb-8" />

                    <div className="text-center mb-12">
                        <h1 className="font-heading text-5xl md:text-6xl text-black mb-4">Terms of Service</h1>
                        <p className="text-gray-400 text-sm">Last updated: January 2024</p>
                    </div>

                    <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-black prose-p:text-gray-600 prose-p:leading-relaxed">
                        <h2>1. Acceptance of Terms</h2>
                        <p>By accessing and using HyzenPro, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website.</p>

                        <h2>2. Use of Our Service</h2>
                        <p>You may use our website for lawful purposes only. You must not use our website in any way that causes damage to the website or impairs the availability or accessibility of the website.</p>

                        <h2>3. Intellectual Property</h2>
                        <p>All content on HyzenPro, including text, graphics, logos, and images, is the property of HyzenPro and is protected by copyright laws. You may not reproduce, distribute, or create derivative works without our prior written consent.</p>

                        <h2>4. Disclaimer</h2>
                        <p>Our reviews and recommendations are based on our own testing and research. We do not guarantee that any AI tool will meet your specific needs. Always conduct your own research before making decisions.</p>

                        <h2>5. Affiliate Disclosure</h2>
                        <p>Some links on our website may be affiliate links. This means we may earn a commission if you click on a link and make a purchase. This does not affect our editorial integrity or the honesty of our reviews.</p>

                        <h2>6. Limitation of Liability</h2>
                        <p>HyzenPro shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our website or services.</p>

                        <h2>7. Changes to Terms</h2>
                        <p>We reserve the right to modify these terms at any time. Your continued use of the website after any changes constitutes acceptance of the new terms.</p>

                        <h2>8. Contact</h2>
                        <p>For any questions regarding these Terms of Service, please contact us at legal@hyzenpro.com.</p>
                    </article>
                </div>
            </main>
            <Footer />
        </>
    );
}
