import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for HyzenPro. Learn how we collect, use, and protect your data.',
};

export default function PrivacyPolicyPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Privacy Policy' }]} className="mb-8" />

                    <h1 className="font-heading text-5xl md:text-6xl text-black mb-8">Privacy Policy</h1>

                    <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-black prose-a:text-black prose-a:font-semibold prose-p:text-gray-600 prose-li:text-gray-600">
                        <p className="text-sm text-gray-400">Last Updated: March 2026</p>

                        <p>At HyzenPro, accessible from hyzenpro.com, one of our main priorities is the privacy of our visitors.</p>

                        <h2>Consent</h2>
                        <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>

                        <h2>Information we collect</h2>
                        <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>
                        <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message, and any other information you may choose to provide.</p>

                        <h2>Log Files</h2>
                        <p>HyzenPro follows a standard procedure of using log files. These are not linked to any information that is personally identifiable.</p>

                        <h2>Cookies and Web Beacons</h2>
                        <p>Like any other website, HyzenPro uses &quot;cookies&quot;. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited.</p>

                        <h2>Google DoubleClick DART Cookie</h2>
                        <p>Google is one of a third-party vendor on our site. Visitors may choose to decline the use of DART cookies by visiting the <a href="https://policies.google.com/technologies/ads">Google ad and content network Privacy Policy</a>.</p>

                        <h2>Third Party Privacy Policies</h2>
                        <p>HyzenPro&apos;s Privacy Policy does not apply to other advertisers or websites. We advise you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.</p>

                        <h2>Contact Us</h2>
                        <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="/contact/">our contact page</a>.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
