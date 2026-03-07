import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
    title: 'About Us',
    description: 'Learn about HyzenPro, the premier AI tools directory helping creators, developers, and businesses discover the best AI tools.',
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'About Us' }]} className="mb-8" />

                    <h1 className="font-heading text-5xl md:text-6xl text-black mb-8">About HyzenPro</h1>

                    <div className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-black prose-a:text-black prose-a:font-semibold prose-p:text-gray-600 prose-li:text-gray-600 prose-strong:text-gray-800">
                        <p>
                            HyzenPro was created to cut through the noise in the AI world. With thousands of tools launching every year, it's easy to feel lost. We provide clear, honest reviews and tutorials to help creators, startups, and businesses make the right AI choices.
                        </p>

                        <h2>Our Mission</h2>
                        <p>
                            Make AI accessible, practical, and understandable for everyone.
                        </p>

                        <h2>What We Cover</h2>
                        <ul>
                            <li><strong>AI Tool Reviews:</strong> In-depth, hands-on testing of the latest tools.</li>
                            <li><strong>Tool Comparisons:</strong> Side-by-side analysis of top competitors.</li>
                            <li><strong>Tutorials:</strong> Step-by-step guides on how to use AI tools effectively.</li>
                            <li><strong>AI Use Cases:</strong> Real-world applications for various industries.</li>
                        </ul>

                        <h2>Why Trust Us?</h2>
                        <p>
                            Every tool featured on HyzenPro undergoes rigorous testing. We don&apos;t just list features; we evaluate usability, pricing, and real-world performance to ensure you get the most accurate information.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
