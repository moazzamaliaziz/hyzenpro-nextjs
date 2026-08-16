'use client';

type MatcherEventPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackMatcherEvent(event: string, payload: MatcherEventPayload = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  const data = { event, ...payload };
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);

  if (typeof window.gtag === 'function') {
    window.gtag('event', event, payload);
  }

  const body = JSON.stringify({ event, payload });
  void fetch('/api/matcher-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function trackMatcherCardClick(category: string, source: string) {
  trackMatcherEvent('matcher_card_clicked', {
    category,
    source,
  });
}

export function trackMatcherQuizStarted(category: string, source: string) {
  trackMatcherEvent('matcher_quiz_started', {
    category,
    source,
  });
}

export function trackMatcherQuestionAnswered(category: string, questionId: string, optionId: string) {
  trackMatcherEvent('matcher_question_answered', {
    category,
    question_id: questionId,
    option_id: optionId,
  });
}

export function trackMatcherQuizCompleted(
  category: string,
  resultId: string,
  totalQuestions: number,
  resultName?: string,
) {
  trackMatcherEvent('matcher_quiz_completed', {
    category,
    result_id: resultId,
    result_name: resultName || null,
    total_questions: totalQuestions,
  });
}

export function trackMatcherSponsorClick(category: string, placement: string, destination: string) {
  trackMatcherEvent('matcher_sponsor_clicked', {
    category,
    placement,
    destination,
  });
}
