import type {
  QuizAnswers,
  QuizCategoryConfig,
  ResolvedQuizTool,
  ScoredQuizTool,
} from '@/lib/quiz-data/types';

export function scoreQuizTools(
  answers: QuizAnswers,
  config: QuizCategoryConfig,
  tools: ResolvedQuizTool[] = config.tools,
): ScoredQuizTool[] {
  return tools
    .map((tool) => ({
      ...tool,
      totalScore: Object.entries(answers).reduce((sum, [questionId, optionId]) => {
        const key = `${questionId}:${optionId}`;
        return sum + (tool.scores[key] ?? 0);
      }, 0),
    }))
    .sort((a, b) => b.totalScore - a.totalScore || a.name.localeCompare(b.name));
}

export function hasCompleteQuizAnswers(answers: QuizAnswers, config: QuizCategoryConfig) {
  return config.questions.every((question) => Boolean(answers[question.id]));
}

export function extractQuizAnswers(
  searchParams: Record<string, string | string[] | undefined>,
  config: Pick<QuizCategoryConfig, 'questions'>,
): QuizAnswers {
  return config.questions.reduce<QuizAnswers>((acc, question) => {
    const rawValue = searchParams[question.id];
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (value) {
      acc[question.id] = value;
    }
    return acc;
  }, {});
}

export function buildQuizResultHref(category: string, resultId: string, answers?: QuizAnswers) {
  const query = new URLSearchParams();

  Object.entries(answers ?? {}).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const suffix = query.toString();
  return suffix
    ? `/find-tools/${category}/${resultId}/?${suffix}`
    : `/find-tools/${category}/${resultId}/`;
}
