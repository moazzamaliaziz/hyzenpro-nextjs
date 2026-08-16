import automationTool from '@/lib/quiz-data/automation-tool.json';
import captionTool from '@/lib/quiz-data/caption-tool.json';
import codingAssistant from '@/lib/quiz-data/coding-assistant.json';
import { GENERIC_MATCHER_CATALOG, getGenericMatcherCard } from '@/lib/quiz-data/catalog';
import type { QuizCategoryCard, QuizCategoryConfig } from '@/lib/quiz-data/types';

const LIVE_QUIZ_CONFIGS: QuizCategoryConfig[] = [
  automationTool,
  codingAssistant,
  captionTool,
];

export const COMING_SOON_QUIZZES: QuizCategoryCard[] = [];

export function getLiveQuizConfigs() {
  return LIVE_QUIZ_CONFIGS;
}

export function getLiveQuizCards(): QuizCategoryCard[] {
  const explicitCards = LIVE_QUIZ_CONFIGS.map((config) => ({
    category: config.category,
    title: config.title,
    subtitle: config.subtitle,
    description: config.description,
    cardDescription: config.cardDescription,
    estimatedTime: config.estimatedTime,
    toolCount: config.toolCount,
    icon: config.icon,
  }));

  return [
    ...explicitCards,
    ...GENERIC_MATCHER_CATALOG.filter(
      (card) => !explicitCards.some((explicitCard) => explicitCard.category === card.category),
    ),
  ];
}

export function getQuizConfig(category: string) {
  return LIVE_QUIZ_CONFIGS.find((config) => config.category === category) ?? null;
}

export function getGenericQuizCard(category: string) {
  return getGenericMatcherCard(category);
}
