import prisma from '@/lib/prisma';

type MatcherEventDocument = {
  event: string;
  category?: string | null;
  source?: string | null;
  result_id?: string | null;
  result_name?: string | null;
  question_id?: string | null;
  option_id?: string | null;
  placement?: string | null;
  destination?: string | null;
  tool_slug?: string | null;
  compare_count?: number | null;
  total_questions?: number | null;
  createdAt: Date;
};

type AggregateResponse<T> = {
  cursor?: {
    firstBatch?: T[];
  };
};

type CountResponse = {
  n?: number;
};

const ALLOWED_EVENTS = new Set([
  'matcher_card_clicked',
  'matcher_quiz_started',
  'matcher_question_answered',
  'matcher_quiz_completed',
  'matcher_result_viewed',
  'matcher_result_shared',
  'matcher_compare_started',
  'matcher_primary_cta_clicked',
  'matcher_email_capture_completed',
  'matcher_sponsor_clicked',
]);

function asBatch<T>(result: unknown): T[] {
  if (
    result &&
    typeof result === 'object' &&
    'cursor' in result &&
    result.cursor &&
    typeof result.cursor === 'object' &&
    'firstBatch' in result.cursor &&
    Array.isArray(result.cursor.firstBatch)
  ) {
    return result.cursor.firstBatch as T[];
  }

  return [];
}

function sanitizeString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : undefined;
}

function sanitizeNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function isAllowedMatcherEvent(event: string) {
  return ALLOWED_EVENTS.has(event);
}

export function buildMatcherEventDocument(
  event: string,
  payload: Record<string, unknown>,
): MatcherEventDocument {
  return {
    event,
    category: sanitizeString(payload.category, 80) || null,
    source: sanitizeString(payload.source, 120) || null,
    result_id: sanitizeString(payload.result_id, 120) || null,
    result_name: sanitizeString(payload.result_name, 160) || null,
    question_id: sanitizeString(payload.question_id, 80) || null,
    option_id: sanitizeString(payload.option_id, 80) || null,
    placement: sanitizeString(payload.placement, 120) || null,
    destination: sanitizeString(payload.destination, 500) || null,
    tool_slug: sanitizeString(payload.tool_slug, 160) || null,
    compare_count: sanitizeNumber(payload.compare_count) ?? null,
    total_questions: sanitizeNumber(payload.total_questions) ?? null,
    createdAt: new Date(),
  };
}

export async function insertMatcherEvent(document: MatcherEventDocument) {
  await (prisma as any).$runCommandRaw({
    insert: 'MatcherEvent',
    documents: [document],
  });
}

async function runAggregate<T>(pipeline: Record<string, unknown>[]) {
  const result = (await (prisma as any).$runCommandRaw({
    aggregate: 'MatcherEvent',
    pipeline,
    cursor: {},
  })) as AggregateResponse<T>;

  return asBatch<T>(result);
}

async function runCount(collection: string, query: Record<string, unknown> = {}) {
  const result = (await (prisma as any).$runCommandRaw({
    count: collection,
    query,
  })) as CountResponse;

  return result.n ?? 0;
}

export async function getMatcherAnalyticsOverview() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    eventCounts,
    recentEventCounts,
    leadCount,
    recentLeadCount,
    categoryStats,
    topResults,
    sponsorDestinations,
  ] = await Promise.all([
    runAggregate<{ _id: string; count: number }>([
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 as const } },
    ]),
    runAggregate<{ _id: string; count: number }>([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$event', count: { $sum: 1 } } },
      { $sort: { count: -1 as const } },
    ]),
    runCount('MatcherLead'),
    runCount('MatcherLead', { createdAt: { $gte: sevenDaysAgo } }),
    runAggregate<{
      _id: string;
      starts: number;
      completions: number;
      resultViews: number;
      sponsorClicks: number;
      shares: number;
      compareStarts: number;
      primaryClicks: number;
      leads: number;
    }>([
      { $match: { category: { $ne: null } } },
      {
        $group: {
          _id: '$category',
          starts: { $sum: { $cond: [{ $eq: ['$event', 'matcher_quiz_started'] }, 1, 0] } },
          completions: { $sum: { $cond: [{ $eq: ['$event', 'matcher_quiz_completed'] }, 1, 0] } },
          resultViews: { $sum: { $cond: [{ $eq: ['$event', 'matcher_result_viewed'] }, 1, 0] } },
          sponsorClicks: { $sum: { $cond: [{ $eq: ['$event', 'matcher_sponsor_clicked'] }, 1, 0] } },
          shares: { $sum: { $cond: [{ $eq: ['$event', 'matcher_result_shared'] }, 1, 0] } },
          compareStarts: { $sum: { $cond: [{ $eq: ['$event', 'matcher_compare_started'] }, 1, 0] } },
          primaryClicks: { $sum: { $cond: [{ $eq: ['$event', 'matcher_primary_cta_clicked'] }, 1, 0] } },
          leads: { $sum: { $cond: [{ $eq: ['$event', 'matcher_email_capture_completed'] }, 1, 0] } },
        },
      },
      { $sort: { completions: -1 as const, starts: -1 as const } },
    ]),
    runAggregate<{
      _id: { category: string; result_id: string; result_name: string };
      count: number;
    }>([
      { $match: { event: 'matcher_quiz_completed', result_id: { $ne: null } } },
      {
        $group: {
          _id: {
            category: '$category',
            result_id: '$result_id',
            result_name: '$result_name',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 as const } },
      { $limit: 10 },
    ]),
    runAggregate<{
      _id: { category: string; destination: string };
      count: number;
    }>([
      { $match: { event: 'matcher_sponsor_clicked', destination: { $ne: null } } },
      {
        $group: {
          _id: {
            category: '$category',
            destination: '$destination',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 as const } },
      { $limit: 10 },
    ]),
  ]);

  const totals = new Map(eventCounts.map((item) => [item._id, item.count]));
  const recentTotals = new Map(recentEventCounts.map((item) => [item._id, item.count]));
  const starts = totals.get('matcher_quiz_started') ?? 0;
  const completions = totals.get('matcher_quiz_completed') ?? 0;

  return {
    totals: {
      starts,
      completions,
      resultViews: totals.get('matcher_result_viewed') ?? 0,
      shares: totals.get('matcher_result_shared') ?? 0,
      sponsorClicks: totals.get('matcher_sponsor_clicked') ?? 0,
      compareStarts: totals.get('matcher_compare_started') ?? 0,
      primaryClicks: totals.get('matcher_primary_cta_clicked') ?? 0,
      leads: leadCount,
      completionRate: starts > 0 ? Math.round((completions / starts) * 100) : 0,
    },
    recent: {
      starts: recentTotals.get('matcher_quiz_started') ?? 0,
      completions: recentTotals.get('matcher_quiz_completed') ?? 0,
      resultViews: recentTotals.get('matcher_result_viewed') ?? 0,
      shares: recentTotals.get('matcher_result_shared') ?? 0,
      sponsorClicks: recentTotals.get('matcher_sponsor_clicked') ?? 0,
      compareStarts: recentTotals.get('matcher_compare_started') ?? 0,
      primaryClicks: recentTotals.get('matcher_primary_cta_clicked') ?? 0,
      leads: recentLeadCount,
    },
    categories: categoryStats.map((item) => ({
      category: item._id,
      starts: item.starts,
      completions: item.completions,
      resultViews: item.resultViews,
      sponsorClicks: item.sponsorClicks,
      shares: item.shares,
      compareStarts: item.compareStarts,
      primaryClicks: item.primaryClicks,
      leads: item.leads,
      completionRate: item.starts > 0 ? Math.round((item.completions / item.starts) * 100) : 0,
    })),
    topResults: topResults.map((item) => ({
      category: item._id.category,
      resultId: item._id.result_id,
      resultName: item._id.result_name,
      completions: item.count,
    })),
    sponsorDestinations: sponsorDestinations.map((item) => ({
      category: item._id.category,
      destination: item._id.destination,
      clicks: item.count,
    })),
  };
}
