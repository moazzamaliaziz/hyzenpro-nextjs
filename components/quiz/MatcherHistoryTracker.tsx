'use client';

import { useEffect } from 'react';
import { writeMatcherHistory } from '@/lib/matcher-history';
import { trackMatcherEvent } from '@/lib/quiz-tracking';

interface MatcherHistoryTrackerProps {
  category: string;
  categoryTitle: string;
  resultId: string;
  resultName: string;
  resultUrl: string;
  reviewUrl: string;
}

export default function MatcherHistoryTracker(props: MatcherHistoryTrackerProps) {
  useEffect(() => {
    writeMatcherHistory({
      ...props,
      savedAt: new Date().toISOString(),
    });

    trackMatcherEvent('matcher_result_viewed', {
      category: props.category,
      result_id: props.resultId,
      result_name: props.resultName,
    });
  }, [props]);

  return null;
}
