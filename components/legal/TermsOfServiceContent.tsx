import Link from 'next/link';

type TermsSection = {
    id: string;
    title: string;
    body: string[];
};

const sections: TermsSection[] = [
    {
        id: 'acceptance',
        title: 'Acceptance of Terms',
        body: [
            'By accessing or using HyzenPro, you agree to these Terms of Service and any policies linked from this page. If you do not agree, please do not use the website.',
            'These terms apply to visitors, newsletter subscribers, tool vendors, contributors, and anyone using HyzenPro content, forms, directories, matchers, or related services.',
        ],
    },
    {
        id: 'what-we-provide',
        title: 'What HyzenPro Provides',
        body: [
            'HyzenPro publishes AI tool directories, reviews, comparisons, guides, recommendation experiences, and vendor-facing listing workflows.',
            'Our content is provided for general informational and research purposes. It is not professional, legal, financial, or technical advice for your specific situation.',
        ],
    },
    {
        id: 'accounts-submissions',
        title: 'Accounts, Forms, and Tool Submissions',
        body: [
            'When you submit a tool, contact us, join a newsletter, or use a vendor workflow, you agree to provide accurate information and to keep submitted details current where possible.',
            'We may review, edit, reject, or remove submitted listings, descriptions, claims, media, or links if they are inaccurate, promotional in a misleading way, unsafe, unlawful, or not aligned with HyzenPro quality standards.',
        ],
    },
    {
        id: 'editorial-content',
        title: 'Editorial Content and Rankings',
        body: [
            'Reviews, rankings, comparisons, and recommendations are based on our research process, available product information, testing where practical, and editorial judgment.',
            'AI tools change quickly. Pricing, features, limits, ownership, model access, and terms may change after publication. Always verify important details with the provider before making a purchase or business decision.',
        ],
    },
    {
        id: 'affiliate-advertising',
        title: 'Advertising and Affiliate Relationships',
        body: [
            'HyzenPro may display ads, accept sponsorships, or use affiliate links. If you click certain links or buy through them, we may earn a commission at no extra cost to you.',
            'Commercial relationships do not grant vendors ownership over our editorial conclusions. We aim to clearly separate useful guidance from advertising placements.',
        ],
    },
    {
        id: 'acceptable-use',
        title: 'Acceptable Use',
        body: [
            'You may not use HyzenPro to submit spam, misleading product claims, malware links, unlawful content, abusive messages, scraped data at harmful scale, or attempts to interfere with site security or availability.',
            'You may not impersonate another person or organization, misrepresent affiliation with a tool provider, or use our forms to collect information from other users without permission.',
        ],
    },
    {
        id: 'intellectual-property',
        title: 'Intellectual Property',
        body: [
            'HyzenPro content, branding, page designs, original reviews, comparison frameworks, and directory organization are owned by HyzenPro or its licensors unless otherwise stated.',
            'You may link to HyzenPro pages and quote short excerpts with attribution. You may not copy, republish, sell, or redistribute substantial portions of our content without written permission.',
        ],
    },
    {
        id: 'third-party-links',
        title: 'Third-Party Links and Tools',
        body: [
            'HyzenPro links to third-party AI products, websites, documentation, pricing pages, and resources. We do not control those services and are not responsible for their content, data practices, security, uptime, pricing, or performance.',
            'Your use of third-party tools is governed by the provider terms and privacy policies, not by HyzenPro terms.',
        ],
    },
    {
        id: 'disclaimers',
        title: 'Disclaimers',
        body: [
            'HyzenPro is provided on an "as is" and "as available" basis. We do not guarantee uninterrupted access, error-free pages, complete accuracy, or that any reviewed tool will meet your needs.',
            'We may update, remove, reorganize, or discontinue features, pages, listings, or services at any time.',
        ],
    },
    {
        id: 'limitation-liability',
        title: 'Limitation of Liability',
        body: [
            'To the maximum extent permitted by law, HyzenPro will not be liable for indirect, incidental, special, consequential, punitive, or lost-profit damages arising from your use of the site, reliance on content, or interactions with third-party tools.',
            'Some jurisdictions do not allow certain limitations, so parts of this section may not apply to you.',
        ],
    },
    {
        id: 'changes-to-terms',
        title: 'Changes to These Terms',
        body: [
            'We may revise these Terms of Service from time to time. Updated terms will be posted on this page with a new effective date.',
            'Continued use of HyzenPro after changes take effect means you accept the updated terms.',
        ],
    },
    {
        id: 'contact-information',
        title: 'Contact Information',
        body: [
            'Questions about these terms can be sent through the HyzenPro contact page or by emailing legal@hyzenpro.com.',
        ],
    },
];

export default function TermsOfServiceContent() {
    return (
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            <aside className="lg:sticky lg:top-24 lg:self-start">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Terms Sections</p>
                <nav className="flex flex-col border-l border-gray-200" aria-label="Terms of service sections">
                    {sections.map((section) => (
                        <a
                            key={section.id}
                            href={`#${section.id}`}
                            className="border-l border-transparent px-4 py-2 text-sm font-semibold text-gray-500 transition-colors hover:border-black hover:text-black"
                        >
                            {section.title}
                        </a>
                    ))}
                </nav>
            </aside>

            <article className="max-w-3xl">
                {sections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-gray-100 pb-10 last:border-b-0">
                        <h2 className="font-heading text-2xl font-bold text-black md:text-3xl">{section.title}</h2>
                        <div className="mt-5 space-y-4">
                            {section.body.map((paragraph) => (
                                <p key={paragraph} className="text-base leading-8 text-gray-600">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    </section>
                ))}

                <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-5">
                    <h2 className="font-heading text-xl font-bold text-black">Questions about these terms?</h2>
                    <p className="mt-3 text-sm leading-7 text-gray-600">
                        Reach us through the{' '}
                        <Link href="/contact/" className="font-semibold text-black underline underline-offset-4">
                            contact page
                        </Link>{' '}
                        for legal, vendor, or content-use questions.
                    </p>
                </div>
            </article>
        </div>
    );
}
