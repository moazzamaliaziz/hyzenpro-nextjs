import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with the HyzenPro team for inquiries, partnerships, or support.',
};

export default function ContactPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Contact' }]} className="mb-8" />

                    <h1 className="font-heading text-5xl md:text-6xl text-black mb-8">Contact Us</h1>

                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
                        <p className="text-gray-600 mb-8">
                            Have a question, suggestion, or partnership inquiry? Fill out the form below and we'll get back to you as soon as possible.
                        </p>

                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                    <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:border-black focus:outline-none transition-colors placeholder-gray-400" placeholder="Your name" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input type="email" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:border-black focus:outline-none transition-colors placeholder-gray-400" placeholder="your@email.com" required />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <input type="text" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:border-black focus:outline-none transition-colors placeholder-gray-400" placeholder="How can we help?" required />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <textarea rows={6} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-black focus:border-black focus:outline-none transition-colors resize-none placeholder-gray-400" placeholder="Your message..." required></textarea>
                            </div>

                            <button type="submit" className="w-full px-8 py-4 bg-black text-white font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-all">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
