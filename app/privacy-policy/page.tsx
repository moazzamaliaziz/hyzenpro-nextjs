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

                    <h1 className="font-heading text-5xl md:text-6xl text-white mb-8">Privacy Policy</h1>

                    <div className="prose prose-invert prose-lg max-w-none prose-headings:font-heading prose-headings:text-white prose-a:text-accent">
                        <p className="text-sm text-white/40">Last Updated: March 2026</p>

                        <p>
                            At HyzenPro, accessible from hyzenpro.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by HyzenPro and how we use it.
                        </p>

                        <h2>Consent</h2>
                        <p>
                            By using our website, you hereby consent to our Privacy Policy and agree to its terms.
                        </p>

                        <h2>Information we collect</h2>
                        <p>
                            The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
                        </p>
                        <p>
                            If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.
                        </p>
                        <p>
                            When you submit an AI tool to our directory, we ask for your contact information, including items such as your name and email address.
                        </p>

                        <h2>Log Files</h2>
                        <p>
                            HyzenPro follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
                        </p>

                        <h2>Cookies and Web Beacons</h2>
                        <p>
                            Like any other website, HyzenPro uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
                        </p>

                        <h2>Google DoubleClick DART Cookie</h2>
                        <p>
                            Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads">https://policies.google.com/technologies/ads</a>
                        </p>

                        <h2>Third Party Privacy Policies</h2>
                        <p>
                            HyzenPro's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
                        </p>

                        <h2>Contact Us</h2>
                        <p>
                            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <a href="/contact/">our contact page</a>.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
