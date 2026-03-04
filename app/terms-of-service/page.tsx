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

                    <h1 className="font-heading text-5xl md:text-6xl text-white mb-8">Terms of Service</h1>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:text-white prose-a:text-accent">
                        <p className="text-sm text-white/40">Last Updated: March 2026</p>

                        <p>
                            Welcome to HyzenPro! By accessing this website, we assume you accept these terms and conditions. Do not continue to use HyzenPro if you do not agree to take all of the terms and conditions stated on this page.
                        </p>

                        <h2>License</h2>
                        <p>
                            Unless otherwise stated, HyzenPro and/or its licensors own the intellectual property rights for all material on HyzenPro. All intellectual property rights are reserved. You may access this from HyzenPro for your own personal use subjected to restrictions set in these terms and conditions.
                        </p>
                        <p>You must not:</p>
                        <ul>
                            <li>Republish material from HyzenPro</li>
                            <li>Sell, rent or sub-license material from HyzenPro</li>
                            <li>Reproduce, duplicate or copy material from HyzenPro</li>
                            <li>Redistribute content from HyzenPro</li>
                        </ul>

                        <h2>User Comments</h2>
                        <p>
                            Parts of this website offer an opportunity for users to post and exchange opinions and information in certain areas of the website. HyzenPro does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of HyzenPro, its agents and/or affiliates. Comments reflect the views and opinions of the person who post their views and opinions. To the extent permitted by applicable laws, HyzenPro shall not be liable for the Comments or for any liability, damages or expenses caused and/or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.
                        </p>

                        <h2>Hyperlinking to our Content</h2>
                        <p>
                            The following organizations may link to our Website without prior written approval:
                        </p>
                        <ul>
                            <li>Government agencies;</li>
                            <li>Search engines;</li>
                            <li>News organizations;</li>
                            <li>Online directory distributors may link to our Website in the same manner as they hyperlink to the Websites of other listed businesses; and</li>
                            <li>System wide Accredited Businesses except soliciting non-profit organizations, charity shopping malls, and charity fundraising groups which may not hyperlink to our Web site.</li>
                        </ul>

                        <h2>Disclaimer</h2>
                        <p>
                            To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website. The information about AI tools provided on HyzenPro is for general informational purposes only and is subject to change. We do not guarantee the accuracy, completeness, or usefulness of this information. Any reliance you place on such information is strictly at your own risk.
                        </p>

                        <h2>Changes to Terms</h2>
                        <p>
                            We reserve the right to revise these terms and conditions at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms and conditions.
                        </p>

                        <h2>Contact Information</h2>
                        <p>
                            If you have any queries regarding any of our terms, please <a href="/contact/">contact us</a>.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
