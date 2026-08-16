'use client';

import Link from 'next/link';
import SaveToolButton from '@/components/tools/SaveToolButton';
import type { ScoredQuizTool } from '@/lib/quiz-data/types';

interface MatcherStackBuilderProps {
  primary: ScoredQuizTool;
  runnerUps: ScoredQuizTool[];
}

export default function MatcherStackBuilder({
  primary,
  runnerUps,
}: MatcherStackBuilderProps) {
  const shortlist = [primary, ...runnerUps].filter((tool) => tool.databaseId);

  if (shortlist.length === 0) {
    return null;
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
        Build your stack
      </div>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black">
        Save the shortlist into My Stack while the decision is fresh.
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
        This is the retention layer we want: keep the tools you are seriously considering in one place, then return
        later without losing the shortlist.
      </p>

      <div className="mt-6 space-y-4">
        {shortlist.map((tool) => (
          <div
            key={tool.id}
            className="flex flex-col gap-4 rounded-md border border-gray-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-black">{tool.name}</h3>
              <p className="mt-2 text-sm leading-7 text-gray-600">{tool.bestFor}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <SaveToolButton
                toolId={tool.databaseId!}
                showLabel
                className="border border-gray-200"
              />
              <Link
                href="/my-stack"
                className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Open My Stack
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
