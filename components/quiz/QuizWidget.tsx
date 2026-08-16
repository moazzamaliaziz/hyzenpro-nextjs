'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getQuizIcon } from '@/components/quiz/QuizIcons';
import type { QuizCategoryCard } from '@/lib/quiz-data/types';
import { trackMatcherCardClick } from '@/lib/quiz-tracking';

interface QuizWidgetProps {
  card: QuizCategoryCard;
  source?: string;
}

export default function QuizWidget({ card, source = 'matcher-hub' }: QuizWidgetProps) {
  const Icon = getQuizIcon(card.icon);
  const toolCount = card.publishedToolCount ?? card.toolCount;
  const badgeTone =
    card.readinessStatus === 'ready'
      ? 'bg-emerald-50 text-emerald-700'
      : card.readinessStatus === 'growing'
        ? 'bg-amber-50 text-amber-700'
        : 'bg-gray-100 text-gray-600';
  const buttonLabel = toolCount >= 2 ? 'Start matcher' : 'View category';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-gray-100 text-black">
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-black">{card.title}</h3>
            <p className="mt-1 text-sm text-gray-500">{card.estimatedTime}</p>
          </div>
        </div>
        {card.readinessLabel ? (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${badgeTone}`}>
            {card.readinessLabel}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-sm leading-7 text-gray-600">{card.cardDescription}</p>
      {card.readinessNote ? <p className="mt-3 text-sm leading-6 text-gray-500">{card.readinessNote}</p> : null}

      <div className="mt-6 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-gray-500">
        <span>{toolCount} tools</span>
        <span>{card.estimatedTime}</span>
      </div>

      <Link
        href={`/find-tools/${card.category}/`}
        onClick={() => trackMatcherCardClick(card.category, source)}
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900"
      >
        {buttonLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
