import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for HyzenPro. Read our terms and conditions for using our website and services.',
};

export default function TermsOfServicePage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Terms of Service' }]} className="mb-8" />

                    <h1 className="font-heading text-5xl md:text-6xl text-black mb-8">Terms of Service</h1>

                    <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-black prose-a:text-black prose-a:font-semibold prose-p:text-gray-600 prose-li:text-gray-600">
                        <p className="text-sm text-gray-400">Last Updated: March 2026</p>

                        <p>Welcome to HyzenPro! By accessing this website, we assume you accept these terms and conditions. Do not continue to use HyzenPro if you do not agree to take all of the terms and conditions stated on this page.</p>

                        <h2>License</h2>
                        <p>Unless otherwise stated, HyzenPro and/or its licensors own the intellectual property rights for all material on HyzenPro. All intellectual property rights are reserved.</p>
                        <p>You must not:</p>
                        <ul>
                            <li>Republish material from HyzenPro</li>
                            <li>Sell, rent or sub-license material from HyzenPro</li>
                            <li>Reproduce, duplicate or copy material from HyzenPro</li>
                            <li>Redistribute content from HyzenPro</li>
                        </ul>

                        <h2>User Comments</h2>
                        <p>Parts of this website offer an opportunity for users to post and exchange opinions. HyzenPro does not filter, edit, publish or review Comments prior to their presence on the website.</p>

                        <h2>Hyperlinking to our Content</h2>
                        <p>The following organizations may link to our Website without prior written approval:</p>
                        <ul>
                            <li>Government agencies;</li>
                            <li>Search engines;</li>
                            <li>News organizations;</li>
                            <li>Online directory distributors;</li>
                        </ul>

                        <h2>Disclaimer</h2>
                        <p>The information about AI tools provided on HyzenPro is for general informational purposes only and is subject to change. We do not guarantee the accuracy, completeness, or usefulness of this information.</p>

                        <h2>Changes to Terms</h2>
                        <p>We reserve the right to revise these terms and conditions at any time without notice.</p>

                        <h2>Contact Information</h2>
                        <p>If you have any queries regarding any of our terms, please <a href="/contact/">contact us</a>.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
