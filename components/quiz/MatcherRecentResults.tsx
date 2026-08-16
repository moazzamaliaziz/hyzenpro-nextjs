'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, History } from 'lucide-react';
import { readMatcherHistory, type MatcherHistoryEntry } from '@/lib/matcher-history';

export default function MatcherRecentResults() {
  const [entries, setEntries] = useState<MatcherHistoryEntry[]>([]);

  useEffect(() => {
    setEntries(readMatcherHistory());
  }, []);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-gray-100 py-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-gray-100 text-black">
          <History className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-black">Your recent matcher results</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Pick up where you left off instead of rerunning every matcher from scratch.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {entries.map((entry) => (
          <article key={`${entry.category}-${entry.resultId}`} className="rounded-lg border border-gray-200 bg-white p-5">
            <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
              {entry.categoryTitle}
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-black">{entry.resultName}</h3>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              Saved from your matcher history. Jump back into the result page or open the full review.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={entry.resultUrl}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
              >
                Open result
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={entry.reviewUrl}
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Read review
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
