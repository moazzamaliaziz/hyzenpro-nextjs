import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import QuizEngine from '@/components/quiz/QuizEngine';
import MatcherSponsorCard from '@/components/quiz/MatcherSponsorCard';
import { getLiveQuizConfigs } from '@/lib/quiz-data';
import { getResolvedQuizConfig } from '@/lib/quiz-data/server';
import { getQuizIcon } from '@/components/quiz/QuizIcons';
import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateItemListSchema,
  generateWebApplicationSchema,
} from '@/lib/structured-data';
import { absoluteUrl } from '@/lib/utils';

type CategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return getLiveQuizConfigs().map((config) => ({
    category: config.category,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const config = await getResolvedQuizConfig(category);

  if (!config) {
    return {};
  }

  const isEmpty = config.tools.length < 2;

  return {
    title: `${config.title} | ${config.subtitle} | HyzenPro`,
    description: config.description,
    ...(isEmpty ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: `/find-tools/${config.category}/`,
    },
    openGraph: {
      title: `${config.title} | HyzenPro`,
      description: config.description,
      url: absoluteUrl(`/find-tools/${config.category}/`),
      type: 'website',
    },
  };
}

export default async function QuizCategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const config = await getResolvedQuizConfig(category);

  if (!config) {
    notFound();
  }

  const Icon = getQuizIcon(config.icon);
  const breadcrumbs = [
    { label: 'Find Tools', href: '/find-tools/' },
    { label: config.title },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Find Tools', url: absoluteUrl('/find-tools/') },
    { name: config.title, url: absoluteUrl(`/find-tools/${config.category}/`) },
  ]);

  const faqSchema = generateFaqSchema(config.faq);
  const appSchema = generateWebApplicationSchema({
    name: config.title,
    description: config.description,
    url: absoluteUrl(`/find-tools/${config.category}/`),
  });
  const itemListSchema = generateItemListSchema(
    config.tools.map((tool) => ({
      name: tool.name,
      url: absoluteUrl(`/find-tools/${config.category}/${tool.id}/`),
      description: tool.whyItMatches,
    })),
  );

  const isEmpty = config.tools.length < 2;

  return (
    <>
      {isEmpty && <meta name="robots" content="noindex, follow" />}
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-white pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <section className="border-b border-gray-100 pb-12 pt-8">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-600">
                  <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                  {config.estimatedTime} to finish
                </div>
                <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-black md:text-6xl">
                  {config.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">{config.subtitle}</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {config.trustItems.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-md bg-white text-black">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="mt-5 text-sm leading-7 text-gray-600">{config.description}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="font-mono text-2xl text-black">{config.toolCount}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">Tools scored</div>
                  </div>
                  <div>
                    <div className="font-mono text-2xl text-black">{config.questions.length}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">Questions asked</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
            <div className="space-y-12">
              {config.tools.length >= 2 ? (
                <QuizEngine
                  config={config}
                  tools={config.tools}
                  source={`matcher-category:${config.category}`}
                />
              ) : (
                <section className="rounded-lg border border-gray-200 bg-white p-6 md:p-8">
                  <h2 className="text-2xl font-semibold tracking-tight text-black">
                    This matcher is ready, but the category needs a little more inventory first.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600">
                    As you publish more tools in this category, the guided shortlist will get stronger automatically.
                    For now, the best next step is to browse the current directory pages and full reviews below.
                  </p>
                </section>
              )}

              <section>
                <h2 className="text-3xl font-semibold tracking-tight text-black">Why these tools made the shortlist</h2>
                <div className="mt-6 space-y-5 text-sm leading-8 text-gray-600">
                  {config.intro.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-semibold tracking-tight text-black">Compare the shortlisted tools</h2>
                <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Tool</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Best for</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Pricing</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Review</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {config.tools.map((tool) => (
                        <tr key={tool.id}>
                          <td className="px-4 py-4">
                            <div className="font-semibold text-black">{tool.name}</div>
                            <div className="mt-1 text-sm text-gray-500">{tool.primaryCategoryName || 'AI tool'}</div>
                          </td>
                          <td className="px-4 py-4 text-sm leading-7 text-gray-600">{tool.bestFor}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{tool.pricingLabel || 'See website'}</td>
                          <td className="px-4 py-4">
                            <Link href={tool.reviewUrl} className="inline-flex items-center gap-2 text-sm font-medium text-black">
                              Review
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-semibold tracking-tight text-black">Frequently asked questions</h2>
                <div className="mt-8 divide-y divide-gray-100">
                  {config.faq.map((faq) => (
                    <div key={faq.question} className="py-5">
                      <h3 className="text-base font-semibold text-black">{faq.question}</h3>
                      <p className="mt-3 max-w-4xl text-sm leading-7 text-gray-600">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Related reads
                </div>
                <div className="mt-5 space-y-4">
                  {config.relatedLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block rounded-md border border-transparent p-3 transition-colors hover:border-gray-200 hover:bg-white"
                    >
                      <div className="text-sm font-semibold text-black">{link.label}</div>
                      <p className="mt-2 text-sm leading-7 text-gray-600">{link.description}</p>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                  Prefer to browse first?
                </div>
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-black">Open the full directory</h3>
                <p className="mt-3 text-sm leading-7 text-gray-600">
                  If you are still building your shortlist, the full directory is the best next step.
                </p>
                <Link
                  href="/ai-tools-directory/"
                  className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Browse all tools
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {config.sponsoredPlacement ? (
                <MatcherSponsorCard
                  category={config.category}
                  placementKey="category-sidebar"
                  placement={config.sponsoredPlacement}
                />
              ) : null}
            </aside>
          </section>
        </div>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
