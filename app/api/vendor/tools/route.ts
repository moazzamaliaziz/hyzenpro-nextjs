import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { checkRateLimit, getClientIp, rateLimitHeaders } from '@/lib/rate-limit';
import { verifyTurnstileToken } from '@/lib/turnstile';
import {
    cleanSocialLinks,
    cleanStringList,
    cleanUrl,
    cleanVendorText,
} from '@/lib/vendor-validation';
import {
    normalizeToolSlug,
    normalizePrimaryCategorySlug,
    prepareToolForSave,
    resolveCategoryId,
} from '@/lib/tool-publish';

const VENDOR_POST_LIMIT = 8;
const VENDOR_POST_WINDOW_MS = 60 * 60 * 1000;

export async function GET() {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const tools = await prisma.tool.findMany({
            where: { submittedById: user.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                slug: true,
                shortDescription: true,
                logo: true,
                pricingType: true,
                status: true,
                views: true,
                rating: true,
                primaryCategory: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(tools);
    } catch (error) {
        console.error('Failed to fetch vendor tools:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ip = getClientIp(req);
    const rate = checkRateLimit(`vendor-submit:${ip}`, VENDOR_POST_LIMIT, VENDOR_POST_WINDOW_MS);
    if (!rate.allowed) {
        return NextResponse.json(
            { error: 'Too many submissions. Please try again later.' },
            { status: 429, headers: rateLimitHeaders(rate, VENDOR_POST_LIMIT) }
        );
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await req.json();
        const turnstileOk = await verifyTurnstileToken(body.turnstileToken, ip);
        if (!turnstileOk && process.env.TURNSTILE_SECRET_KEY) {
            return NextResponse.json({ error: 'Captcha verification failed. Please try again.' }, { status: 400 });
        }

        const name = cleanVendorText(body.name, 120);
        const websiteUrl = cleanUrl(body.websiteUrl);
        const shortDescription = cleanVendorText(body.shortDescription, 500);
        const longDescription = cleanVendorText(body.longDescription, 8000) || shortDescription;
        const logo = cleanUrl(body.logo) || cleanVendorText(body.logo, 500);
        const pricingType = cleanVendorText(body.pricingType, 32) || 'freemium';
        const primaryCategory = normalizePrimaryCategorySlug(body.primaryCategory);
        const founderName = cleanVendorText(body.founderName, 120);
        const companyName = cleanVendorText(body.companyName, 120);
        const reviewNotes = cleanVendorText(body.reviewNotes, 2000);
        const features = cleanStringList(body.features, 12);
        const pros = cleanStringList(body.pros, 8);
        const cons = cleanStringList(body.cons, 8);
        const secondaryCategories = Array.isArray(body.secondaryCategories)
            ? body.secondaryCategories.map((c: unknown) => normalizePrimaryCategorySlug(String(c))).filter(Boolean)
            : [];
        const socialLinks = cleanSocialLinks(body.socialLinks);

        if (!name || !websiteUrl || !shortDescription) {
            return NextResponse.json({ error: 'Tool name, website URL, and description are required.' }, { status: 400 });
        }

        const categoryId = await resolveCategoryId(primaryCategory);
        if (!categoryId) {
            return NextResponse.json({ error: 'Please choose a valid primary category.' }, { status: 400 });
        }

        const extraIds: string[] = [];
        for (const slug of secondaryCategories) {
            const id = await resolveCategoryId(slug);
            if (id) {
                extraIds.push(id);
            }
        }

        const slug = normalizeToolSlug(body.slug || name);
        const existing = await prisma.tool.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: 'A tool with this name already exists. Contact us if you own this listing.' }, { status: 409 });
        }

        const prepared = await prepareToolForSave({
            name,
            slug,
            shortDescription,
            longDescription,
            websiteUrl,
            pricingType,
            status: 'draft',
            logo: logo || null,
            featured: false,
            features,
            pros,
            cons,
            primaryCategory,
            categoryIds: Array.from(new Set([categoryId, ...extraIds])),
            rating: null,
            meta: {
                companyName: companyName || null,
                founderName: founderName || null,
                reviewNotes: reviewNotes || null,
                socialLinks,
                submittedVia: 'vendor-portal',
                submittedByEmail: user.email,
            },
        });

        const tool = await prisma.tool.create({
            data: {
                name: prepared.name,
                slug: prepared.slug,
                shortDescription: prepared.shortDescription,
                longDescription: prepared.longDescription,
                websiteUrl: prepared.websiteUrl,
                logo: prepared.logo,
                pricingType: prepared.pricingType,
                primaryCategory: prepared.primaryCategory!,
                categoryIds: prepared.categoryIds || [],
                status: 'draft',
                submittedById: user.id,
                features: prepared.features || [],
                pros: prepared.pros || [],
                cons: prepared.cons || [],
                meta: prepared.meta as unknown as Prisma.InputJsonValue,
                seo: prepared.seo as any,
            },
        });

        return NextResponse.json(tool, { status: 201, headers: rateLimitHeaders(rate, VENDOR_POST_LIMIT) });
    } catch (error) {
        console.error('Failed to submit vendor tool:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
