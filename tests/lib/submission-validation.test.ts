import { describe, expect, it } from 'vitest';
import {
    completion,
    normalizedPayload,
    validate,
    validateAll,
} from '@/components/forms/submit-ai-tool/validation';
import { createEmptyFormData, isValidEmail, isValidHttpUrl, normalizeDraft } from '@/components/forms/submit-ai-tool/model';

function validData() {
    const data = createEmptyFormData();
    data.name = 'Example Tool';
    data.tagline = 'A concise tool for useful work';
    data.website = 'https://example.com';
    data.category = 'ai-writing-tools';
    data.audiences = ['Founders & Small Teams'];
    data.description = 'A'.repeat(80);
    data.keyFeatures = ['One', 'Two', 'Three'];
    data.pros = ['Fast'];
    data.cons = ['Paid plan'];
    data.pricing = 'Free';
    data.faqs = [
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
        { question: 'Q3', answer: 'A3' },
    ];
    data.submitterName = 'Ada Lovelace';
    data.submitterEmail = 'ada@example.com';
    data.agreeGuidelines = true;
    return data;
}

describe('submission form validation hardening', () => {
    it('accepts complete HTTP(S) URLs and rejects malformed hostnames', () => {
        expect(isValidHttpUrl(' https://example.com/path ')).toBe(true);
        expect(isValidHttpUrl('http://localhost:3000')).toBe(true);
        expect(isValidHttpUrl('https://?x.y')).toBe(false);
        expect(isValidHttpUrl('https://foo..bar')).toBe(false);
        expect(isValidHttpUrl('ftp://example.com')).toBe(false);
    });

    it('normalizes email whitespace without accepting malformed addresses', () => {
        expect(isValidEmail(' ada@example.com ')).toBe(true);
        expect(isValidEmail('ada@example')).toBe(false);
        expect(isValidEmail('ada@@example.com')).toBe(false);
    });

    it('aligns Pros and Cons validation with the visible min-one copy', () => {
        const data = validData();
        data.pros = [];
        data.cons = [];
        const errors = validate(1, data);
        expect(errors.pros).toBeTruthy();
        expect(errors.cons).toBeTruthy();
    });

    it('rejects a one-character submitter name and accepts valid complete data', () => {
        const data = validData();
        data.submitterName = 'A';
        expect(validate(5, data).submitterName).toBeTruthy();
        data.submitterName = 'Ada Lovelace';
        expect(validateAll(data)).toEqual({});
    });

    it('protects pricing tiers from invalid numeric and URL values', () => {
        const data = validData();
        data.pricing = 'Paid';
        data.startingPrice = '$19/mo';
        data.pricingTiers = [{
            name: 'Pro', monthlyPrice: '-5', annualPrice: 'abc', currency: 'USD', billingPeriod: 'monthly',
            description: '', features: [], limitations: [], isPopular: false, badge: '', ctaLabel: 'Get Started',
            ctaUrl: 'not-a-url', freeTrial: '', moneyBackGuarantee: '', notes: '',
        }];
        const errors = validate(2, data);
        expect(errors['tier.0.monthlyPrice']).toBeTruthy();
        expect(errors['tier.0.annualPrice']).toBeTruthy();
        expect(errors['tier.0.ctaUrl']).toBeTruthy();
    });

    it('normalizes legacy v2 drafts without dropping recognized fields', () => {
        const draft = normalizeDraft({
            name: ' Old Tool ', website: 'https://example.com ', category: 'ai-writing-tools',
            audiences: ['Founders & Small Teams', 'not-a-real-audience'], pricing: 'Paid',
            pricingTiers: [{ name: 'Pro', monthlyPrice: '29', isPopular: true }],
            socials: { twitter: ' https://x.com/example ' }, agreeContact: false,
        });
        expect(draft.name).toBe(' Old Tool ');
        expect(draft.website).toBe('https://example.com ');
        expect(draft.audiences).toEqual(['Founders & Small Teams']);
        expect(draft.pricingTiers[0]?.monthlyPrice).toBe('29');
        expect(draft.socials.twitter).toBe(' https://x.com/example ');
        expect(draft.agreeContact).toBe(false);
    });

    it('does not count whitespace-only basics as completion', () => {
        const data = createEmptyFormData();
        data.name = '   ';
        expect(completion(data)).toBe(0);
    });

    it('keeps the normalized payload compatible with existing request keys', () => {
        const data = validData();
        data.website = ' https://example.com ';
        data.submitterEmail = ' ADA@example.com ';
        const payload = normalizedPayload(data);
        expect(payload).toMatchObject({
            name: 'Example Tool', websiteUrl: 'https://example.com', submitterEmail: 'ada@example.com',
            category: 'ai-writing-tools', audiences: ['Founders & Small Teams'], agreeGuidelines: true,
        });
        expect(Object.keys(payload)).toEqual(expect.arrayContaining([
            'name', 'tagline', 'websiteUrl', 'logoUrl', 'category', 'audiences', 'description', 'keyFeatures',
            'pros', 'cons', 'pricing', 'startingPrice', 'hasFreeTier', 'pricingTiers', 'faqs', 'screenshots',
            'demoVideo', 'submitterName', 'submitterEmail', 'submitterRole', 'socials', 'reviewNotes', 'agreeGuidelines', 'agreeContact',
        ]));
    });
});
