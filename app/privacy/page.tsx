import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
    title: 'Privacy Policy | HyzenPro',
    description: 'HyzenPro Privacy Policy - Learn how we collect, use, and protect your data.',
};

export default function PrivacyPage() {
    return (
        <div className="dark-bg">
            <Header />

            <main className="pt-24">
                {/* Hero */}
                <section className="section bg-black text-white text-center">
                    <div className="container">
                        <p className="section-tag text-gray-400">Legal</p>
                        <h1 className="font-heading text-5xl md:text-7xl mb-6">
                            PRIVACY<br />
                            <span className="text-transparent" style={{ WebkitTextStroke: '2px white' }}>
                                POLICY
                            </span>
                        </h1>
                        <p className="text-gray-400">Last updated: January 2024</p>
                    </div>
                </section>

                {/* Content */}
                <section className="section bg-white">
                    <div className="container max-w-4xl">
                        <article className="prose prose-lg max-w-none">
                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">1. Information We Collect</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                We collect information you provide directly to us, such as when you subscribe to our newsletter,
                                contact us, or interact with our services. This may include your name, email address, and any
                                messages you send us.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                We use the information we collect to provide, maintain, and improve our services, send you
                                newsletters and updates (if subscribed), respond to your comments and questions, and analyze
                                how users interact with our website.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">3. Cookies and Tracking</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                We use cookies and similar tracking technologies to track activity on our website and hold
                                certain information. You can instruct your browser to refuse all cookies or indicate when a
                                cookie is being sent.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">4. Third-Party Services</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                We use third-party services like Google Analytics and Google AdSense that may collect
                                information about your visits to our website. These services have their own privacy policies.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">5. Data Security</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                We take reasonable measures to help protect your personal information from loss, theft,
                                misuse, unauthorized access, disclosure, alteration, and destruction.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">6. Your Rights</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                You have the right to access, update, or delete your personal information. You can
                                unsubscribe from our newsletter at any time by clicking the unsubscribe link in our emails.
                            </p>

                            <h2 className="font-heading text-3xl text-black mt-8 mb-4">7. Contact Us</h2>
                            <p className="text-gray-700 leading-relaxed mb-6">
                                If you have any questions about this Privacy Policy, please contact us at privacy@hyzenpro.com.
                            </p>
                        </article>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
