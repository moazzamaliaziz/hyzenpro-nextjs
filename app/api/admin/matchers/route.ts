import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getLiveQuizCards } from '@/lib/quiz-data';
import { getResolvedQuizCards } from '@/lib/quiz-data/server';
import { getMatcherSectionId } from '@/lib/quiz-data/overrides';
import { z } from 'zod';

const MatcherUpdateSchema = z.object({
    category: z.string().min(1),
    content: z.record(z.string(), z.any()).optional(),
    enabled: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const token = await requireAdminToken(request);
  if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
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

    return NextResponse.json({
      matchers: configs.map((config) => {
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
          updatedAt: section?.updatedAt ?? null,
          enabled: section?.enabled ?? true,
          content: section?.content ?? null,
        };
      }),
    });
  } catch (error) {
    console.error('Failed to fetch matcher configs', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const token = await requireAdminToken(req);
  if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const parsed = MatcherUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { category, content, enabled } = parsed.data;

    if (!getLiveQuizCards().some((config) => config.category === category)) {
      return NextResponse.json({ error: 'Valid matcher category is required.' }, { status: 400 });
    }

    const sectionId = getMatcherSectionId(category);

    const section = await prisma.siteContent.upsert({
      where: { sectionId },
      update: {
        content: (content && typeof content === 'object' ? content : {}) as unknown as Prisma.InputJsonValue,
        enabled,
        title: `Matcher Override: ${category}`,
        subtitle: 'Admin-managed matcher override',
      },
      create: {
        sectionId,
        title: `Matcher Override: ${category}`,
        subtitle: 'Admin-managed matcher override',
        content: (content && typeof content === 'object' ? content : {}) as unknown as Prisma.InputJsonValue,
        enabled,
        sortOrder: 500,
      },
    });

    revalidatePath('/find-tools');
    revalidatePath(`/find-tools/${category}`);
    revalidatePath(`/find-tools/${category}/[result]`, 'page');
    revalidatePath('/admin/matchers');

    return NextResponse.json({ success: true, section });
  } catch (error) {
    console.error('Failed to save matcher config', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
