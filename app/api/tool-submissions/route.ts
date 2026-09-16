import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sanitizeInput } from '@/lib/utils';
import { getClientIp, consumeRateLimit } from '@/lib/rate-limit';
import { createUniqueSlug, syncToolCategoryRelations } from '@/lib/tool-publish';
import { verifyTurnstileToken } from '@/lib/turnstile';

function isValidUrl(value: string) {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

const VALID_CATEGORY_SLUGS = [
    'ai-writing-tools', 'ai-image-tools', 'ai-video-tools', 'ai-coding-tools',
    'ai-design-tools', 'ai-chatbots', 'ai-marketing-tools', 'ai-automation-tools',
    'seo-tools', 'ai-general-tools',
];

const VALID_SUBMITTER_ROLES = ['Founder / maker', 'Team member', 'Fan / user', 'Affiliate'];

const VALID_PRICING_OPTIONS = ['Free', 'Freemium', 'Free trial', 'Paid', 'Open source'];

export async function POST(request: NextRequest) {
    const ip = getClientIp(request.headers);
    const rateLimit = consumeRateLimit({
        key: `tool-submission:${ip}`,
        limit: 5,
        windowMs: 1000 * 60 * 15,
    });

    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Too many submissions from this connection. Please wait a few minutes and try again.' },
            { status: 429 }
        );
    }

    let body: Record<string, unknown>;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    // ── Core fields ───────────────────────────────────────────────────────────
    const name = sanitizeInput(body.name);
    const tagline = sanitizeInput(body.tagline);
    const websiteUrl = sanitizeInput(body.websiteUrl);
    const logo = sanitizeInput(body.logoUrl);
    const description = sanitizeInput(body.description);
    const reviewNotes = sanitizeInput(body.reviewNotes);

    // ── Category (validated below, never silently coerced) ────────────────────
    const rawCategory = sanitizeInput(body.category);
    const category = rawCategory;

    // ── Lists ─────────────────────────────────────────────────────────────────
    const audiences = Array.isArray(body.audiences)
        ? body.audiences.map((a: unknown) => sanitizeInput(a)).filter(Boolean)
        : [];
    const keyFeatures = Array.isArray(body.keyFeatures)
        ? body.keyFeatures.map((f: unknown) => sanitizeInput(f)).filter(Boolean).slice(0, 8)
        : [];
    const pros = Array.isArray(body.pros)
        ? body.pros.map((p: unknown) => sanitizeInput(p)).filter(Boolean).slice(0, 8)
        : [];
    const cons = Array.isArray(body.cons)
        ? body.cons.map((c: unknown) => sanitizeInput(c)).filter(Boolean).slice(0, 8)
        : [];
    const allScreenshots = Array.isArray(body.screenshots)
        ? body.screenshots.map((s: unknown) => sanitizeInput(s)).filter(Boolean)
        : [];
    const screenshots = allScreenshots.slice(0, 6);
    const demoVideo = sanitizeInput(body.demoVideo);

    // ── Persona page resolution from audiences ────────────────────────────────
    const AUDIENCE_TO_PERSONA_SLUG: Record<string, string> = {
        'Creators & YouTubers':       'creators-youtubers',
        'Marketers & Growth':         'marketers-growth',
        'Developers & Indie Hackers': 'developers-indie-hackers',
        'Founders & Small Teams':     'founders-small-teams',
        'Students & Educators':       'students-educators',
        'Agencies & Consultancies':   'agencies-consultancies',
    };
    const personaSlugs = audiences
        .map((a: string) => AUDIENCE_TO_PERSONA_SLUG[a])
        .filter(Boolean);

    // ── Pricing tiers ─────────────────────────────────────────────────────────
    const rawTiers = Array.isArray(body.pricingTiers) ? body.pricingTiers : [];
    const pricingTiers = rawTiers
        .filter((t: unknown) => t && typeof t === 'object')
        .map((t: unknown) => {
            const r = t as Record<string, unknown>;
            const name = sanitizeInput(r.name);
            if (!name) return null;
            return {
                name,
                monthlyPrice: typeof r.monthlyPrice === 'number' ? r.monthlyPrice : null,
                annualPrice: typeof r.annualPrice === 'number' ? r.annualPrice : null,
                currency: sanitizeInput(r.currency) || 'USD',
                billingPeriod: sanitizeInput(r.billingPeriod) || 'monthly',
                description: sanitizeInput(r.description),
                features: Array.isArray(r.features) ? r.features.map((f: unknown) => sanitizeInput(f)).filter(Boolean) : [],
                limitations: Array.isArray(r.limitations) ? r.limitations.map((l: unknown) => sanitizeInput(l)).filter(Boolean) : [],
                isPopular: Boolean(r.isPopular),
                badge: sanitizeInput(r.badge),
                ctaLabel: sanitizeInput(r.ctaLabel) || 'Get Started',
                ctaUrl: sanitizeInput(r.ctaUrl),
                annualNote: sanitizeInput(r.annualNote),
                freeTrial: sanitizeInput(r.freeTrial),
                moneyBackGuarantee: sanitizeInput(r.moneyBackGuarantee),
                notes: sanitizeInput(r.notes),
            };
        })
        .filter(Boolean);

    // ── Contact / submitter ───────────────────────────────────────────────────
    const submitterName = sanitizeInput(body.submitterName);
    const submitterEmail = sanitizeInput(body.submitterEmail).toLowerCase();
    const submitterRole = sanitizeInput(body.submitterRole);
    const socials = body.socials && typeof body.socials === 'object'
        ? {
            twitter:  sanitizeInput((body.socials as Record<string, unknown>).twitter),
            linkedin: sanitizeInput((body.socials as Record<string, unknown>).linkedin),
            youtube:  sanitizeInput((body.socials as Record<string, unknown>).youtube),
            github:   sanitizeInput((body.socials as Record<string, unknown>).github),
        }
        : {};

    // ── Pricing ───────────────────────────────────────────────────────────────
    const pricing = sanitizeInput(body.pricing);
    const startingPrice = sanitizeInput(body.startingPrice);
    const hasFreeTier = Boolean(body.hasFreeTier);

    // ── FAQs ─────────────────────────────────────────────────────────────────
    const rawFaqs = Array.isArray(body.faqs) ? body.faqs : [];
    const faqDrafts = rawFaqs
        .filter((f: unknown) => f && typeof f === 'object')
        .map((f: unknown) => {
            const r = f as Record<string, unknown>;
            return {
                question: sanitizeInput(r.question),
                answer: sanitizeInput(r.answer),
            };
        });
    const faqs = faqDrafts
        .filter((faq) => faq.question && faq.answer)
        .slice(0, 3);

    // ── Agreement flags ───────────────────────────────────────────────────────
    const agreeGuidelines = Boolean(body.agreeGuidelines);
    const agreeContact = Boolean(body.agreeContact);

    // ── Spam trap (honeypot) ──────────────────────────────────────────────────
    const spamTrap = sanitizeInput(body.companyWebsite);
    if (spamTrap) {
        return NextResponse.json({ success: true, message: 'Your tool has been submitted for review.' }, { status: 201 });
    }

    // ── Cloudflare Turnstile verification (disabled temporarily) ─────────────
    // const turnstileToken = sanitizeInput(body.turnstileToken);
    // const turnstileOk = await verifyTurnstileToken(turnstileToken, ip);
    // if (!turnstileOk) {
    //     return NextResponse.json({ error: 'Captcha verification failed. Please try again.' }, { status: 403 });
    // }

    // ── Validation ────────────────────────────────────────────────────────────
    if (!name || !websiteUrl || !tagline || !description || !submitterName || !submitterEmail) {
        return NextResponse.json({ error: 'Please complete all required fields.' }, { status: 400 });
    }

    if (name.length > 60) {
        return NextResponse.json({ error: 'Tool name must be under 60 characters.' }, { status: 400 });
    }

    if (!isValidUrl(websiteUrl)) {
        return NextResponse.json({ error: 'Please enter a valid website URL starting with http:// or https://.' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitterEmail)) {
        return NextResponse.json({ error: 'Please enter a valid contact email address.' }, { status: 400 });
    }

    if (submitterName.length < 2) {
        return NextResponse.json({ error: 'Please add the name of the person we should contact.' }, { status: 400 });
    }

    if (tagline.length > 90) {
        return NextResponse.json({ error: 'Tagline must be under 90 characters.' }, { status: 400 });
    }

    if (description.length < 80) {
        return NextResponse.json({ error: 'Please make the description a little more detailed (min 80 characters).' }, { status: 400 });
    }

    if (!agreeGuidelines) {
        return NextResponse.json({ error: 'You must agree to the editorial guidelines.' }, { status: 400 });
    }

    if (faqs.length < 3) {
        return NextResponse.json({ error: 'Please provide at least 3 FAQs about your tool.' }, { status: 400 });
    }

    // ── Server-side validation mirrored from the submit wizard ────────────────
    if (description.length > 600) {
        return NextResponse.json({ error: 'Description must be under 600 characters.' }, { status: 400 });
    }

    if (reviewNotes.length > 1000) {
        return NextResponse.json({ error: 'Review notes must be under 1,000 characters.' }, { status: 400 });
    }

    if (logo && !isValidUrl(logo)) {
        return NextResponse.json({ error: 'Logo must be a valid http:// or https:// URL.' }, { status: 400 });
    }

    if (!VALID_CATEGORY_SLUGS.includes(rawCategory)) {
        return NextResponse.json({ error: 'Please choose a valid primary category.' }, { status: 400 });
    }

    if (audiences.length < 1) {
        return NextResponse.json({ error: 'Please select at least one audience.' }, { status: 400 });
    }

    if (keyFeatures.length < 3) {
        return NextResponse.json({ error: 'Please add at least 3 standout features.' }, { status: 400 });
    }

    if (pros.length < 1) {
        return NextResponse.json({ error: 'Please add at least 1 strength.' }, { status: 400 });
    }

    if (cons.length < 1) {
        return NextResponse.json({ error: 'Please add at least 1 honest limitation.' }, { status: 400 });
    }

    if (allScreenshots.length > 6) {
        return NextResponse.json({ error: 'Please provide no more than 6 screenshots.' }, { status: 400 });
    }

    if (allScreenshots.some((url) => !isValidUrl(url))) {
        return NextResponse.json({ error: 'Every screenshot must be a valid http:// or https:// URL.' }, { status: 400 });
    }

    if (demoVideo && !isValidUrl(demoVideo)) {
        return NextResponse.json({ error: 'Demo video must be a valid http:// or https:// URL.' }, { status: 400 });
    }

    if (Object.values(socials as Record<string, unknown>).some((value) => typeof value === 'string' && value.length > 0 && !isValidUrl(value))) {
        return NextResponse.json({ error: 'Each social link must be a valid http:// or https:// URL.' }, { status: 400 });
    }

    if (submitterName.length > 100) {
        return NextResponse.json({ error: 'Submitter name must be under 100 characters.' }, { status: 400 });
    }

    if (faqDrafts.some((faq) => faq.question.length > 180)) {
        return NextResponse.json({ error: 'Each FAQ question must be under 180 characters.' }, { status: 400 });
    }

    if (faqDrafts.some((faq) => faq.answer.length > 800)) {
        return NextResponse.json({ error: 'Each FAQ answer must be under 800 characters.' }, { status: 400 });
    }

    if (pricingTiers.some((tier: any) => tier.ctaUrl && !isValidUrl(tier.ctaUrl))) {
        return NextResponse.json({ error: 'Each pricing plan CTA must be a valid http:// or https:// URL.' }, { status: 400 });
    }

    if (!VALID_SUBMITTER_ROLES.includes(submitterRole)) {
        return NextResponse.json({ error: 'Please choose a valid submitter role.' }, { status: 400 });
    }

    if (!VALID_PRICING_OPTIONS.includes(pricing)) {
        return NextResponse.json({ error: 'Please choose a valid pricing model.' }, { status: 400 });
    }

    const slug = await createUniqueSlug(name);

    // ── Map pricing to existing Tool model enum ───────────────────────────────
    const pricingMap: Record<string, string> = {
        'Free': 'free',
        'Freemium': 'freemium',
        'Free trial': 'freemium',
        'Paid': 'paid',
        'Open source': 'open-source',
    };
    const pricingType = pricingMap[pricing] || 'freemium';

    try {
        // Resolve persona page IDs from audience slugs
        const personaPages = personaSlugs.length > 0
            ? await prisma.personaPage.findMany({
                where: { slug: { in: personaSlugs }, status: 'published' },
                select: { id: true },
            })
            : [];
        const personaPageIds = personaPages.map((p) => p.id);

        // Normalize screenshots to ToolPageMeta format
        const normalizedScreenshots = screenshots
            .filter((s: string) => /^https?:\/\//.test(s))
            .map((url: string) => ({ url, alt: '', caption: '' }));

        // Normalize demo video to ToolPageMeta format
        const normalizedVideos = demoVideo && /^https?:\/\//.test(demoVideo)
            ? [{ url: demoVideo, title: '' }]
            : [];

        const tool = await prisma.tool.create({
            data: {
                name,
                slug,
                shortDescription: tagline,
                longDescription: description || tagline,
                websiteUrl,
                logo: logo || null,
                pricingType,
                primaryCategory: category,
                status: 'draft',
                features: keyFeatures,
                pros,
                cons,
                categoryIds: [],
                alternativeIds: [],
                personaPageIds,
                meta: {
                    // Submission provenance
                    submittedVia: 'public-submit-ai-tool-page',
                    submittedAt: new Date().toISOString(),

                    // Submitter info
                    submitterName,
                    submitterEmail,
                    submitterRole: submitterRole || null,
                    agreeGuidelines,
                    agreeContact,

                    // Wizard fields
                    tagline,
                    audiences,
                    startingPrice: startingPrice || null,
                    hasFreeTier,
                    socials,
                    reviewNotes: reviewNotes || null,

                    // Normalized media for tool page rendering
                    screenshots: normalizedScreenshots,
                    videos: normalizedVideos,

                    // Pricing tiers for comparison table
                    pricingTiers: pricingTiers.length > 0 ? pricingTiers : undefined,

                    // FAQs for tool page
                    faq: faqs.length > 0 ? faqs : undefined,

                    // Source IP
                    sourceIp: ip,
                },
            },
        });

        // Sync category relations (links tool to Category record, updates toolCount)
        await syncToolCategoryRelations(tool.id, category, []);

        return NextResponse.json(
            {
                success: true,
                id: tool.id,
                message: 'Your tool has been submitted for review. We will contact you if we need anything else.',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Failed to create public tool submission:', error);
        return NextResponse.json({ error: 'We could not submit your tool right now.' }, { status: 500 });
    }
}
