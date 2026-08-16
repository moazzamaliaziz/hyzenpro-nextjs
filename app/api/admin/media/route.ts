import { NextRequest, NextResponse } from 'next/server';
import { requireAdminToken } from '@/lib/api-auth';
import prisma from '@/lib/prisma';
import { isR2Configured, uploadToR2, buildR2Key } from '@/lib/r2';
import {
    MEDIA_ACCEPT_ATTRIBUTE,
    MEDIA_ALLOWED_MIME_TYPES,
    MEDIA_MAX_FILE_BYTES,
    buildStoredFileName,
    formatBytes,
    getMediaExtension,
    mediaAssetSelect,
    normalizeMediaText,
    parsePositiveInteger,
    sanitizeOriginalFileName,
    serializeMediaAsset,
    titleFromFilename,
} from '@/lib/media';

export const runtime = 'nodejs';

const SORT_MAP: Record<string, string> = {
    date: 'createdAt',
    name: 'title',
    size: 'size',
    type: 'extension',
};

export async function GET(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = request.nextUrl;
        const search = searchParams.get('search')?.trim().toLowerCase();
        const sortField = searchParams.get('sortField') ?? 'createdAt';
        const sortDir = (searchParams.get('sortDir') ?? 'desc') as 'asc' | 'desc';
        const typeFilter = searchParams.get('type') ?? '';
        const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
        const pageSize = Math.min(100, parseInt(searchParams.get('pageSize') ?? '50'));

        const orderField = SORT_MAP[sortField] ?? 'createdAt';
        const safeSortDir = sortDir === 'asc' ? 'asc' : 'desc';

        const where: Record<string, unknown> = {};
        if (typeFilter && typeFilter !== 'all') {
            where.extension = typeFilter;
        }

        const [assets, total] = await prisma.$transaction([
            prisma.mediaAsset.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { [orderField]: safeSortDir },
                select: mediaAssetSelect,
            }),
            prisma.mediaAsset.count({ where }),
        ]);

        const filteredAssets = !search
            ? assets
            : assets.filter((asset) =>
                [
                    asset.title,
                    asset.altText,
                    asset.caption,
                    asset.description,
                    asset.focusKeyword,
                    asset.metaTitle,
                    asset.metaDescription,
                    asset.fileName,
                ]
                    .filter(Boolean)
                    .some((value) => value!.toLowerCase().includes(search!))
            );

        return NextResponse.json({
            items: filteredAssets.map(serializeMediaAsset),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
            upload: {
                maxBytes: MEDIA_MAX_FILE_BYTES,
                maxSizeLabel: formatBytes(MEDIA_MAX_FILE_BYTES),
                accept: MEDIA_ACCEPT_ATTRIBUTE,
            },
            storage: {
                r2Enabled: isR2Configured(),
            },
        });
    } catch (error) {
        console.error('[MEDIA_GET]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const token = await requireAdminToken(request);
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!(file instanceof File)) {
            return NextResponse.json({ error: 'Please choose an image file to upload.' }, { status: 400 });
        }

        if (!MEDIA_ALLOWED_MIME_TYPES.has(file.type)) {
            return NextResponse.json({
                error: 'Only JPG, PNG, WebP, AVIF, and GIF images are allowed. SVG uploads are blocked for safety.',
            }, { status: 400 });
        }

        if (file.size <= 0 || file.size > MEDIA_MAX_FILE_BYTES) {
            return NextResponse.json({
                error: `Images must be smaller than ${formatBytes(MEDIA_MAX_FILE_BYTES)}.`,
            }, { status: 400 });
        }

        const extension = getMediaExtension(file.type);
        if (!extension) {
            return NextResponse.json({ error: 'Unsupported image format.' }, { status: 400 });
        }

        const originalFileName = sanitizeOriginalFileName(file.name || `image.${extension}`);
        const providedTitle = normalizeMediaText(formData.get('title'), 140);
        const title = providedTitle || titleFromFilename(originalFileName);
        const altText = normalizeMediaText(formData.get('altText'), 160) || title;
        const caption = normalizeMediaText(formData.get('caption'), 200);
        const description = normalizeMediaText(formData.get('description'), 300);
        const focusKeyword = normalizeMediaText(formData.get('focusKeyword'), 80);
        const metaTitle = normalizeMediaText(formData.get('metaTitle'), 140);
        const metaDescription = normalizeMediaText(formData.get('metaDescription'), 300);
        const width = parsePositiveInteger(formData.get('width'));
        const height = parsePositiveInteger(formData.get('height'));
        const fileName = buildStoredFileName(originalFileName, extension);

        const arrayBuffer = await file.arrayBuffer();
        let uploadBuffer = Buffer.from(arrayBuffer);
        let uploadContentType = file.type;
        let uploadExtension = extension;
        let uploadFileName = fileName;

        const { compressImageBuffer } = await import('@/lib/image-compress');
        const compressed = await compressImageBuffer(uploadBuffer, file.type, extension);
        uploadBuffer = Buffer.from(compressed.buffer);
        uploadContentType = compressed.contentType;
        uploadExtension = compressed.extension;
        uploadFileName = buildStoredFileName(originalFileName, uploadExtension);

        let r2Key: string | null = null;
        let r2Url: string | null = null;

        if (isR2Configured()) {
            r2Key = buildR2Key('media', uploadFileName);
            r2Url = await uploadToR2({
                key: r2Key,
                body: uploadBuffer,
                contentType: uploadContentType,
            });
        }

        const asset = await prisma.mediaAsset.create({
            data: {
                originalFileName,
                fileName: uploadFileName,
                slug: uploadFileName.replace(/\.[^.]+$/, ''),
                contentType: uploadContentType,
                extension: uploadExtension,
                size: uploadBuffer.length,
                width,
                height,
                title,
                altText,
                caption,
                description,
                focusKeyword,
                metaTitle,
                metaDescription,
                uploadedById: (token as { id?: string })?.id ?? null,
                uploadedByEmail: (token as { email?: string })?.email ?? null,
                r2Key,
                r2Url,
                data: r2Key ? null : uploadBuffer,
            },
            select: mediaAssetSelect,
        });

        return NextResponse.json({ item: serializeMediaAsset(asset) }, { status: 201 });
    } catch (error) {
        console.error('[MEDIA_POST]', error);
        return NextResponse.json({ error: 'Failed to upload media.' }, { status: 500 });
    }
}
