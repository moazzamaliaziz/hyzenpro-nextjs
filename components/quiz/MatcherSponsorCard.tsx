'use client';

import { ArrowRight, ExternalLink } from 'lucide-react';
import type { MatcherSponsoredPlacement } from '@/lib/quiz-data/types';
import { trackMatcherSponsorClick } from '@/lib/quiz-tracking';

interface MatcherSponsorCardProps {
  category: string;
  placementKey: string;
  placement: MatcherSponsoredPlacement;
}

export default function MatcherSponsorCard({
  category,
  placementKey,
  placement,
}: MatcherSponsorCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
        {placement.badge || 'Sponsored placement'}
      </div>
      <h3 className="mt-4 text-xl font-semibold tracking-tight text-black">{placement.headline}</h3>
      <p className="mt-3 text-sm leading-7 text-gray-600">{placement.body}</p>
      <a
        href={placement.ctaUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => trackMatcherSponsorClick(category, placementKey, placement.ctaUrl)}
        className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
      >
        {placement.ctaLabel}
        <ExternalLink className="h-4 w-4" />
      </a>
      {placement.secondaryLabel && placement.secondaryUrl ? (
        <a
          href={placement.secondaryUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => trackMatcherSponsorClick(category, `${placementKey}:secondary`, placement.secondaryUrl!)}
          className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-700 transition-colors hover:text-black"
        >
          {placement.secondaryLabel}
          <ArrowRight className="h-4 w-4" />
        </a>
      ) : null}
      <p className="mt-4 text-xs leading-6 text-gray-500">
        {placement.disclosure || 'Sponsored placement. The editorial recommendation above is still chosen independently.'}
      </p>
    </div>
  );
}
