import { NextRequest, NextResponse } from 'next/server';
import { getClientIp, consumeRateLimit } from '@/lib/rate-limit';
import { isResendConfigured, sendContactEmail } from '@/lib/resend';
import { sanitizeInput } from '@/lib/utils';

type ContactPayload = {
    name?: string;
    email?: string;
    company?: string;
    inquiryType?: string;
    message?: string;
};

export async function POST(request: NextRequest) {
    const ip = getClientIp(request.headers);
    const rateLimit = consumeRateLimit({
        key: `contact:${ip}`,
        limit: 5,
        windowMs: 1000 * 60 * 15,
    });

    if (!rateLimit.allowed) {
        return NextResponse.json(
            { error: 'Too many messages from this connection. Please wait a few minutes and try again.' },
            { status: 429 }
        );
    }

    if (!isResendConfigured()) {
        return NextResponse.json(
            { error: 'Contact email is not configured yet. Please email admin@hyzenpro.com directly for now.' },
            { status: 503 }
        );
    }

    let body: ContactPayload;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid request payload.' }, { status: 400 });
    }

    const name = sanitizeInput(body.name);
    const email = sanitizeInput(body.email).toLowerCase();
    const company = sanitizeInput(body.company);
    const inquiryType = sanitizeInput(body.inquiryType);
    const message = sanitizeInput(body.message);

    if (!name || name.length < 2) {
        return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!inquiryType) {
        return NextResponse.json({ error: 'Please choose an inquiry type.' }, { status: 400 });
    }

    if (!message || message.length < 20) {
        return NextResponse.json({ error: 'Please add a more detailed message.' }, { status: 400 });
    }

    try {
        await sendContactEmail({ name, email, company, inquiryType, message });
    } catch (error) {
        console.error('Resend contact email failed:', error);
        return NextResponse.json(
            { error: 'Failed to send your message. Please try again or email us directly.' },
            { status: 500 }
        );
    }

    return NextResponse.json({
        success: true,
        message: 'Your message has been sent. We usually reply within 1 to 2 business days.',
    });
}
