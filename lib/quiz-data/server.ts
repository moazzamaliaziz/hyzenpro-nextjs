import prisma from '@/lib/prisma';
import { getGenericQuizCard, getLiveQuizCards, getLiveQuizConfigs, getQuizConfig } from '@/lib/quiz-data';
import { getMatcherSectionId, mergeQuizConfigOverride } from '@/lib/quiz-data/overrides';
import type { QuizCategoryCard, QuizCategoryConfig, ResolvedQuizCategoryConfig, ResolvedQuizTool } from '@/lib/quiz-data/types';
import { normalizeToolPageMeta } from '@/lib/tool-page';

async function withTimeout<T>(promise: Promise<T>, timeoutMs = 4000): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error('Quiz data hydration timed out'));
      }, timeoutMs);
    }),
  ]);
}

type HydratedTool = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  websiteUrl: string;
  pricingType: string;
  logo: string | null;
  rating: number | null;
  primaryCategory: string | null;
  meta: unknown;
};

function getMatcherReadiness(toolCount: number) {
  if (toolCount >= 3) {
    return {
      readinessStatus: 'ready' as const,
      readinessLabel: 'Ready',
      readinessNote: 'Enough live tools to promote this matcher confidently across the site.',
      isLaunchReady: true,
    };
  }

  if (toolCount === 2) {
    return {
      readinessStatus: 'growing' as const,
      readinessLabel: 'Growing',
      readinessNote: 'Useful already, and it will feel stronger after one or two more published tools.',
      isLaunchReady: false,
    };
  }

  if (toolCount === 1) {
    return {
      readinessStatus: 'building' as const,
      readinessLabel: 'Building',
      readinessNote: 'The category has started, but it needs more published options before the matcher becomes persuasive.',
      isLaunchReady: false,
    };
  }

  return {
    readinessStatus: 'empty' as const,
    readinessLabel: 'Empty',
    readinessNote: 'No published tools in this category yet, so the matcher is waiting on inventory.',
    isLaunchReady: false,
  };
}

function withMatcherInventory(card: QuizCategoryCard, toolCount: number): QuizCategoryCard {
  return {
    ...card,
    toolCount,
    publishedToolCount: toolCount,
    ...getMatcherReadiness(toolCount),
  };
}

function buildGenericScores(tool: HydratedTool) {
  const featuredBoost = tool.rating && tool.rating >= 4.6 ? 1 : 0;
  const pricing = tool.pricingType || 'paid';

  return {
    'q1:solo': pricing === 'free' || pricing === 'freemium' ? 5 : 3,
    'q1:team': pricing === 'enterprise' ? 4 : 5,
    'q1:client': featuredBoost + 4,
    'q2:ease': featuredBoost + 4,
    'q2:quality': (tool.rating && tool.rating >= 4.5 ? 5 : 4),
    'q2:speed': pricing === 'free' ? 3 : 4,
    'q3:lean': pricing === 'free' || pricing === 'freemium' ? 5 : 2,
    'q3:balanced': pricing === 'paid' || pricing === 'freemium' ? 5 : 3,
    'q3:premium': pricing === 'enterprise' ? 5 : 4,
    'q4:experiment': pricing === 'free' || pricing === 'freemium' ? 5 : 3,
    'q4:production': featuredBoost + 4,
    'q4:scale': pricing === 'enterprise' ? 5 : featuredBoost + 3,
    'q5:beginner': featuredBoost + 4,
    'q5:mixed': 5,
    'q5:advanced': pricing === 'enterprise' ? 5 : 4,
  };
}

function buildGenericResolvedConfig(category: string, categoryName: string, tools: HydratedTool[]): ResolvedQuizCategoryConfig {
  const card = getGenericQuizCard(category);
  const title = card?.title || `${categoryName} Matcher`;
  const subtitle = card?.subtitle || `Find the right ${categoryName.toLowerCase()} for your workflow.`;
  const description = `Use this scalable matcher to narrow ${categoryName.toLowerCase()} based on team setup, workflow goals, and budget.`;

  const questions: QuizCategoryConfig['questions'] = [
    {
      id: 'q1',
      prompt: `Who will use these ${categoryName.toLowerCase()} most often?`,
      helper: 'Pick the team shape that best matches the buyer and daily user.',
      options: [
        { id: 'solo', label: 'Solo operator', description: 'One person or a very small team needs the tool to stay light and practical.' },
        { id: 'team', label: 'Small team', description: 'A few people will share the workflow, so repeatability matters.' },
        { id: 'client', label: 'Client or org use', description: 'The tool needs to hold up across stakeholders, clients, or broader rollout.' },
      ],
    },
    {
      id: 'q2',
      prompt: `What matters most in this ${categoryName.toLowerCase()} shortlist?`,
      helper: 'Choose the buying angle that would change the decision fastest.',
      options: [
        { id: 'ease', label: 'Ease of use', description: 'We want a tool that feels fast to adopt and easy to run weekly.' },
        { id: 'quality', label: 'Best output', description: 'The end result matters more than shaving off a little setup time.' },
        { id: 'speed', label: 'Fastest workflow', description: 'We care most about reducing time-to-output.' },
      ],
    },
    {
      id: 'q3',
      prompt: 'What budget range is realistic right now?',
      helper: 'Use the budget that reflects what you would actually approve this month.',
      options: [
        { id: 'lean', label: 'Lean budget', description: 'We want the strongest value and low risk while we validate the workflow.' },
        { id: 'balanced', label: 'Balanced spend', description: 'We will pay if the workflow gains are clear.' },
        { id: 'premium', label: 'Premium ready', description: 'Quality, support, or scale matters more than keeping spend low.' },
      ],
    },
    {
      id: 'q4',
      prompt: 'How mature is the workflow you are buying for?',
      helper: 'This helps separate tools for testing from tools for scaled operation.',
      options: [
        { id: 'experiment', label: 'We are experimenting', description: 'Still testing the category and trying to find product fit.' },
        { id: 'production', label: 'Already in production', description: 'The workflow exists and now needs a stronger tool.' },
        { id: 'scale', label: 'Scaling across a team', description: 'The tool needs to survive broader adoption and higher expectations.' },
      ],
    },
    {
      id: 'q5',
      prompt: 'How much experience does the operator have with tools like this?',
      helper: 'Choose the actual operator, not the most technical person in the company.',
      options: [
        { id: 'beginner', label: 'Beginner-friendly', description: 'The tool should feel obvious without much setup friction.' },
        { id: 'mixed', label: 'Mixed experience', description: 'Some people are advanced, but the workflow still needs to be maintainable.' },
        { id: 'advanced', label: 'Advanced operators', description: 'We can handle more complexity if the payoff is worth it.' },
      ],
    },
  ];

  const resolvedTools: ResolvedQuizTool[] = tools.map((tool) => {
    const pageMeta = normalizeToolPageMeta(tool.meta);
    return {
      id: tool.slug,
      toolSlug: tool.slug,
      name: tool.name,
      reviewUrl: `/ai-tools-directory/${tool.primaryCategory || category}/${tool.slug}/`,
      websiteUrl: tool.websiteUrl,
      toolCategorySlug: tool.primaryCategory || category,
      bestFor: `Teams evaluating ${categoryName.toLowerCase()} with a focus on practical rollout and fit.`,
      standout: tool.shortDescription,
      whyItMatches: `${tool.name} is in this matcher because it gives ${categoryName.toLowerCase()} buyers a credible option to evaluate without relying on a generic top-list.`,
      scores: buildGenericScores(tool),
      databaseId: tool.id,
      logo: tool.logo,
      tagline: tool.shortDescription,
      pricingLabel: tool.pricingType,
      rating: tool.rating,
      primaryCategoryName: categoryName,
      currentDeal: pageMeta.currentDeal,
      bestValueNote: pageMeta.bestValueNote,
    };
  });

  return {
    category,
    title,
    subtitle,
    description,
    cardDescription: card?.cardDescription || `Match the right ${categoryName.toLowerCase()} faster.`,
    estimatedTime: card?.estimatedTime || '60 seconds',
    toolCount: resolvedTools.length,
    icon: card?.icon || 'sparkles',
    trustItems: [
      'Generated from the live category inventory',
      'Built to scale as more tools are published',
      'No signup required',
    ],
    intro: [
      `This matcher is designed to scale with the ${categoryName.toLowerCase()} category as you publish more tools. It gives users a guided shortlist before they start opening individual reviews.`,
      `We use category-specific inventory plus practical buying questions so the page can stay useful even while the category is still growing.`,
    ],
    questions,
    tools: resolvedTools,
    faq: [
      {
        question: `How does the ${categoryName} matcher work?`,
        answer: `It uses a short set of workflow and budget questions to sort the current ${categoryName.toLowerCase()} inventory into a more focused shortlist.`,
      },
      {
        question: `Will this matcher improve as more ${categoryName.toLowerCase()} are published?`,
        answer: `Yes. The category matcher is built to scale with your directory, so publishing more tools makes the shortlist stronger over time.`,
      },
    ],
    sponsoredPlacement: null,
    relatedLinks: resolvedTools.slice(0, 3).map((tool) => ({
      label: `Read our ${tool.name} review`,
      href: tool.reviewUrl,
      description: `Open the full ${tool.name} review if you want deeper pricing, pros and cons, and editorial detail.`,
    })),
  };
}

export async function getResolvedQuizConfig(category: string): Promise<ResolvedQuizCategoryConfig | null> {
  const config = getQuizConfig(category);

  if (!config) {
    const genericCard = getGenericQuizCard(category);

    if (!genericCard) {
      return null;
    }

    try {
      const [categoryRecord, tools] = await Promise.all([
        withTimeout(
          prisma.category.findUnique({
            where: { slug: category },
            select: { name: true, slug: true },
          }),
          2500,
        ),
        withTimeout(
          prisma.tool.findMany({
            where: {
              status: 'published',
              primaryCategory: category,
            },
            select: {
              id: true,
              slug: true,
              name: true,
              shortDescription: true,
              websiteUrl: true,
              pricingType: true,
              logo: true,
              rating: true,
              primaryCategory: true,
              meta: true,
            },
            orderBy: [
              { featured: 'desc' },
              { rating: 'desc' },
              { name: 'asc' },
            ],
            take: 12,
          }),
        ),
      ]);

      return buildGenericResolvedConfig(
        category,
        categoryRecord?.name || genericCard.title.replace(' Matcher', ''),
        tools,
      );
    } catch {
      return buildGenericResolvedConfig(category, genericCard.title.replace(' Matcher', ''), []);
    }
  }

  let tools: HydratedTool[] = [];
  let mergedConfig = config;

  try {
    const overrideSection = await withTimeout(
      prisma.siteContent.findUnique({
        where: { sectionId: getMatcherSectionId(category) },
        select: { content: true, enabled: true },
      }),
      2500,
    );

    if (overrideSection?.enabled !== false && overrideSection?.content) {
      mergedConfig = mergeQuizConfigOverride(config, overrideSection.content);
    }
  } catch {
    mergedConfig = config;
  }

  try {
    tools = await withTimeout(
      prisma.tool.findMany({
        where: {
          slug: {
            in: mergedConfig.tools.map((tool) => tool.toolSlug),
          },
          status: 'published',
        },
        select: {
          id: true,
          slug: true,
          name: true,
          shortDescription: true,
          websiteUrl: true,
          pricingType: true,
          logo: true,
          rating: true,
          primaryCategory: true,
          meta: true,
        },
      }),
    );
  } catch {
    tools = [];
  }

  const toolMap = new Map(tools.map((tool) => [tool.slug, tool]));

  const resolvedTools: ResolvedQuizTool[] = mergedConfig.tools.map((tool) => {
    const databaseTool = toolMap.get(tool.toolSlug);
    const pageMeta = normalizeToolPageMeta(databaseTool?.meta);

    return {
      ...tool,
      databaseId: databaseTool?.id,
      logo: databaseTool?.logo ?? null,
      tagline: databaseTool?.shortDescription ?? null,
      pricingLabel: databaseTool?.pricingType ?? null,
      rating: databaseTool?.rating ?? null,
      primaryCategoryName: databaseTool?.primaryCategory
        ? databaseTool.primaryCategory.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
        : null,
      websiteUrl: databaseTool?.websiteUrl || tool.websiteUrl,
      toolCategorySlug: databaseTool?.primaryCategory || tool.toolCategorySlug,
      currentDeal: pageMeta.currentDeal,
      bestValueNote: pageMeta.bestValueNote,
    };
  });

  return {
    ...mergedConfig,
    tools: resolvedTools,
  };
}

export async function getResolvedQuizCards(): Promise<QuizCategoryCard[]> {
  const cards = getLiveQuizCards();
  const explicitCategories = new Set(getLiveQuizConfigs().map((config) => config.category));

  const explicitCountsPromise = Promise.all(
    cards
      .filter((card) => explicitCategories.has(card.category))
      .map(async (card) => {
        const config = await getResolvedQuizConfig(card.category);
        return [card.category, config?.tools.length ?? card.toolCount] as const;
      }),
  );

  const genericCountsPromise = withTimeout(
    prisma.tool.findMany({
      where: {
        status: 'published',
        primaryCategory: {
          in: cards.filter((card) => !explicitCategories.has(card.category)).map((card) => card.category),
        },
      },
      select: {
        primaryCategory: true,
      },
    }),
    2500,
  );

  try {
    const [explicitCounts, genericTools] = await Promise.all([explicitCountsPromise, genericCountsPromise]);
    const countMap = new Map<string, number>(explicitCounts);

    for (const tool of genericTools) {
      if (!tool.primaryCategory) {
        continue;
      }

      countMap.set(tool.primaryCategory, (countMap.get(tool.primaryCategory) ?? 0) + 1);
    }

    return cards.map((card) => withMatcherInventory(card, countMap.get(card.category) ?? card.toolCount ?? 0));
  } catch {
    return cards.map((card) => withMatcherInventory(card, card.toolCount ?? 0));
  }
}
