'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { trackMatcherEvent } from '@/lib/quiz-tracking';

interface QuizShareButtonProps {
  url: string;
  category?: string;
  resultId?: string;
}

export default function QuizShareButton({ url, category, resultId }: QuizShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      trackMatcherEvent('matcher_result_shared', {
        category: category || null,
        result_id: resultId || null,
      });
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied result link' : 'Copy result link'}
    </button>
  );
}
