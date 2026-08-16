import Link from 'next/link';
import { ArrowRight, ExternalLink, Star, Ticket } from 'lucide-react';
import type { ScoredQuizTool } from '@/lib/quiz-data/types';

interface QuizResultCardProps {
  tool: ScoredQuizTool;
  rank: number;
  title?: string;
  href?: string;
}

export default function QuizResultCard({
  tool,
  rank,
  title,
  href,
}: QuizResultCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-600">
            Match #{rank}
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-black">
            {title ?? tool.name}
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-600">
            {tool.whyItMatches}
          </p>
        </div>
        {tool.rating ? (
          <div className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
            <Star className="h-4 w-4 fill-black text-black" />
            <span className="font-medium">{tool.rating.toFixed(1)}</span>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-md bg-gray-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
            Best for
          </div>
          <p className="mt-2 text-sm leading-7 text-gray-700">{tool.bestFor}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
            Standout
          </div>
          <p className="mt-2 text-sm leading-7 text-gray-700">{tool.standout}</p>
        </div>
        <div className="rounded-md bg-gray-50 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
            Pricing
          </div>
          <p className="mt-2 text-sm leading-7 text-gray-700">
            {tool.pricingLabel || 'See official pricing'}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={tool.currentDeal?.ctaUrl || tool.websiteUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
        >
          {tool.currentDeal?.ctaLabel || `Visit ${tool.name}`}
          <ExternalLink className="h-4 w-4" />
        </a>
        <Link
          href={href ?? tool.reviewUrl}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          Read review
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {(tool.currentDeal || tool.bestValueNote) && (
        <div className="mt-6 rounded-md border border-gray-200 bg-gray-50 p-4">
          {tool.currentDeal && (
            <>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-600">
                <Ticket className="h-3.5 w-3.5" />
                {tool.currentDeal.badge || 'Current offer'}
              </div>
              <div className="mt-3 text-sm font-semibold leading-7 text-black">
                {tool.currentDeal.headline}
              </div>
              {tool.currentDeal.detail && (
                <p className="mt-2 text-sm leading-7 text-gray-600">{tool.currentDeal.detail}</p>
              )}
              {tool.currentDeal.couponCode && (
                <div className="mt-3 text-sm text-gray-700">
                  Use code <span className="font-mono font-semibold">{tool.currentDeal.couponCode}</span>
                </div>
              )}
            </>
          )}
          {tool.bestValueNote && (
            <p className={`${tool.currentDeal ? 'mt-3' : ''} text-sm leading-7 text-gray-600`}>
              {tool.bestValueNote}
            </p>
          )}
        </div>
      )}
    </article>
  );
}
