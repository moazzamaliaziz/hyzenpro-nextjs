'use client';

export type MatcherHistoryEntry = {
  category: string;
  categoryTitle: string;
  resultId: string;
  resultName: string;
  resultUrl: string;
  reviewUrl: string;
  savedAt: string;
};

const STORAGE_KEY = 'hyzenpro_matcher_history';
const MAX_ENTRIES = 8;

export function readMatcherHistory(): MatcherHistoryEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeMatcherHistory(entry: MatcherHistoryEntry) {
  if (typeof window === 'undefined') {
    return;
  }

  const current = readMatcherHistory().filter(
    (item) => !(item.category === entry.category && item.resultId === entry.resultId),
  );

  const next = [entry, ...current].slice(0, MAX_ENTRIES);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
