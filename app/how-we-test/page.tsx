import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Metadata } from 'next';
import { getBaseUrl } from '@/lib/utils';
import { routing } from '@/i18n/routing';

export function generateMetadata(): Metadata {
    const baseUrl = getBaseUrl();
    const languages: Record<string, string> = {};
    for (const loc of routing.locales) {
        languages[loc] = loc === 'en' ? `${baseUrl}/how-we-test/` : `${baseUrl}/${loc}/how-we-test/`;
    }
    languages['x-default'] = `${baseUrl}/how-we-test/`;

    return {
        title: 'How We Test AI Tools | HyzenPro Review Methodology',
        description:
            'See how HyzenPro tests AI tools with hands-on workflows, category-specific scenarios, pricing checks, weighted scoring, and independent editorial standards.',
        alternates: {
            canonical: `${baseUrl}/how-we-test/`,
            languages,
        },
        openGraph: {
            title: 'How We Test AI Tools | HyzenPro Review Methodology',
            description:
                'Our AI tool review process is built around hands-on use, repeatable scenarios, transparent scoring, and clear limitations.',
            url: `${baseUrl}/how-we-test/`,
            siteName: 'HyzenPro',
            type: 'website',
        },
    };
}

const process = [
    {
        step: '01',
        title: 'Minimum 7 days of hands-on use',
        description:
            'Every tool we review is used across real work tasks before we publish. We do not write final verdicts from press releases, demo videos, or a quick look at the pricing page. For fast-moving tools, we also note when pricing or major features need to be checked again.',
    },
    {
        step: '02',
        title: 'Defined scenarios per category',
        description:
            'Each category has a fixed testing pattern. Writing tools are tested on long-form drafts, email copy, product descriptions, and revision quality. Video tools are tested on uploads, caption accuracy, export controls, templates, and watermark limits. Coding tools are tested on bug fixing, feature generation, code review, and error recovery.',
    },
    {
        step: '03',
        title: 'Pricing verified at publication',
        description:
            'AI tool pricing changes often, so we treat the official pricing page as the final source of truth. Reviews check free-tier limits, seat pricing, credits, export restrictions, cancellation friction, and the moment where a real user is likely to need a paid plan.',
    },
    {
        step: '04',
        title: 'Weighted scoring across 5 dimensions',
        description:
            'Scores are based on output quality, ease of use, pricing value, feature depth, and support or documentation quality. Output quality carries the most weight because a tool that produces weak results is not useful just because the interface is pleasant.',
    },
    {
        step: '05',
        title: 'Clear buyer-fit recommendations',
        description:
            'Every review should answer who the tool is best for, who should skip it, and which alternatives deserve a look. We surface deal-breaking limitations in the article instead of burying them under a generic pros-and-cons list.',
    },
];

const scoring = [
    ['Output quality', '40%', 'Accuracy, usefulness, consistency, and amount of cleanup required.'],
    ['Ease of use', '20%', 'Setup time, interface clarity, workflow speed, and learning curve.'],
    ['Pricing value', '20%', 'Free tier, paid-plan limits, upgrade pressure, and value versus alternatives.'],
    ['Feature depth', '10%', 'Breadth of useful features, integrations, exports, and collaboration controls.'],
    ['Support quality', '10%', 'Documentation, help resources, onboarding, and response quality where available.'],
];

const commitments = [
    {
        title: 'No paid rankings',
        description:
            'Affiliate relationships and sponsorships do not determine where tools rank. Sponsored placements are labeled separately and do not replace editorial recommendations.',
    },
    {
        title: 'Affiliate transparency',
        description:
            'Blog posts that may include affiliate links display a disclosure near the top of the article. Readers should know when HyzenPro may earn a commission.',
    },
    {
        title: 'Named reviewers',
        description:
            'Reviews and guides are connected to named human authors with bio pages. Anonymous team bylines are avoided for editorial content that gives buying advice.',
    },
    {
        title: 'Regular re-checks',
        description:
            'When tools change pricing, model quality, export limits, or core features, we flag them for update. AI software can change quickly, so older reviews should be treated as maintained resources, not static snapshots.',
    },
];

export default function HowWeTestPage() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'How We Test AI Tools',
        url: 'https://hyzenpro.com/how-we-test/',
        description:
            'HyzenPro review methodology for hands-on AI tool testing, pricing verification, scoring, and editorial independence.',
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <main className="min-h-screen pt-28 pb-20">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    <Breadcrumbs items={[{ label: 'How We Test', href: '/how-we-test/' }]} className="mb-8" />

                    <section className="border-b border-gray-100 pb-12 text-center">
                        <span className="mb-3 inline-block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                            Review Methodology
                        </span>
                        <h1 className="font-heading text-5xl text-black md:text-7xl">How We Test AI Tools</h1>
                        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-gray-600">
                            Our review process is designed to give you honest, reproducible evaluations, not marketing
                            copy dressed up as analysis. We test tools through real workflows, document limitations,
                            and explain which buyers should choose or skip each product.
                        </p>
                    </section>

                    <section className="py-14">
                        <h2 className="font-heading text-4xl text-black">Our Testing Process</h2>
                        <div className="mt-10 space-y-8">
                            {process.map((item) => (
                                <div key={item.step} className="grid gap-5 border-b border-gray-100 pb-8 md:grid-cols-[88px_1fr]">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-black font-heading text-xl text-white">
                                        {item.step}
                                    </div>
                                    <div>
                                        <h3 className="font-heading text-2xl text-black">{item.title}</h3>
                                        <p className="mt-3 text-base leading-8 text-gray-600">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 md:p-8">
                        <h2 className="font-heading text-3xl text-black">Scoring Rubric</h2>
                        <p className="mt-3 text-sm leading-7 text-gray-600">
                            HyzenPro scores are weighted averages, not gut-feel ratings. The exact evidence varies by
                            category, but the same five dimensions guide every review.
                        </p>
                        <div className="mt-6 overflow-x-auto">
                            <table className="w-full min-w-[620px] border-separate border-spacing-0 text-left text-sm">
                                <thead>
                                    <tr>
                                        <th className="border-b border-gray-200 py-3 pr-4 text-xs uppercase tracking-widest text-gray-500">Dimension</th>
                                        <th className="border-b border-gray-200 py-3 pr-4 text-xs uppercase tracking-widest text-gray-500">Weight</th>
                                        <th className="border-b border-gray-200 py-3 text-xs uppercase tracking-widest text-gray-500">What we check</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {scoring.map(([dimension, weight, detail]) => (
                                        <tr key={dimension}>
                                            <td className="border-b border-gray-200 py-4 pr-4 font-semibold text-black">{dimension}</td>
                                            <td className="border-b border-gray-200 py-4 pr-4 text-gray-700">{weight}</td>
                                            <td className="border-b border-gray-200 py-4 text-gray-600">{detail}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="py-14">
                        <h2 className="font-heading text-4xl text-black">Editorial Commitments</h2>
                        <div className="mt-8 grid gap-5 md:grid-cols-2">
                            {commitments.map((item) => (
                                <div key={item.title} className="rounded-2xl border border-gray-200 bg-white p-6">
                                    <h3 className="font-heading text-xl text-black">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="border-t border-gray-100 pt-10">
                        <h2 className="font-heading text-3xl text-black">What This Means for Readers</h2>
                        <div className="mt-5 space-y-5 text-base leading-8 text-gray-600">
                            <p>
                                A HyzenPro review should help you make a practical decision. We care about whether a tool
                                saves time, produces reliable output, and fits a real budget. We also care about what
                                happens after the first impressive demo: export limits, usage caps, team handoff,
                                workflow friction, and the quality of the final deliverable.
                            </p>
                            <p>
                                We encourage readers to treat our reviews as a shortlist builder. Use the review to
                                understand strengths and tradeoffs, then test the top option with one real project before
                                upgrading. That is the most honest way to choose AI software in a market where features,
                                prices, and model quality change quickly.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
            <Footer />
        </>
    );
}
