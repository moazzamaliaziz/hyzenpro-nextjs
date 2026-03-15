'use client';

interface SEOFieldsProps {
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        canonicalUrl?: string;
        ogImage?: string;
        ogTitle?: string;
        ogDescription?: string;
        twitterCard?: string;
        focusKeyword?: string;
        noIndex?: boolean;
    };
    onChange: (seo: any) => void;
    title?: string;
    slug?: string;
}

export default function SEOFields({ seo, onChange, title, slug }: SEOFieldsProps) {
    const update = (field: string, value: any) => {
        onChange({ ...seo, [field]: value });
    };

    const metaTitle = seo.metaTitle || title || '';
    const metaDesc = seo.metaDescription || '';
    const titleLength = metaTitle.length;
    const descLength = metaDesc.length;
    const focusKw = seo.focusKeyword || '';

    // SEO Score Calculator
    const calcScore = () => {
        let score = 0;
        let checks: { label: string; pass: boolean }[] = [];

        // Meta title length (50-60 chars ideal)
        const titleOk = titleLength >= 30 && titleLength <= 60;
        checks.push({ label: 'Meta title length (30-60 chars)', pass: titleOk });
        if (titleOk) score += 20;

        // Meta description length (120-160 chars ideal)
        const descOk = descLength >= 100 && descLength <= 160;
        checks.push({ label: 'Meta description length (100-160 chars)', pass: descOk });
        if (descOk) score += 20;

        // Focus keyword present
        const kwPresent = focusKw.length > 0;
        checks.push({ label: 'Focus keyword is set', pass: kwPresent });
        if (kwPresent) score += 15;

        // Focus keyword in meta title
        const kwInTitle = kwPresent && metaTitle.toLowerCase().includes(focusKw.toLowerCase());
        checks.push({ label: 'Focus keyword in meta title', pass: kwInTitle });
        if (kwInTitle) score += 15;

        // Focus keyword in slug
        const kwInSlug = kwPresent && slug ? slug.toLowerCase().includes(focusKw.toLowerCase().replace(/\s+/g, '-')) : false;
        checks.push({ label: 'Focus keyword in URL slug', pass: kwInSlug });
        if (kwInSlug) score += 15;

        // OG Image set
        const ogSet = !!(seo.ogImage);
        checks.push({ label: 'OG Image is set', pass: ogSet });
        if (ogSet) score += 15;

        return { score, checks };
    };

    const { score, checks } = calcScore();
    const scoreColor = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
    const scoreBg = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="space-y-6">
            {/* SEO Score */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading text-lg text-white">📊 SEO Score</h3>
                    <div className={`text-2xl font-bold ${scoreColor}`}>{score}/100</div>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mb-4">
                    <div className={`h-2 rounded-full transition-all duration-500 ${scoreBg}`} style={{ width: `${score}%` }} />
                </div>
                <div className="space-y-1.5">
                    {checks.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <span className={c.pass ? 'text-green-400' : 'text-red-400'}>{c.pass ? '✓' : '✗'}</span>
                            <span className={c.pass ? 'text-white/50' : 'text-white/70'}>{c.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* SERP Preview */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="font-heading text-lg text-white mb-4">🔍 Google SERP Preview</h3>
                <div className="bg-white rounded-lg p-4 text-left">
                    <div className="text-[#1a0dab] text-lg font-medium leading-tight truncate">
                        {metaTitle || 'Page Title — HyzenPro'}
                    </div>
                    <div className="text-[#006621] text-sm mt-1 truncate">
                        https://hyzenpro.com/{slug || 'page-url'}
                    </div>
                    <div className="text-[#545454] text-sm mt-1 line-clamp-2">
                        {metaDesc || 'Add a meta description to control what appears here in search results...'}
                    </div>
                </div>
                {titleLength > 60 && (
                    <p className="text-xs text-amber-400 mt-2">⚠ Title may be truncated in search results ({titleLength}/60 chars)</p>
                )}
                {descLength > 160 && (
                    <p className="text-xs text-amber-400 mt-1">⚠ Description may be truncated ({descLength}/160 chars)</p>
                )}
            </div>

            {/* Core SEO Fields */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="font-heading text-lg text-white mb-4">🏷️ Meta Tags</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">
                            Meta Title
                            <span className={`ml-2 text-xs ${titleLength > 60 ? 'text-red-400' : titleLength >= 30 ? 'text-green-400' : 'text-white/30'}`}>
                                {(seo.metaTitle || '').length}/60
                            </span>
                        </label>
                        <input type="text" value={seo.metaTitle || ''} onChange={(e) => update('metaTitle', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                            placeholder="Custom meta title (leave blank to use post title)" />
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">
                            Meta Description
                            <span className={`ml-2 text-xs ${descLength > 160 ? 'text-red-400' : descLength >= 100 ? 'text-green-400' : 'text-white/30'}`}>
                                {(seo.metaDescription || '').length}/160
                            </span>
                        </label>
                        <textarea value={seo.metaDescription || ''} onChange={(e) => update('metaDescription', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors resize-none" rows={3}
                            placeholder="Custom meta description for search engines" />
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">Focus Keyword</label>
                        <input type="text" value={seo.focusKeyword || ''} onChange={(e) => update('focusKeyword', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                            placeholder="Primary keyword for this page" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">Canonical URL</label>
                            <input type="url" value={seo.canonicalUrl || ''} onChange={(e) => update('canonicalUrl', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                                placeholder="https://..." />
                        </div>
                        <div>
                            <label className="block text-sm text-white/60 mb-1.5">OG Image URL</label>
                            <input type="url" value={seo.ogImage || ''} onChange={(e) => update('ogImage', e.target.value)}
                                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                                placeholder="https://..." />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={seo.noIndex || false} onChange={(e) => update('noIndex', e.target.checked)}
                            className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50" />
                        <span className="text-sm text-white/60">No Index (Hide from search engines)</span>
                    </label>
                </div>
            </div>

            {/* Social / Open Graph */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
                <h3 className="font-heading text-lg text-white mb-4">📱 Social Sharing</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">OG Title (Facebook, LinkedIn)</label>
                        <input type="text" value={seo.ogTitle || ''} onChange={(e) => update('ogTitle', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                            placeholder="Defaults to meta title if empty" />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">OG Description</label>
                        <textarea value={seo.ogDescription || ''} onChange={(e) => update('ogDescription', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors resize-none" rows={2}
                            placeholder="Defaults to meta description if empty" />
                    </div>
                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">Twitter Card Type</label>
                        <select value={seo.twitterCard || 'summary_large_image'} onChange={(e) => update('twitterCard', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none">
                            <option value="summary_large_image">Summary with Large Image</option>
                            <option value="summary">Summary</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
