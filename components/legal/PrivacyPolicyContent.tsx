import Link from 'next/link';

type PolicySection = {
    id: string;
    title: string;
    body: string[];
};

const sections: PolicySection[] = [
    {
        id: 'introduction',
        title: 'Introduction',
        body: [
            'HyzenPro ("we", "our", or "us") operates hyzenpro.com, an AI tools directory that helps creators, marketers, developers, and teams discover, compare, and choose AI products. This Privacy Policy explains how we collect, use, share, and protect information when you visit our site or use our services.',
            'By accessing HyzenPro, you agree to the practices described in this policy. If you do not agree, please discontinue use of the site.',
        ],
    },
    {
        id: 'information-we-collect',
        title: 'Information We Collect',
        body: [
            'We collect information you provide directly, such as your name, email address, company details, tool listing information, messages, newsletter preferences, and any other information you submit through forms on HyzenPro.',
            'We also collect limited technical information automatically, including IP address, browser type, device information, pages viewed, referring pages, approximate location, and interactions with our directory, blog, matcher, ads, and vendor tools.',
        ],
    },
    {
        id: 'how-we-use-information',
        title: 'How We Use Your Information',
        body: [
            'We use collected information to operate HyzenPro, publish and review AI tool listings, personalize recommendations, respond to inquiries, send requested updates, prevent abuse, measure performance, improve content quality, and keep the directory useful for visitors.',
            'We do not sell your personal information to third parties.',
        ],
    },
    {
        id: 'cookies-tracking',
        title: 'Cookies and Tracking',
        body: [
            'We use essential cookies for site functionality, preferences, security, and account-related experiences. With your consent where required, we may also use analytics and advertising cookies, including Google AdSense, to measure performance and help keep the directory free.',
            'You can manage cookie choices through our cookie banner where available, your browser settings, or third-party opt-out tools. Some features may not work correctly if essential cookies are blocked.',
        ],
    },
    {
        id: 'third-party-services',
        title: 'Third-Party Services',
        body: [
            'HyzenPro uses trusted third-party services for hosting, analytics, authentication, advertising, email delivery, spam prevention, database storage, and operational tooling. These providers may process data on our behalf under their own terms and privacy policies.',
            'Outbound links to AI tools, affiliate partners, and external resources are not controlled by HyzenPro. Please review each provider policy before sharing personal or business data with them.',
        ],
    },
    {
        id: 'advertising-affiliates',
        title: 'Advertising and Affiliate Links',
        body: [
            'HyzenPro may display ads or include affiliate links. If you click an ad or affiliate link, third parties may use cookies or similar technologies to understand that interaction and attribute referrals.',
            'Our reviews and comparisons are intended to remain editorially useful. Affiliate relationships do not give third parties access to private information you submit directly to HyzenPro.',
        ],
    },
    {
        id: 'data-security',
        title: 'Data Security',
        body: [
            'We use reasonable technical and organizational measures to protect information from unauthorized access, alteration, disclosure, or destruction.',
            'No method of transmission or storage on the Internet is completely secure, so we cannot guarantee absolute security.',
        ],
    },
    {
        id: 'data-retention',
        title: 'Data Retention',
        body: [
            'We keep personal information only for as long as reasonably necessary to provide the site, comply with legal obligations, resolve disputes, enforce agreements, maintain security, and improve HyzenPro.',
            'When information is no longer needed, we delete it or anonymize it where practical.',
        ],
    },
    {
        id: 'your-rights',
        title: 'Your Rights',
        body: [
            'Depending on your location, you may have rights to access, correct, delete, export, restrict, or object to certain processing of your personal information.',
            'To exercise these rights, contact us using the details below. We will respond within the timeframes required by applicable law.',
        ],
    },
    {
        id: 'childrens-privacy',
        title: "Children's Privacy",
        body: [
            'HyzenPro is not directed to children under 13, and we do not knowingly collect personal information from children. If you believe a child has provided information to us, contact us so we can remove it.',
        ],
    },
    {
        id: 'changes-to-policy',
        title: 'Changes to This Policy',
        body: [
            'We may update this Privacy Policy from time to time. Material changes will be reflected on this page with an updated effective date. Continued use of HyzenPro after changes take effect means you accept the revised policy.',
        ],
    },
    {
        id: 'contact-information',
        title: 'Contact Information',
        body: [
            'Questions about this Privacy Policy or our data practices? Contact us at privacy@hyzenpro.com or through the HyzenPro contact page.',
        ],
    },
];

export default function PrivacyPolicyContent() {
    return (
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
            <aside className="lg:sticky lg:top-24 lg:self-start">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-gray-400">Policy Sections</p>
                <nav className="flex flex-col border-l border-gray-200" aria-label="Privacy policy sections">
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
                    <h2 className="font-heading text-xl font-bold text-black">Need help with a privacy request?</h2>
                    <p className="mt-3 text-sm leading-7 text-gray-600">
                        Send your request through the{' '}
                        <Link href="/contact/" className="font-semibold text-black underline underline-offset-4">
                            contact page
                        </Link>{' '}
                        or email privacy@hyzenpro.com. Please include enough detail for us to verify and process the request.
                    </p>
                </div>
            </article>
        </div>
    );
}
