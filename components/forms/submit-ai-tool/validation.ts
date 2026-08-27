import { PRICING_META, PRICING_ORDER, isValidEmail, isValidHttpUrl, type FormData } from './model';

const MAX_URL_LENGTH = 2048;
const MAX_STARTING_PRICE_LENGTH = 80;
const MAX_TAG_LENGTH = 120;
const MAX_FAQ_QUESTION_LENGTH = 180;
const MAX_FAQ_ANSWER_LENGTH = 800;

function validOptionalUrl(value: string): boolean {
    return !value.trim() || isValidHttpUrl(value);
}

function validPriceText(value: string): boolean {
    const candidate = value.trim();
    if (!candidate || candidate.length > MAX_STARTING_PRICE_LENGTH) return false;
    if (/^(free|included|contact(?:\s+sales)?|custom|on request|request a quote|trial(?:\s+only)?)/i.test(candidate)) return true;
    if (/[<>]/.test(candidate)) return false;
    const numeric = candidate.replace(/[$,\s]/g, '').match(/\d+(?:\.\d{1,2})?/);
    if (!numeric) return false;
    const amount = Number(numeric[0]);
    return Number.isFinite(amount) && amount >= 0 && !/-\s*\d/.test(candidate);
}

function validTierPrice(value: string): boolean {
    const candidate = value.trim();
    if (!candidate) return true;
    if (candidate.length > 24 || !/^\d+(?:\.\d{1,2})?$/.test(candidate)) return false;
    const amount = Number(candidate);
    return Number.isFinite(amount) && amount >= 0;
}

function addTierErrors(errors: Record<string, string>, data: FormData) {
    data.pricingTiers.forEach((tier, index) => {
        const hasContent = [tier.name, tier.monthlyPrice, tier.annualPrice, tier.description, tier.badge, tier.ctaUrl,
            tier.freeTrial, tier.moneyBackGuarantee, tier.notes, ...tier.features, ...tier.limitations]
            .some((value) => value.trim());
        if (!hasContent) return;
        if (!tier.name.trim()) errors[`tier.${index}.name`] = 'Add a name or remove this pricing plan.';
        if (!validTierPrice(tier.monthlyPrice)) errors[`tier.${index}.monthlyPrice`] = 'Use a non-negative amount with up to 2 decimals.';
        if (!validTierPrice(tier.annualPrice)) errors[`tier.${index}.annualPrice`] = 'Use a non-negative amount with up to 2 decimals.';
        if (tier.ctaUrl.trim() && !isValidHttpUrl(tier.ctaUrl)) errors[`tier.${index}.ctaUrl`] = 'Use a complete http:// or https:// URL.';
        if (tier.name.trim().length > MAX_TAG_LENGTH) errors[`tier.${index}.name`] = 'Keep the plan name under 120 characters.';
        if (tier.description.length > 300) errors[`tier.${index}.description`] = 'Keep the plan description under 300 characters.';
        if (tier.badge.length > 60) errors[`tier.${index}.badge`] = 'Keep the badge under 60 characters.';
        if (tier.ctaLabel.length > 60) errors[`tier.${index}.ctaLabel`] = 'Keep the CTA label under 60 characters.';
    });
}

export function validate(step: number, data: FormData): Record<string, string> {
    const errors: Record<string, string> = {};
    const name = data.name.trim();
    const tagline = data.tagline.trim();
    const website = data.website.trim();

    if (step === 0) {
        if (!name) errors.name = 'Give your tool a name.';
        else if (name.length > 60) errors.name = 'Keep it under 60 characters.';
        if (!tagline) errors.tagline = 'A one-line pitch helps readers scan.';
        else if (tagline.length > 90) errors.tagline = 'Under 90 characters, please.';
        if (!website) errors.website = 'A live URL is required.';
        else if (website.length > MAX_URL_LENGTH || !isValidHttpUrl(website)) errors.website = 'Use a complete http:// or https:// URL.';
        if (data.logoUrl.trim() && (data.logoUrl.trim().length > MAX_URL_LENGTH || !isValidHttpUrl(data.logoUrl))) {
            errors.logoUrl = 'Logo must be a complete http:// or https:// URL.';
        }
    }

    if (step === 1) {
        if (!data.category) errors.category = 'Pick the primary category.';
        if (data.audiences.length === 0) errors.audiences = 'Select at least one audience.';
        const description = data.description.trim();
        if (description.length < 80) errors.description = 'At least 80 characters — help us understand it.';
        else if (description.length > 600) errors.description = 'Trim to under 600 characters.';
        if (data.keyFeatures.filter((feature) => feature.trim()).length < 3) errors.keyFeatures = 'Add at least 3 standout features.';
        if (data.pros.filter((pro) => pro.trim()).length < 1) errors.pros = 'Add at least 1 strength.';
        if (data.cons.filter((con) => con.trim()).length < 1) errors.cons = 'Add at least 1 honest limitation.';
        if (data.reviewNotes.length > 1000) errors.reviewNotes = 'Keep review notes under 1,000 characters.';
    }

    if (step === 2) {
        if (!PRICING_ORDER.includes(data.pricing)) errors.pricing = 'Choose a pricing model.';
        if (PRICING_META[data.pricing]?.needsPrice && !validPriceText(data.startingPrice)) {
            errors.startingPrice = 'Add a price such as $19/mo, or write “Contact sales.”';
        }
        addTierErrors(errors, data);
    }

    if (step === 3) {
        const completed = data.faqs.filter((faq) => faq.question.trim() && faq.answer.trim());
        if (completed.length < 3) errors.faqs = 'Please answer all 3 FAQs — both question and answer are required.';
        data.faqs.forEach((faq, index) => {
            if (faq.question.trim().length > MAX_FAQ_QUESTION_LENGTH) errors[`faq.${index}.question`] = 'Keep each question under 180 characters.';
            if (faq.answer.trim().length > MAX_FAQ_ANSWER_LENGTH) errors[`faq.${index}.answer`] = 'Keep each answer under 800 characters.';
        });
    }

    if (step === 4) {
        const screenshots = data.screenshots.map((screenshot) => screenshot.trim()).filter(Boolean);
        if (screenshots.length > 6) errors.screenshots = 'Up to 6 screenshots.';
        if (new Set(screenshots).size !== screenshots.length) errors.screenshots = 'Remove duplicate screenshot URLs.';
        if (screenshots.some((screenshot) => !isValidHttpUrl(screenshot))) errors.screenshots = 'Every screenshot needs a complete http:// or https:// URL.';
        if (!validOptionalUrl(data.demoVideo)) errors.demoVideo = 'Demo must be a complete http:// or https:// URL.';
    }

    if (step === 5) {
        const submitterName = data.submitterName.trim();
        if (submitterName.length < 2) errors.submitterName = 'Add at least two characters for your name.';
        else if (submitterName.length > 100) errors.submitterName = 'Keep your name under 100 characters.';
        if (!isValidEmail(data.submitterEmail)) errors.submitterEmail = 'Enter a valid email so we can reach you.';
        (['twitter', 'linkedin', 'youtube', 'github'] as const).forEach((key) => {
            if (!validOptionalUrl(data.socials[key] || '')) errors[`socials.${key}`] = 'Use a complete http:// or https:// URL, or leave it blank.';
        });
    }

    if (step === 6 && !data.agreeGuidelines) {
        errors.agreeGuidelines = 'You must agree to the editorial guidelines.';
    }

    return errors;
}

export function completion(data: FormData): number {
    let filled = 0;
    const total = 17;
    if (data.name.trim() && data.name.trim().length <= 60) filled++;
    if (data.tagline.trim() && data.tagline.trim().length <= 90) filled++;
    if (isValidHttpUrl(data.website)) filled++;
    if (data.category) filled++;
    if (data.audiences.length) filled++;
    if (data.description.trim().length >= 80 && data.description.trim().length <= 600) filled++;
    if (data.keyFeatures.filter((feature) => feature.trim()).length >= 3) filled++;
    if (data.pros.filter((pro) => pro.trim()).length >= 1) filled++;
    if (data.cons.filter((con) => con.trim()).length >= 1) filled++;
    if (!PRICING_META[data.pricing]?.needsPrice || validPriceText(data.startingPrice)) filled++;
    if (data.faqs.filter((faq) => faq.question.trim() && faq.answer.trim()).length >= 3) filled++;
    if (data.screenshots.length) filled++;
    if (data.submitterName.trim().length >= 2) filled++;
    if (isValidEmail(data.submitterEmail)) filled++;
    if (data.agreeGuidelines) filled++;
    return Math.round((filled / total) * 100);
}

export function normalizedPayload(data: FormData) {
    return {
        name: data.name.trim(), tagline: data.tagline.trim(), websiteUrl: data.website.trim(), logoUrl: data.logoUrl.trim(),
        category: data.category, audiences: data.audiences, description: data.description.trim(),
        keyFeatures: data.keyFeatures.map((value) => value.trim()).filter(Boolean),
        pros: data.pros.map((value) => value.trim()).filter(Boolean), cons: data.cons.map((value) => value.trim()).filter(Boolean),
        pricing: data.pricing, startingPrice: data.startingPrice.trim(), hasFreeTier: data.hasFreeTier,
        pricingTiers: data.pricingTiers.map((tier) => ({ ...tier,
            name: tier.name.trim(), description: tier.description.trim(), badge: tier.badge.trim(), ctaLabel: tier.ctaLabel.trim(), ctaUrl: tier.ctaUrl.trim(),
            monthlyPrice: tier.monthlyPrice.trim() ? Number(tier.monthlyPrice.trim()) : null,
            annualPrice: tier.annualPrice.trim() ? Number(tier.annualPrice.trim()) : null,
            features: tier.features.map((value) => value.trim()).filter(Boolean), limitations: tier.limitations.map((value) => value.trim()).filter(Boolean),
        })),
        faqs: data.faqs.map((faq) => ({ question: faq.question.trim(), answer: faq.answer.trim() })).filter((faq) => faq.question && faq.answer),
        screenshots: data.screenshots.map((value) => value.trim()).filter(Boolean), demoVideo: data.demoVideo.trim(),
        submitterName: data.submitterName.trim(), submitterEmail: data.submitterEmail.trim().toLowerCase(), submitterRole: data.submitterRole,
        socials: Object.fromEntries(Object.entries(data.socials).map(([key, value]) => [key, value?.trim()]).filter(([, value]) => value)),
        reviewNotes: data.reviewNotes.trim(), agreeGuidelines: data.agreeGuidelines, agreeContact: data.agreeContact,
    };
}

export function validateAll(data: FormData): Record<string, string> {
    return [0, 1, 2, 3, 4, 5, 6].reduce<Record<string, string>>((errors, step) => ({
        ...errors,
        ...validate(step, data),
    }), {});
}
