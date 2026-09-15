import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { DEFAULT_SITE_LOGO_URL } from '@/lib/branding';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const SettingsUpdateSchema = z.object({
    globalSettings: z.record(z.string(), z.any()).optional(),
    headerNav: z.record(z.string(), z.any()).optional(),
    footerNav: z.record(z.string(), z.any()).optional(),
});

export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const [globalSettings, headerNav, footerNav] = await Promise.all([
            prisma.siteContent.findUnique({ where: { sectionId: 'global-settings' } }),
            prisma.siteContent.findUnique({ where: { sectionId: 'header-nav' } }),
            prisma.siteContent.findUnique({ where: { sectionId: 'footer-nav' } }),
        ]);

        return NextResponse.json({
            globalSettings: globalSettings?.content || {
                siteName: 'HyzenPro',
                logoUrl: DEFAULT_SITE_LOGO_URL,
                faviconUrl: '/favicon.png',
            },
            headerNav: headerNav?.content || { links: [] },
            footerNav: footerNav?.content || { links: {} },
        });
    } catch (error) {
        console.error('Failed to fetch settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const body = await request.json();
        const parsed = SettingsUpdateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
        }

        const { globalSettings, headerNav, footerNav } = parsed.data;

        await prisma.$transaction(async (tx) => {
            if (globalSettings) {
                await tx.siteContent.upsert({
                    where: { sectionId: 'global-settings' },
                    update: { content: globalSettings as unknown as Prisma.InputJsonValue },
                    create: { sectionId: 'global-settings', content: globalSettings as unknown as Prisma.InputJsonValue },
                });
            }
            if (headerNav) {
                await tx.siteContent.upsert({
                    where: { sectionId: 'header-nav' },
                    update: { content: headerNav as unknown as Prisma.InputJsonValue },
                    create: { sectionId: 'header-nav', content: headerNav as unknown as Prisma.InputJsonValue },
                });
            }
            if (footerNav) {
                await tx.siteContent.upsert({
                    where: { sectionId: 'footer-nav' },
                    update: { content: footerNav as unknown as Prisma.InputJsonValue },
                    create: { sectionId: 'footer-nav', content: footerNav as unknown as Prisma.InputJsonValue },
                });
            }
        });

        // Revalidate layout and home to reflect global branding and nav changes immediately
        revalidatePath('/', 'layout');
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to update settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
