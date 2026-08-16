import nodemailer from 'nodemailer';

let cachedTransporter: nodemailer.Transporter | null = null;

const REQUIRED_MAILER_KEYS = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'] as const;

type MailerKey = (typeof REQUIRED_MAILER_KEYS)[number];

function getMailerConfig() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user;

    if (!host || !port || !user || !pass || !from) {
        return null;
    }

    return {
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        from,
    };
}

function getTransporter() {
    if (cachedTransporter) {
        return cachedTransporter;
    }

    const config = getMailerConfig();
    if (!config) {
        return null;
    }

    cachedTransporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.auth,
    });

    return cachedTransporter;
}

export function isMailerConfigured() {
    return Boolean(getMailerConfig());
}

export async function sendTransactionalEmail({
    to,
    subject,
    html,
    text,
    replyTo,
    attachments,
}: {
    to: string;
    subject: string;
    html: string;
    text: string;
    replyTo?: string;
    attachments?: Array<{
        filename: string;
        content: string | Buffer;
        contentType?: string;
    }>;
}) {
    const config = getMailerConfig();
    const transporter = getTransporter();

    if (!config || !transporter) {
        throw new Error('SMTP mailer is not configured.');
    }

    await transporter.sendMail({
        from: config.from,
        to,
        subject,
        html,
        text,
        replyTo,
        attachments,
    });
}
