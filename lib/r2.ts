import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';

const R2_ENDPOINT = process.env.R2_ENDPOINT ?? '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME ?? '';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? '';

let _client: S3Client | null = null;

function getClient(): S3Client {
    if (_client) return _client;
    _client = new S3Client({
        endpoint: R2_ENDPOINT,
        region: 'auto',
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    });
    return _client;
}

export function isR2Configured(): boolean {
    return Boolean(R2_ENDPOINT && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);
}

interface UploadParams {
    key: string;
    body: Buffer;
    contentType: string;
    cacheControl?: string;
}

export async function uploadToR2(params: UploadParams): Promise<string> {
    const client = getClient();
    const command = new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        CacheControl: params.cacheControl ?? 'public, max-age=31536000, immutable',
    });
    await client.send(command);
    return `${R2_PUBLIC_URL}/${params.key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
    const client = getClient();
    const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });
    await client.send(command);
}

export function buildR2Key(prefix: string, fileName: string): string {
    const date = new Date();
    const y = date.getFullYear().toString();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 10);
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${prefix}/${y}/${m}/${d}/${random}_${safeName}`;
}
