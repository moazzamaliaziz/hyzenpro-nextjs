import type { QuizCategoryConfig } from '@/lib/quiz-data/types';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function mergeValue(baseValue: unknown, overrideValue: unknown): unknown {
  if (overrideValue === undefined) {
    return baseValue;
  }

  if (Array.isArray(overrideValue)) {
    return overrideValue;
  }

  if (isRecord(baseValue) && isRecord(overrideValue)) {
    const merged: JsonRecord = { ...baseValue };
    for (const [key, value] of Object.entries(overrideValue)) {
      merged[key] = mergeValue(baseValue[key], value);
    }
    return merged;
  }

  return overrideValue;
}

export function mergeQuizConfigOverride(
  baseConfig: QuizCategoryConfig,
  overrideContent: unknown,
): QuizCategoryConfig {
  if (!isRecord(overrideContent)) {
    return baseConfig;
  }

  return mergeValue(baseConfig, overrideContent) as QuizCategoryConfig;
}

export function getMatcherSectionId(category: string) {
  return `matcher-${category}`;
}
