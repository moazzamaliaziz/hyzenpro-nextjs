import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const secret = searchParams.get('secret');
    const path = searchParams.get('path');

    if (secret !== process.env.REVALIDATION_SECRET) {
        return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
    }

    if (!path) {
        return NextResponse.json(
            { message: 'Path parameter required' },
            { status: 400 }
        );
    }

    try {
        // In Next.js 16 App Router, we use revalidatePath
        const { revalidatePath } = await import('next/cache');
        revalidatePath(path);

        return NextResponse.json({
            revalidated: true,
            path,
            now: Date.now(),
        });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error revalidating' },
            { status: 500 }
        );
    }
}
