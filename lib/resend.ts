import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
    if (!resendClient) {
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey) {
            throw new Error('RESEND_API_KEY environment variable is not set.');
        }
        resendClient = new Resend(apiKey);
    }
    return resendClient;
}

export function isResendConfigured(): boolean {
    return Boolean(process.env.RESEND_API_KEY);
}

type SendContactEmailParams = {
    name: string;
    email: string;
    company?: string;
    inquiryType: string;
    message: string;
};

export async function sendContactEmail({ name, email, company, inquiryType, message }: SendContactEmailParams) {
    const resend = getResendClient();
    const contactRecipient = process.env.CONTACT_EMAIL || 'admin@hyzenpro.com';
    const submittedAt = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

    await resend.emails.send({
        from: 'HyzenPro Contact <contact@hyzenpro.com>',
        to: contactRecipient,
        replyTo: email,
        subject: `[HyzenPro Contact] ${inquiryType} - ${name}`,
        text: [
            `New contact inquiry from HyzenPro`,
            `Name: ${name}`,
            `Email: ${email}`,
            `Company: ${company || 'Not provided'}`,
            `Type: ${inquiryType}`,
            `Submitted: ${submittedAt}`,
            ``,
            message,
        ].join('\n'),
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111;background:#f5f5f5;padding:24px">
                <div style="max-width:680px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e5e7eb;overflow:hidden">
                    <div style="padding:24px 28px;background:#111;color:#fff">
                        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;opacity:.7;margin-bottom:6px">HyzenPro</div>
                        <h1 style="margin:0;font-size:24px">New Contact Inquiry</h1>
                    </div>
                    <div style="padding:28px">
                        <p style="margin-top:0"><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
                        <p><strong>Inquiry Type:</strong> ${inquiryType}</p>
                        <p><strong>Submitted:</strong> ${submittedAt}</p>
                        <div style="margin-top:24px;padding:20px;background:#f9fafb;border-radius:12px;border:1px solid #e5e7eb">
                            <h2 style="margin:0 0 12px;font-size:16px">Message</h2>
                            <p style="margin:0;white-space:pre-wrap">${message}</p>
                        </div>
                    </div>
                </div>
            </div>
        `,
    });
}
