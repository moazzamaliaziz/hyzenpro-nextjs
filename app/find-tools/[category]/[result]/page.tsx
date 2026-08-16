import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdSlot from '@/components/ads/AdSlot';
import MatcherLeadCapture from '@/components/quiz/MatcherLeadCapture';
import MatcherHistoryTracker from '@/components/quiz/MatcherHistoryTracker';
import MatcherResultActions from '@/components/quiz/MatcherResultActions';
import MatcherStackBuilder from '@/components/quiz/MatcherStackBuilder';
import MatcherSponsorCard from '@/components/quiz/MatcherSponsorCard';
import QuizResultCard from '@/components/quiz/QuizResultCard';
import QuizShareButton from '@/components/quiz/QuizShareButton';
import { getLiveQuizConfigs } from '@/lib/quiz-data';
import { extractQuizAnswers, hasCompleteQuizAnswers, scoreQuizTools } from '@/lib/quiz-data/scorer';
import { getResolvedQuizConfig } from '@/lib/quiz-data/server';
import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateItemListSchema,
  generateToolSchema,
} from '@/lib/structured-data';
import { absoluteUrl } from '@/lib/utils';

type ResultPageProps = {
  params: Promise<{ category: string; result: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FIND_TOOLS_CATEGORY_MAP: Record<string, string> = {
  'automation-tool': 'ai-automation-tools',
  'coding-assistant': 'ai-coding-tools',
  'caption-tool': 'ai-video-tools',
};

export async function generateStaticParams() {
  return getLiveQuizConfigs().flatMap((config) =>
    config.tools.map((tool) => ({
      category: config.category,
      result: tool.id,
    })),
  );
}

export async function generateMetadata({ params }: ResultPageProps): Promise<Metadata> {
  const { category, result } = await params;
  const config = await getResolvedQuizConfig(category);
  const tool = config?.tools.find((item) => item.id === result);

  if (!config || !tool) {
    return {};
  }

  const directoryCategory = tool.toolCategorySlug || FIND_TOOLS_CATEGORY_MAP[category] || tool.primaryCategoryName || category;
  const canonicalPath = `/ai-tools-directory/${directoryCategory}/${tool.toolSlug}/`;

  return {
    title: `${tool.name} is your ${config.title} match | HyzenPro`,
    description: `${tool.name} is one of our recommended matches for ${config.title.toLowerCase()}. See why it fits, compare runner-ups, and open the full review.`,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${tool.name} is your match | ${config.title}`,
      description: tool.whyItMatches,
      url: absoluteUrl(canonicalPath),
      type: 'article',
    },
  };
}

export default async function QuizResultPage({ params, searchParams }: ResultPageProps) {
  const { category, result } = await params;
  const config = await getResolvedQuizConfig(category);

  if (!config) {
    notFound();
  }

  const query = await searchParams;
  const answers = extractQuizAnswers(query, config);
  const ranked = scoreQuizTools(answers, config, config.tools);
  const selected = ranked.find((tool) => tool.id === result);

  if (!selected) {
    notFound();
  }

  const orderedTools = [
    selected,
    ...ranked.filter((tool) => tool.id !== selected.id),
  ];
  const runnerUps = orderedTools.slice(1, 3);
  const resultUrl = absoluteUrl(`/find-tools/${category}/${result}/`);
  const hasFullAnswers = hasCompleteQuizAnswers(answers, config);

  const breadcrumbs = [
    { label: 'Find Tools', href: '/find-tools/' },
    { label: config.title, href: `/find-tools/${config.category}/` },
    { label: selected.name },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Find Tools', url: absoluteUrl('/find-tools/') },
    { name: config.title, url: absoluteUrl(`/find-tools/${config.category}/`) },
    { name: selected.name, url: absoluteUrl(`/find-tools/${config.category}/${selected.id}/`) },
  ]);
  const faqSchema = generateFaqSchema(config.faq);
  const itemListSchema = generateItemListSchema(
    orderedTools.map((tool) => ({
      name: tool.name,
      url: absoluteUrl(`/find-tools/${config.category}/${tool.id}/`),
      description: tool.whyItMatches,
    })),
  );
  const toolSchema = generateToolSchema(
    {
      name: selected.name,
      slug: selected.toolSlug,
      shortDescription: selected.tagline || selected.whyItMatches,
      websiteUrl: selected.websiteUrl,
      pricingType: selected.pricingLabel || 'paid',
      rating: selected.rating ?? undefined,
      logo: selected.logo ?? undefined,
      primaryCategory: selected.primaryCategoryName ?? undefined,
    },
    {
      pageUrl: absoluteUrl(`/find-tools/${config.category}/${selected.id}/`),
      overallRating: selected.rating ?? undefined,
      reviewCount: 1,
    },
  );

  return (
    <>
      <MatcherHistoryTracker
        category={category}
        categoryTitle={config.title}
        resultId={selected.id}
        resultName={selected.name}
        resultUrl={resultUrl}
        reviewUrl={selected.reviewUrl}
      />
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-white pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <section className="border-b border-gray-100 pb-12 pt-8">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              <span className="rounded-full border border-gray-200 px-3 py-1">
                {hasFullAnswers ? 'Based on your answers' : 'Editorial result page'}
              </span>
              <span className="rounded-full border border-gray-200 px-3 py-1">
                {config.title}
              </span>
            </div>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-black md:text-6xl">
              {selected.name} is the strongest match for this workflow.
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600 md:text-lg">
              {selected.whyItMatches} We found that this recommendation makes the most sense for buyers who want a
              sharper starting point than a broad “best tools” list.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/find-tools/${config.category}/`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to matcher
              </Link>
              <Link
                href={`/find-tools/${config.category}/`}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
              >
                <RotateCcw className="h-4 w-4" />
                Retake quiz
              </Link>
              <QuizShareButton url={resultUrl} category={category} resultId={selected.id} />
            </div>
          </section>

          <section className="grid gap-12 py-12 lg:grid-cols-[1fr_320px]">
            <div className="space-y-10">
              <QuizResultCard tool={selected} rank={1} title={`Top recommendation: ${selected.name}`} />

              <MatcherResultActions
                category={category}
                primary={{
                  id: selected.databaseId || selected.id,
                  name: selected.name,
                  slug: selected.toolSlug,
                  logo: selected.logo ?? null,
                  category: selected.toolCategorySlug,
                  websiteUrl: selected.websiteUrl,
                }}
                runnerUps={runnerUps.map((tool) => ({
                  id: tool.databaseId || tool.id,
                  name: tool.name,
                  slug: tool.toolSlug,
                  logo: tool.logo ?? null,
                  category: tool.toolCategorySlug,
                }))}
              />

              <AdSlot slot="quiz-result-primary" format="horizontal" />

              <section>
                <h2 className="text-3xl font-semibold tracking-tight text-black">Why this tool came out on top</h2>
                <div className="mt-6 space-y-5 text-sm leading-8 text-gray-600">
                  <p>
                    {selected.bestFor} That made it the clearest fit for this matcher path, especially when weighed
                    against setup style, flexibility, and value.
                  </p>
                  <p>
                    We also kept the runner-ups visible because the second-best option is often the better commercial
                    choice when budget, privacy, or workflow maturity shifts. That makes this page more useful than a
                    single hard recommendation with no context.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-3xl font-semibold tracking-tight text-black">Runner-up recommendations</h2>
                <div className="mt-6 space-y-6">
                  {runnerUps.map((tool, index) => (
                    <QuizResultCard key={tool.id} tool={tool} rank={index + 2} />
                  ))}
                </div>
              </section>

              <MatcherLeadCapture
                category={category}
                resultId={selected.id}
                resultName={selected.name}
                answers={answers}
              />

              <MatcherStackBuilder primary={selected} runnerUps={runnerUps} />

              <section>
                <h2 className="text-3xl font-semibold tracking-tight text-black">Compare the shortlist side by side</h2>
                <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Tool</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Why it fits</th>
                        <th className="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">Best for</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {orderedTools.map((tool) => (
                        <tr key={tool.id}>
                          <td className="px-4 py-4 align-top">
                            <div className="font-semibold text-black">{tool.name}</div>
                            <div className="mt-1 text-sm text-gray-500">{tool.pricingLabel || 'See pricing'}</div>
                          </td>
                          <td className="px-4 py-4 text-sm leading-7 text-gray-600">{tool.standout}</td>
                          <td className="px-4 py-4 text-sm leading-7 text-gray-600">{tool.bestFor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <AdSlot slot="quiz-result-secondary" format="horizontal" />

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
                  Related internal links
                </div>
                <div className="mt-5 space-y-4">
                  <Link
                    href={selected.reviewUrl}
                    className="block rounded-md border border-transparent p-3 transition-colors hover:border-gray-200 hover:bg-white"
                  >
                    <div className="text-sm font-semibold text-black">Read the full {selected.name} review</div>
                    <p className="mt-2 text-sm leading-7 text-gray-600">
                      Go deeper on pricing, pros and cons, and editorial analysis.
                    </p>
                  </Link>
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

              {config.sponsoredPlacement ? (
                <MatcherSponsorCard
                  category={config.category}
                  placementKey="result-sidebar"
                  placement={config.sponsoredPlacement}
                />
              ) : (
                <div className="rounded-lg border border-gray-200 bg-white p-6">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
                    Partner-ready placement
                  </div>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-black">Need more options first?</h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    This block is intentionally kept sponsor-friendly, but the core recommendation stays editorial. Browse
                    the full directory if you want to expand the shortlist before choosing a vendor.
                  </p>
                  <Link
                    href="/ai-tools-directory/"
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Browse all tools
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </aside>
          </section>
        </div>
      </main>
      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </>
  );
}
