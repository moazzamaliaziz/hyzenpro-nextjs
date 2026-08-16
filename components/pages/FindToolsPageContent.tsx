import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import AdSlot from '@/components/ads/AdSlot';
import MatcherRecentResults from '@/components/quiz/MatcherRecentResults';
import QuizWidget from '@/components/quiz/QuizWidget';
import { COMING_SOON_QUIZZES } from '@/lib/quiz-data';
import { getResolvedQuizCards } from '@/lib/quiz-data/server';
import {
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateItemListSchema,
  generateWebApplicationSchema,
} from '@/lib/structured-data';
import { absoluteUrl } from '@/lib/utils';

const FAQS = [
  {
    question: 'How does the HyzenPro AI Tool Matcher work?',
    answer:
      'Each matcher asks a short set of workflow questions and scores tools against practical buying criteria such as team skill level, budget, privacy needs, and setup style.',
  },
  {
    question: 'Are the matcher recommendations free to use?',
    answer:
      'Yes. You can use every matcher without creating an account, and the recommendations are available immediately after you answer the questions.',
  },
  {
    question: 'Which matcher categories are live right now?',
    answer:
      'HyzenPro now supports both fully editorial launch matchers and scalable category matchers that grow as more published tools are added. Categories with deeper inventory show stronger readiness right away, while newer categories improve automatically as the directory expands.',
  },
];

export default async function FindToolsPageContent() {
  const quizCards = (await getResolvedQuizCards()).sort((a, b) => {
    const readinessDelta = Number(b.isLaunchReady ?? false) - Number(a.isLaunchReady ?? false);
    if (readinessDelta !== 0) {
      return readinessDelta;
    }

    return (b.publishedToolCount ?? b.toolCount ?? 0) - (a.publishedToolCount ?? a.toolCount ?? 0);
  });

  const breadcrumbs = [{ label: 'Find Tools' }];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: absoluteUrl('/') },
    { name: 'Find Tools', url: absoluteUrl('/find-tools/') },
  ]);

  const appSchema = generateWebApplicationSchema({
    name: 'HyzenPro AI Tool Matcher',
    description:
      'A guided recommendation engine for choosing the right AI tool based on workflow, budget, and team context.',
    url: absoluteUrl('/find-tools/'),
  });

  const itemListSchema = generateItemListSchema(
    quizCards.map((card) => ({
      name: card.title,
      url: absoluteUrl(`/find-tools/${card.category}/`),
      description: card.cardDescription,
    })),
  );
  const faqSchema = generateFaqSchema(FAQS);

  return (
    <>
      <main id="main-content" tabIndex={-1} className="min-h-screen bg-white pb-24 pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Breadcrumbs items={breadcrumbs} />

          <section className="border-b border-gray-100 pb-12 pt-8">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-black" />
                Guided AI recommendations
              </div>
              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-black md:text-6xl">
                Find the right AI tool without wasting a week on the wrong shortlist.
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-8 text-gray-600 md:text-lg">
                We built these matchers for buyers who want sharper recommendations than a generic directory filter.
                Answer a few focused questions, get a tailored result, then move straight into full reviews and vendor links.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                'Focused launch categories with real editorial reasoning',
                'Built to guide both rankings and affiliate-ready discovery',
                'No signup wall before you see the result',
              ].map((item) => (
                <div key={item} className="rounded-lg border border-gray-200 bg-white p-5">
                  <div className="text-sm leading-7 text-gray-700">{item}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="py-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-black">Start with a live matcher</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
                  These matchers now reflect the live state of the directory. Some are already strong launch categories,
                  while others are growing alongside the tools you publish, so the hub stays honest about what is ready
                  and what still needs inventory.
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {quizCards.map((card) => (
                <QuizWidget key={card.category} card={card} source="matcher-hub" />
              ))}
            </div>

            <div className="mt-10">
              <AdSlot slot="quiz-hub-inline" format="horizontal" />
            </div>
          </section>

          <MatcherRecentResults />

          {COMING_SOON_QUIZZES.length > 0 && (
            <section className="border-t border-gray-100 py-12">
              <div className="mb-8">
                <h2 className="text-3xl font-semibold tracking-tight text-black">What is coming next</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
                  We are expanding into more commercial-intent categories, but only where we can support the quiz with
                  strong editorial reasoning and better-than-generic result pages.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {COMING_SOON_QUIZZES.map((card) => (
                  <div key={card.category} className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                      Coming soon
                    </div>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight text-black">{card.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-gray-600">{card.cardDescription}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-10 border-t border-gray-100 py-12 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-black">How the matcher is designed</h2>
              <div className="mt-6 space-y-5 text-sm leading-8 text-gray-600">
                <p>
                  We are not trying to guess the "best" tool in the abstract. Each matcher is built around the decisions
                  buyers actually wrestle with: control versus speed, privacy versus convenience, and whether the team
                  needs flexibility or simplicity first.
                </p>
                <p>
                  That gives HyzenPro a stronger foundation for both user experience and search. Category pages are
                  crawlable, result pages are shareable, and every recommendation connects cleanly to deeper reviews and
                  related tools.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
                Start here
              </div>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight text-black">
                Want the fastest path to a recommendation?
              </h3>
              <p className="mt-3 text-sm leading-7 text-gray-600">
                Start with the automation matcher if you are comparing platforms like Make, Zapier, n8n, or Lindy.
              </p>
              <Link
                href="/find-tools/automation-tool/"
                className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
              >
                Launch automation matcher
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>

          <section className="border-t border-gray-100 py-12">
            <h2 className="text-3xl font-semibold tracking-tight text-black">Frequently asked questions</h2>
            <div className="mt-8 divide-y divide-gray-100">
              {FAQS.map((faq) => (
                <div key={faq.question} className="py-5">
                  <h3 className="text-base font-semibold text-black">{faq.question}</h3>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
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
