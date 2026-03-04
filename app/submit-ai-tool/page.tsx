import type { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export const metadata: Metadata = {
    title: 'Submit AI Tool',
    description: 'Submit your AI tool to be featured in the HyzenPro directory and reach thousands of AI professionals.',
};

export default function SubmitToolPage() {
    return (
        <>
            <Header />
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Submit Tool' }]} className="mb-8" />

                    <div className="text-center mb-12">
                        <h1 className="font-heading text-5xl md:text-6xl text-white mb-4">Submit Your AI Tool</h1>
                        <p className="text-white/60 text-lg">
                            Reach thousands of creators, developers, and businesses by featuring your tool on HyzenPro.
                        </p>
                    </div>

                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-purple-500" />

                        <form className="space-y-6">
                            <div>
                                <h3 className="text-xl font-heading text-white mb-4 border-b border-white/[0.06] pb-2">Tool Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">Tool Name *</label>
                                        <input type="text" className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">Website URL *</label>
                                        <input type="url" className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none" placeholder="https://" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">Short Description *</label>
                                        <input type="text" className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none" placeholder="1-2 sentences explaining what it does" maxLength={150} required />
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-2">Pricing Type *</label>
                                            <select className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none [&>option]:bg-gray-900" required>
                                                <option value="">Select Pricing</option>
                                                <option value="free">Free</option>
                                                <option value="freemium">Freemium</option>
                                                <option value="paid">Paid</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-white/80 mb-2">Category *</label>
                                            <select className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none [&>option]:bg-gray-900" required>
                                                <option value="">Select Category</option>
                                                <option value="ai-video-tools">Video Tools</option>
                                                <option value="ai-image-tools">Image Tools</option>
                                                <option value="ai-writing-tools">Writing Tools</option>
                                                <option value="ai-coding-tools">Coding Tools</option>
                                                <option value="ai-automation-tools">Automation</option>
                                                <option value="ai-marketing-tools">Marketing</option>
                                                <option value="ai-general-tools">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <h3 className="text-xl font-heading text-white mb-4 border-b border-white/[0.06] pb-2">Your Contact Info</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">Your Name *</label>
                                        <input type="text" className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-white/80 mb-2">Your Email *</label>
                                        <input type="email" className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white focus:border-accent/50 focus:outline-none" required />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full px-8 py-4 bg-accent text-white font-bold uppercase tracking-widest rounded-xl hover:bg-accent/80 transition-all">
                                    Submit Tool for Approval
                                </button>
                                <p className="text-center text-xs text-white/30 mt-4">
                                    We review all submissions within 2-3 business days.
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
