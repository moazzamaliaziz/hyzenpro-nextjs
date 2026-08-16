type CompressResult = {
    buffer: Buffer;
    contentType: string;
    extension: string;
    width?: number;
    height?: number;
};

export async function compressImageBuffer(
    input: Buffer,
    contentType: string,
    extension: string
): Promise<CompressResult> {
    try {
        const sharp = (await import('sharp')).default;
        const image = sharp(input, { failOn: 'none' });
        const metadata = await image.metadata();

        const maxWidth = 1920;
        const pipeline = image.resize({
            width: metadata.width && metadata.width > maxWidth ? maxWidth : undefined,
            withoutEnlargement: true,
        });

        if (extension === 'png') {
            const buffer = await pipeline.png({ compressionLevel: 9, quality: 90 }).toBuffer();
            return { buffer, contentType: 'image/png', extension: 'png', width: metadata.width, height: metadata.height };
        }

        if (extension === 'webp') {
            const buffer = await pipeline.webp({ quality: 82 }).toBuffer();
            return { buffer, contentType: 'image/webp', extension: 'webp', width: metadata.width, height: metadata.height };
        }

        if (extension === 'avif') {
            const buffer = await pipeline.avif({ quality: 55 }).toBuffer();
            return { buffer, contentType: 'image/avif', extension: 'avif', width: metadata.width, height: metadata.height };
        }

        // Default JPEG for jpg/jpeg; gif stays as-is if animated risk
        if (extension === 'gif') {
            return { buffer: input, contentType, extension, width: metadata.width, height: metadata.height };
        }

        const buffer = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
        return { buffer, contentType: 'image/jpeg', extension: 'jpg', width: metadata.width, height: metadata.height };
    } catch {
        return { buffer: input, contentType, extension };
    }
}
