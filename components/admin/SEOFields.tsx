'use client';

interface SEOFieldsProps {
    seo: {
        metaTitle?: string;
        metaDescription?: string;
        canonicalUrl?: string;
        ogImage?: string;
        focusKeyword?: string;
        noIndex?: boolean;
    };
    onChange: (seo: any) => void;
}

export default function SEOFields({ seo, onChange }: SEOFieldsProps) {
    const update = (field: string, value: any) => {
        onChange({ ...seo, [field]: value });
    };

    const titleLength = (seo.metaTitle || '').length;
    const descLength = (seo.metaDescription || '').length;

    return (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
            <h3 className="font-heading text-lg text-white mb-4">🔍 SEO Settings</h3>

            <div className="space-y-4">
                {/* Meta Title */}
                <div>
                    <label className="block text-sm text-white/60 mb-1.5">
                        Meta Title
                        <span className={`ml-2 text-xs ${titleLength > 60 ? 'text-red-400' : 'text-white/30'}`}>
                            {titleLength}/60
                        </span>
                    </label>
                    <input
                        type="text"
                        value={seo.metaTitle || ''}
                        onChange={(e) => update('metaTitle', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                        placeholder="Custom meta title (leave blank to auto-generate)"
                    />
                </div>

                {/* Meta Description */}
                <div>
                    <label className="block text-sm text-white/60 mb-1.5">
                        Meta Description
                        <span className={`ml-2 text-xs ${descLength > 160 ? 'text-red-400' : 'text-white/30'}`}>
                            {descLength}/160
                        </span>
                    </label>
                    <textarea
                        value={seo.metaDescription || ''}
                        onChange={(e) => update('metaDescription', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors resize-none"
                        rows={3}
                        placeholder="Custom meta description for search engines"
                    />
                </div>

                {/* Focus Keyword */}
                <div>
                    <label className="block text-sm text-white/60 mb-1.5">Focus Keyword</label>
                    <input
                        type="text"
                        value={seo.focusKeyword || ''}
                        onChange={(e) => update('focusKeyword', e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                        placeholder="Primary keyword for this page"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Canonical URL */}
                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">Canonical URL</label>
                        <input
                            type="url"
                            value={seo.canonicalUrl || ''}
                            onChange={(e) => update('canonicalUrl', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                            placeholder="https://..."
                        />
                    </div>

                    {/* OG Image */}
                    <div>
                        <label className="block text-sm text-white/60 mb-1.5">OG Image URL</label>
                        <input
                            type="url"
                            value={seo.ogImage || ''}
                            onChange={(e) => update('ogImage', e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:border-accent/50 focus:outline-none transition-colors"
                            placeholder="https://..."
                        />
                    </div>
                </div>

                {/* No Index */}
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={seo.noIndex || false}
                        onChange={(e) => update('noIndex', e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-accent focus:ring-accent/50"
                    />
                    <span className="text-sm text-white/60">No Index (Hide from search engines)</span>
                </label>
            </div>
        </div>
    );
}
