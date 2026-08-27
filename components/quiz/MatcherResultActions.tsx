'use client';

import { useRouter } from 'next/navigation';
import { ArrowRightLeft, ExternalLink } from 'lucide-react';
import { useCompare, type CompareTool } from '@/components/compare/CompareContext';
import { trackMatcherEvent } from '@/lib/quiz-tracking';
import { toSecureExternalUrl } from '@/lib/secure-external-url';

interface MatcherResultActionsProps {
  category: string;
  primary: CompareTool & { websiteUrl: string };
  runnerUps: CompareTool[];
}

export default function MatcherResultActions({
  category,
  primary,
  runnerUps,
}: MatcherResultActionsProps) {
  const router = useRouter();
  const { setTools } = useCompare();
  const secureWebsiteUrl = toSecureExternalUrl(primary.websiteUrl);

  function handleCompare() {
    const selection = [primary, ...runnerUps].slice(0, 3);
    setTools(selection);
    trackMatcherEvent('matcher_compare_started', {
      category,
      primary_tool: primary.slug,
      compare_count: selection.length,
    });
    router.push('/compare');
  }

  function handleVisit() {
    trackMatcherEvent('matcher_primary_cta_clicked', {
      category,
      tool_slug: primary.slug,
    });
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
        Next best actions
      </div>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black">
        Turn this recommendation into a buying decision.
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
        Start with the official product page if you are ready to evaluate the tool directly. If you still need more
        context, load the top shortlist into compare so you can pressure-test the recommendation side by side.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={secureWebsiteUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleVisit}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          Try {primary.name}
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={handleCompare}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Compare top matches
          <ArrowRightLeft className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
