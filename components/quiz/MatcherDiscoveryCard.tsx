import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { MatcherDiscoveryContext } from '@/lib/matcher-discovery';

interface MatcherDiscoveryCardProps {
  context: MatcherDiscoveryContext;
  compact?: boolean;
}

export default function MatcherDiscoveryCard({
  context,
  compact = false,
}: MatcherDiscoveryCardProps) {
  return (
    <section className={`rounded-lg border border-gray-200 bg-gray-50 ${compact ? 'p-5' : 'p-6 md:p-8'}`}>
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
        {context.eyebrow}
      </div>
      <h2 className={`${compact ? 'mt-3 text-xl' : 'mt-4 text-3xl'} font-semibold tracking-tight text-black`}>
        {context.title}
      </h2>
      <p className={`${compact ? 'mt-3 text-sm' : 'mt-4 text-base'} max-w-3xl leading-7 text-gray-600`}>
        {context.description}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          href={context.primaryHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          {context.primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={context.secondaryHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          {context.secondaryLabel}
        </Link>
      </div>
    </section>
  );
}
