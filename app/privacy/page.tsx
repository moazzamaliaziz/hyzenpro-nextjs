import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata = {
    title: 'Privacy Policy | HyzenPro',
    description: 'HyzenPro Privacy Policy - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Privacy Policy' }]} className="mb-8" />

                    <div className="text-center mb-12">
                        <h1 className="font-heading text-5xl md:text-6xl text-black mb-4">Privacy Policy</h1>
                        <p className="text-gray-400 text-sm">Last updated: January 2024</p>
                    </div>

                    <article className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-black prose-p:text-gray-600 prose-p:leading-relaxed">
                        <h2>1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you subscribe to our newsletter,
                            contact us, or interact with our services. This may include your name, email address, and any
                            messages you send us.
                        </p>

                        <h2>2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect to provide, maintain, and improve our services, send you
                            newsletters and updates (if subscribed), respond to your comments and questions, and analyze
                            how users interact with our website.
                        </p>

                        <h2>3. Cookies and Tracking</h2>
                        <p>
                            We use cookies and similar tracking technologies to track activity on our website and hold
                            certain information. You can instruct your browser to refuse all cookies or indicate when a
                            cookie is being sent.
                        </p>

                        <h2>4. Third-Party Services</h2>
                        <p>
                            We use third-party services like Google Analytics and Google AdSense that may collect
                            information about your visits to our website. These services have their own privacy policies.
                        </p>

                        <h2>5. Data Security</h2>
                        <p>
                            We take reasonable measures to help protect your personal information from loss, theft,
                            misuse, unauthorized access, disclosure, alteration, and destruction.
                        </p>

                        <h2>6. Your Rights</h2>
                        <p>
                            You have the right to access, update, or delete your personal information. You can
                            unsubscribe from our newsletter at any time by clicking the unsubscribe link in our emails.
                        </p>

                        <h2>7. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at privacy@hyzenpro.com.
                        </p>
                    </article>
                </div>
            </main>
            <Footer />
        </>
    );
}
