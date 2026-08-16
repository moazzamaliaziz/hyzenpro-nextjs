import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Advertise on HyzenPro | Reach AI Tool Buyers',
    description:
        'Partner with HyzenPro to reach creators, marketers, and developers actively researching AI tools. Sponsored listings, reviews, and newsletter placements.',
    alternates: {
        canonical: 'https://hyzenpro.com/advertise/',
    },
    openGraph: {
        title: 'Advertise on HyzenPro | Reach AI Tool Buyers',
        description:
            'Partner with HyzenPro to reach creators, marketers, and developers actively researching AI tools.',
        url: 'https://hyzenpro.com/advertise/',
        siteName: 'HyzenPro',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Advertise on HyzenPro | Reach AI Tool Buyers',
        description:
            'Partner with HyzenPro to reach creators, marketers, and developers actively researching AI tools.',
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function AdvertisePage() {
    return (
        <>
            <main className="pt-28 pb-20 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'Advertise', href: '/advertise/' }]} className="mb-8" />

                    <div className="text-center mb-16">
                        <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-3">Partnerships</span>
                        <h1 className="font-heading text-5xl md:text-7xl text-black mb-4">Advertise With HyzenPro</h1>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            Reach a focused audience of visitors actively researching AI tools, comparisons, and buying decisions.
                        </p>
                        <p className="text-gray-400 text-sm max-w-xl mx-auto mt-3">
                            Display advertising is clearly labeled and separate from editorial rankings. No tool ever pays for a better review score or placement.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                        {[
                            { value: 'Focused', label: 'Audience Fit' },
                            { value: 'Editorial', label: 'Review Context' },
                            { value: 'Sponsored', label: 'Placement Types' },
                            { value: 'Transparent', label: 'Disclosure' },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-6 bg-gray-50 border border-gray-100 rounded-3xl">
                                <div className="font-heading text-4xl text-black mb-1">{stat.value}</div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-16">
                        <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">*</div>
                            <h3 className="font-heading text-2xl text-black mb-2">Featured Listing</h3>
                            <div className="text-3xl font-bold text-black mb-4">$199<span className="text-lg font-normal text-gray-500">/month</span></div>
                            <ul className="space-y-3 mb-6 text-gray-600 text-sm">
                                <li>Priority placement in category</li>
                                <li>Featured badge on listing</li>
                                <li>Homepage showcase</li>
                                <li>Enhanced tool profile</li>
                            </ul>
                            <a href="mailto:advertise@hyzenpro.com?subject=Featured Listing Inquiry" className="block text-center px-6 py-3 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-gray-800 transition-colors">Get Started</a>
                        </div>

                        <div className="bg-black rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-white text-black text-[10px] font-bold uppercase tracking-wider px-4 py-1 rounded-bl-lg">Popular</div>
                            <div className="text-4xl mb-4">Doc</div>
                            <h3 className="font-heading text-2xl mb-2">Sponsored Review</h3>
                            <div className="text-3xl font-bold mb-4">$499<span className="text-lg font-normal text-gray-500">/article</span></div>
                            <ul className="space-y-3 mb-6 text-gray-300 text-sm">
                                <li>In-depth review article</li>
                                <li>SEO-optimized content</li>
                                <li>Sponsored label and disclosure</li>
                                <li>Newsletter consideration</li>
                                <li>Permanent backlink</li>
                            </ul>
                            <a href="mailto:advertise@hyzenpro.com?subject=Sponsored Review Inquiry" className="block text-center px-6 py-3 bg-white text-black font-bold text-sm uppercase tracking-wider rounded-full hover:bg-gray-100 transition-colors">Get Started</a>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-lg transition-shadow">
                            <div className="text-4xl mb-4">Ads</div>
                            <h3 className="font-heading text-2xl text-black mb-2">Banner Advertising</h3>
                            <div className="text-3xl font-bold text-black mb-4">$99<span className="text-lg font-normal text-gray-500">/week</span></div>
                            <ul className="space-y-3 mb-6 text-gray-600 text-sm">
                                <li>Site-wide banner display</li>
                                <li>Multiple banner sizes</li>
                                <li>Click tracking and analytics</li>
                                <li>Targeted placement options</li>
                            </ul>
                            <a href="mailto:advertise@hyzenpro.com?subject=Banner Advertising Inquiry" className="block text-center px-6 py-3 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-gray-800 transition-colors">Get Started</a>
                        </div>
                    </div>

                    <div className="text-center p-12 bg-gray-50 border border-gray-100 rounded-3xl">
                        <h2 className="font-heading text-3xl text-black mb-3">Need a custom placement?</h2>
                        <p className="text-gray-500 mb-6 text-sm">Contact us to discuss sponsor packages that fit your product and audience.</p>
                        <a href="mailto:advertise@hyzenpro.com" className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-wider rounded-full hover:bg-gray-800 transition-colors">
                            Contact Us
                        </a>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}
