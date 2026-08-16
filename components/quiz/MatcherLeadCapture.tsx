'use client';

import { useState } from 'react';
import { trackMatcherEvent } from '@/lib/quiz-tracking';
import type { QuizAnswers } from '@/lib/quiz-data/types';

interface MatcherLeadCaptureProps {
  category: string;
  resultId: string;
  resultName: string;
  answers: QuizAnswers;
}

export default function MatcherLeadCapture({
  category,
  resultId,
  resultName,
  answers,
}: MatcherLeadCaptureProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/matcher-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          category,
          resultId,
          resultName,
          source: 'matcher-result',
          answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save your result.');
      }

      setStatus('success');
      setMessage(`Saved. We will use ${email.trim()} for this shortlist.`);
      setName('');
      setEmail('');
      trackMatcherEvent('matcher_email_capture_completed', {
        category,
        result_id: resultId,
        result_name: resultName,
      });
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Something went wrong.');
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-500">
        Save this result
      </div>
      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-black">
        Email this shortlist to yourself before you leave.
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
        We will save the top recommendation and your matcher path so you can pick the evaluation back up later without
        rerunning every question.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-[0.9fr_1.1fr_auto]">
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Your name"
          aria-label="Your name"
          className="h-11 rounded-md border border-gray-200 px-4 text-sm text-black outline-none transition-colors focus:border-black"
          disabled={status === 'loading'}
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          aria-label="Email address"
          className="h-11 rounded-md border border-gray-200 px-4 text-sm text-black outline-none transition-colors focus:border-black"
          disabled={status === 'loading'}
          required
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex h-11 items-center justify-center rounded-md bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'loading' ? 'Saving...' : 'Email me this result'}
        </button>
      </form>

      {message ? (
        <p className={`mt-4 text-sm ${status === 'error' ? 'text-red-600' : 'text-emerald-700'}`}>{message}</p>
      ) : null}
    </section>
  );
}
