import QuizWidget from '@/components/quiz/QuizWidget';
import { getResolvedQuizCards } from '@/lib/quiz-data/server';

interface MatcherSpotlightProps {
  title?: string;
  description?: string;
  source?: string;
  maxItems?: number;
}

export default async function MatcherSpotlight({
  title = 'Start with a guided matcher',
  description = 'Use the matcher when a plain directory list is too broad. These guided flows narrow the shortlist much faster.',
  source = 'matcher-spotlight',
  maxItems = 3,
}: MatcherSpotlightProps) {
  const cards = (await getResolvedQuizCards())
    .sort((a, b) => {
      const readinessDelta = Number(b.isLaunchReady ?? false) - Number(a.isLaunchReady ?? false);
      if (readinessDelta !== 0) {
        return readinessDelta;
      }

      return (b.publishedToolCount ?? b.toolCount ?? 0) - (a.publishedToolCount ?? a.toolCount ?? 0);
    })
    .slice(0, maxItems);

  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-6 md:p-8">
      <div className="max-w-3xl">
        <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
          HyzenPro Matcher
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-black">{title}</h2>
        <p className="mt-4 text-sm leading-7 text-gray-600">{description}</p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {cards.map((card) => (
          <QuizWidget key={card.category} card={card} source={source} />
        ))}
      </div>
    </section>
  );
}
