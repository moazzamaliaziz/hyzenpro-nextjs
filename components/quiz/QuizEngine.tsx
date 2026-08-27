'use client';

import { useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import QuizProgressBar from '@/components/quiz/QuizProgressBar';
import { buildQuizResultHref, scoreQuizTools } from '@/lib/quiz-data/scorer';
import {
  trackMatcherQuestionAnswered,
  trackMatcherQuizCompleted,
  trackMatcherQuizStarted,
} from '@/lib/quiz-tracking';
import type { QuizAnswers, QuizCategoryConfig, ResolvedQuizTool } from '@/lib/quiz-data/types';

interface QuizEngineProps {
  config: QuizCategoryConfig;
  tools?: ResolvedQuizTool[];
  initialAnswers?: QuizAnswers;
  source?: string;
}

export default function QuizEngine({
  config,
  tools = config.tools,
  initialAnswers = {},
  source = 'matcher-category-page',
}: QuizEngineProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const hasTrackedStart = useRef(false);
  const questionTitleId = useId();
  const questionHelperId = useId();
  const question = config.questions[stepIndex];

  const rankedTools = useMemo(
    () => scoreQuizTools(answers, config, tools),
    [answers, config, tools],
  );

  useEffect(() => {
    if (hasTrackedStart.current) {
      return;
    }

    hasTrackedStart.current = true;
    trackMatcherQuizStarted(config.category, source);
  }, [config.category, source]);

  function setAnswer(optionId: string) {
    trackMatcherQuestionAnswered(config.category, question.id, optionId);
    setAnswers((current) => ({
      ...current,
      [question.id]: optionId,
    }));
  }

  function goNext() {
    if (!answers[question.id]) {
      return;
    }

    if (stepIndex === config.questions.length - 1) {
      const topMatch = rankedTools[0];
      if (!topMatch) {
        return;
      }

      trackMatcherQuizCompleted(config.category, topMatch.id, config.questions.length, topMatch.name);
      startTransition(() => {
        router.push(buildQuizResultHref(config.category, topMatch.id, answers));
      });
      return;
    }

    setStepIndex((current) => current + 1);
  }

  function goBack() {
    if (stepIndex === 0) {
      return;
    }

    setStepIndex((current) => current - 1);
  }

  return (
    <section
      className="rounded-lg border border-gray-200 bg-white p-6 md:p-8"
      aria-labelledby={questionTitleId}
    >
      <div aria-live="polite">
        <QuizProgressBar currentStep={stepIndex + 1} totalSteps={config.questions.length} />
      </div>

      <div className="mt-8">
        <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">
          {config.title}
        </div>
        <h2 id={questionTitleId} className="mt-3 text-3xl font-semibold tracking-tight text-black">
          {question.prompt}
        </h2>
        <p id={questionHelperId} className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">
          {question.helper}
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        {question.options.map((option) => {
          const isActive = answers[question.id] === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => setAnswer(option.id)}
              aria-pressed={isActive}
              aria-describedby={questionHelperId}
              className={`rounded-lg border p-5 text-left transition-colors ${
                isActive
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="text-base font-semibold text-black">{option.label}</div>
              <p className="mt-2 text-sm leading-7 text-gray-600">{option.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0 || isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <button
          type="button"
          onClick={goNext}
          disabled={!answers[question.id] || isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {stepIndex === config.questions.length - 1 ? 'See my best match' : 'Next question'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
