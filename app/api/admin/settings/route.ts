import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function GET() {
    try {
        const [globalSettings, headerNav, footerNav] = await Promise.all([
            prisma.siteContent.findUnique({ where: { sectionId: 'global-settings' } }),
            prisma.siteContent.findUnique({ where: { sectionId: 'header-nav' } }),
            prisma.siteContent.findUnique({ where: { sectionId: 'footer-nav' } }),
        ]);

        return NextResponse.json({
            globalSettings: globalSettings?.content || {
                siteName: 'HyzenPro',
                logoUrl: '/images/logo.png',
                faviconUrl: '/favicon.ico',
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
    const session = await auth();
    if (!session?.user || (session.user as any).role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { globalSettings, headerNav, footerNav } = body;

        await prisma.$transaction(async (tx) => {
            if (globalSettings) {
                await tx.siteContent.upsert({
                    where: { sectionId: 'global-settings' },
                    update: { content: globalSettings },
                    create: { sectionId: 'global-settings', content: globalSettings },
                });
            }
            if (headerNav) {
                await tx.siteContent.upsert({
                    where: { sectionId: 'header-nav' },
                    update: { content: headerNav },
                    create: { sectionId: 'header-nav', content: headerNav },
                });
            }
            if (footerNav) {
                await tx.siteContent.upsert({
                    where: { sectionId: 'footer-nav' },
                    update: { content: footerNav },
                    create: { sectionId: 'footer-nav', content: footerNav },
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
