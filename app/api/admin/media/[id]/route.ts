import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@/lib/prisma';
import { isR2Configured, deleteFromR2 } from '@/lib/r2';
import {
    buildMediaPath,
    buildMediaUrl,
    mediaAssetSelect,
    normalizeMediaText,
    serializeMediaAsset,
} from '@/lib/media';

export const runtime = 'nodejs';

async function getUsageSummary(id: string) {
    const asset = await prisma.mediaAsset.findUnique({
        where: { id },
        select: { id: true, fileName: true },
    });

    if (!asset) {
        return null;
    }

    const path = buildMediaPath(asset);
    const url = buildMediaUrl(asset);
    const exactMatches = [path, url];

    const [
        toolLogoCount,
        postFeaturedCount,
        authorImageCount,
        toolDescriptionCount,
        postContentCount,
        siteContentEntries,
    ] = await Promise.all([
        prisma.tool.count({ where: { logo: { in: exactMatches } } }),
        prisma.post.count({ where: { featuredImage: { in: exactMatches } } }),
        prisma.author.count({ where: { image: { in: exactMatches } } }),
        prisma.tool.count({
            where: {
                OR: exactMatches.map((candidate) => ({
                    longDescription: { contains: candidate },
                })),
            },
        }),
        prisma.post.count({
            where: {
                OR: exactMatches.map((candidate) => ({
                    content: { contains: candidate },
                })),
            },
        }),
        prisma.siteContent.findMany({
            select: { sectionId: true, content: true },
        }),
    ]);

    const siteContentMatches = siteContentEntries.filter((entry) => {
        const snapshot = JSON.stringify(entry.content ?? {});
        return exactMatches.some((candidate) => snapshot.includes(candidate));
    });

    const references = [
        toolLogoCount ? `${toolLogoCount} tool logo reference${toolLogoCount === 1 ? '' : 's'}` : null,
        postFeaturedCount ? `${postFeaturedCount} featured image reference${postFeaturedCount === 1 ? '' : 's'}` : null,
        authorImageCount ? `${authorImageCount} author profile reference${authorImageCount === 1 ? '' : 's'}` : null,
        toolDescriptionCount ? `${toolDescriptionCount} tool description embed${toolDescriptionCount === 1 ? '' : 's'}` : null,
        postContentCount ? `${postContentCount} post content embed${postContentCount === 1 ? '' : 's'}` : null,
        siteContentMatches.length
            ? `${siteContentMatches.length} site content reference${siteContentMatches.length === 1 ? '' : 's'}`
            : null,
    ].filter(Boolean);

    return {
        references,
        canDelete: references.length === 0,
    };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const asset = await prisma.mediaAsset.findUnique({
            where: { id },
            select: mediaAssetSelect,
        });

        if (!asset) {
            return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
        }

        const usage = await getUsageSummary(id);

        return NextResponse.json({
            item: serializeMediaAsset(asset),
            usage,
        });
    } catch (error) {
        console.error('[MEDIA_GET_BY_ID]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await request.json();

        const asset = await prisma.mediaAsset.update({
            where: { id },
            data: {
                title: normalizeMediaText(body.title, 140),
                altText: normalizeMediaText(body.altText, 160),
                caption: normalizeMediaText(body.caption, 200),
                description: normalizeMediaText(body.description, 300),
                focusKeyword: normalizeMediaText(body.focusKeyword, 80),
                metaTitle: normalizeMediaText(body.metaTitle, 140),
                metaDescription: normalizeMediaText(body.metaDescription, 300),
            },
            select: mediaAssetSelect,
        });

        return NextResponse.json({ item: serializeMediaAsset(asset) });
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
        }

        console.error('[MEDIA_PATCH]', error);
        return NextResponse.json({ error: 'Failed to update media metadata.' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const usage = await getUsageSummary(id);

        if (!usage) {
            return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
        }

        if (!usage.canDelete) {
            return NextResponse.json({
                error: 'This image is still being used across the site.',
                usage,
            }, { status: 409 });
        }

        const fullAsset = await prisma.mediaAsset.findUnique({
            where: { id },
            select: { r2Key: true },
        });

        await prisma.mediaAsset.delete({ where: { id } });

        if (isR2Configured() && fullAsset?.r2Key) {
            await deleteFromR2(fullAsset.r2Key).catch((err) => {
                console.error('[R2] Failed to delete object:', err);
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[MEDIA_DELETE]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
