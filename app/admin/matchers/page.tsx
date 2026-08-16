import prisma from '@/lib/prisma';
import { getResolvedQuizCards } from '@/lib/quiz-data/server';
import { getMatcherSectionId } from '@/lib/quiz-data/overrides';
import MatcherAdminClient from '@/app/admin/matchers/MatcherAdminClient';

export const metadata = {
  title: 'Matcher Management | HyzenPro Admin',
};

export default async function AdminMatchersPage() {
  const configs = (await getResolvedQuizCards()).sort((a, b) => {
    const readinessDelta = Number(b.isLaunchReady ?? false) - Number(a.isLaunchReady ?? false);
    if (readinessDelta !== 0) {
      return readinessDelta;
    }

    return (b.publishedToolCount ?? b.toolCount ?? 0) - (a.publishedToolCount ?? a.toolCount ?? 0);
  });
  const sections = await prisma.siteContent.findMany({
    where: {
      sectionId: {
        in: configs.map((config) => getMatcherSectionId(config.category)),
      },
    },
    select: {
      sectionId: true,
      content: true,
      enabled: true,
      updatedAt: true,
    },
  });

  const sectionMap = new Map(sections.map((section) => [section.sectionId, section]));

  const initialMatchers = configs.map((config) => {
    const section = sectionMap.get(getMatcherSectionId(config.category));
    return {
      category: config.category,
      title: config.title,
      subtitle: config.subtitle,
      toolCount: config.publishedToolCount ?? config.toolCount,
      readinessStatus: config.readinessStatus ?? 'empty',
      readinessLabel: config.readinessLabel ?? 'Empty',
      readinessNote: config.readinessNote ?? '',
      isLaunchReady: config.isLaunchReady ?? false,
      updatedAt: section?.updatedAt ? section.updatedAt.toISOString() : null,
      enabled: section?.enabled ?? true,
      content: section?.content ?? null,
    };
  });

  return <MatcherAdminClient initialMatchers={initialMatchers} />;
}
