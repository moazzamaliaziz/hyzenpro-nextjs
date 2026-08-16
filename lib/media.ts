import { absoluteUrl, slugify } from '@/lib/utils';

export const mediaAssetSelect = {
    id: true,
    fileName: true,
    originalFileName: true,
    contentType: true,
    extension: true,
    size: true,
    width: true,
    height: true,
    title: true,
    altText: true,
    caption: true,
    description: true,
    focusKeyword: true,
    metaTitle: true,
    metaDescription: true,
    r2Key: true,
    r2Url: true,
    createdAt: true,
    updatedAt: true,
} as const;

export const MEDIA_ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
]);

export const MEDIA_MAX_FILE_BYTES = 4 * 1024 * 1024;

export const MEDIA_ACCEPT_ATTRIBUTE = Array.from(MEDIA_ALLOWED_MIME_TYPES).join(',');

const MIME_EXTENSION_MAP: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
};

type MediaAssetLike = {
    id: string;
    fileName: string;
    originalFileName?: string | null;
    contentType: string;
    extension: string;
    size: number;
    width: number | null;
    height: number | null;
    title: string | null;
    altText: string | null;
    caption: string | null;
    description: string | null;
    focusKeyword: string | null;
    metaTitle: string | null;
    metaDescription: string | null;
    r2Url?: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export function getMediaExtension(contentType: string): string | null {
    return MIME_EXTENSION_MAP[contentType] || null;
}

export function getMediaDisplayTitle(fileName: string): string {
    const withoutExtension = fileName.replace(/\.[^.]+$/, '');
    return withoutExtension
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function sanitizeOriginalFileName(fileName: string): string {
    const normalized = (fileName || 'image').replace(/[/\\?%*:|"<>]/g, '-').trim();
    return normalized || 'image';
}

export function buildStoredFileName(sourceName: string, extension: string): string {
    const baseName = sanitizeOriginalFileName(sourceName).replace(/\.[^.]+$/, '');
    const slug = slugify(baseName).slice(0, 80) || 'image';
    return `${slug}.${extension}`;
}

export function normalizeMediaText(value: unknown, maxLength: number): string | null {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmed = value.trim().replace(/\s+/g, ' ');
    if (!trimmed) {
        return null;
    }

    return trimmed.slice(0, maxLength);
}

export function parsePositiveInteger(value: FormDataEntryValue | null): number | null {
    if (typeof value !== 'string' || !value.trim()) {
        return null;
    }

    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function buildMediaPath(asset: Pick<MediaAssetLike, 'id' | 'fileName'>): string {
    return `/media/${asset.id}/${asset.fileName}`;
}

export function buildMediaUrl(asset: Pick<MediaAssetLike, 'id' | 'fileName'>): string {
    return absoluteUrl(buildMediaPath(asset));
}

export function buildMediaSchema(asset: MediaAssetLike) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        name: asset.metaTitle || asset.title || getMediaDisplayTitle(asset.fileName),
        description: asset.metaDescription || asset.description || asset.caption || asset.altText || undefined,
        caption: asset.caption || undefined,
        contentUrl: buildMediaUrl(asset),
        url: buildMediaUrl(asset),
        encodingFormat: asset.contentType,
        uploadDate: asset.createdAt.toISOString(),
        width: asset.width || undefined,
        height: asset.height || undefined,
        keywords: asset.focusKeyword || undefined,
    };
}

export function serializeMediaAsset(asset: MediaAssetLike) {
    const path = buildMediaPath(asset);
    const url = asset.r2Url || absoluteUrl(path);

    return {
        id: asset.id,
        fileName: asset.fileName,
        originalFileName: asset.originalFileName ?? undefined,
        contentType: asset.contentType,
        extension: asset.extension,
        size: asset.size,
        width: asset.width,
        height: asset.height,
        title: asset.title,
        altText: asset.altText,
        caption: asset.caption,
        description: asset.description,
        focusKeyword: asset.focusKeyword,
        metaTitle: asset.metaTitle,
        metaDescription: asset.metaDescription,
        r2Url: asset.r2Url ?? null,
        path,
        url,
        schema: buildMediaSchema(asset),
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
    };
}

export function formatBytes(bytes: number): string {
    if (bytes < 1024) {
        return `${bytes} B`;
    }

    const units = ['KB', 'MB', 'GB'];
    let value = bytes;
    let unitIndex = -1;

    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex += 1;
    }

    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function stripExtension(filename: string): string {
    return filename.replace(/\.[^.]+$/, '');
}

function stripUuidPrefix(name: string): string {
    return name.replace(/^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}-?/i, '');
}

export function cleanFilenameToTitle(filename: string): string {
    return stripExtension(filename)
        .replace(/[-_]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function titleFromFilename(filename: string): string {
    const withoutExt = stripExtension(filename);
    const withoutUuid = stripUuidPrefix(withoutExt);
    if (!withoutUuid || withoutUuid.length < 2) {
        return cleanFilenameToTitle(filename);
    }
    return cleanFilenameToTitle(withoutUuid);
}
