import { ImageResponse } from 'next/og';
import { TOOL_PAGE_CONTENT } from '@/data/tool-page-content';
import { TOOL_CATEGORY_THEMES } from '@/lib/tool-page';

export const runtime = 'edge';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

interface Props {
    params: Promise<{ category: string; slug: string }>;
}

function titleizeSlug(slug: string) {
    return slug
        .split('-')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

export default async function OpenGraphImage({ params }: Props) {
    const { category, slug } = await params;
    const theme = TOOL_CATEGORY_THEMES[category] || TOOL_CATEGORY_THEMES.default;
    const content = TOOL_PAGE_CONTENT[slug];
    const toolName = content?.displayName || (slug === 'make' ? 'Make' : titleizeSlug(slug));
    const tagline = content?.tagline || `Pricing, features, alternatives, and HyzenPro's honest review of ${toolName}.`;
    const reviewed = content?.lastReviewedDate || 'Updated recently';

    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    background: '#FFFFFF',
                    color: '#0F0F0F',
                    padding: '56px 64px',
                    fontFamily: 'Inter, Arial, sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        width: '100%',
                        height: '100%',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        padding: '44px',
                        background: '#FCFCFD',
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '32px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '760px' }}>
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: 18,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: '#6B7280',
                                }}
                            >
                                <span
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '999px',
                                        background: theme.accent,
                                    }}
                                />
                                HyzenPro AI Tool Review
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div
                                    style={{
                                        width: '96px',
                                        height: '96px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '8px',
                                        border: `2px solid ${theme.accent}`,
                                        background: '#FFFFFF',
                                        fontSize: 36,
                                        fontWeight: 700,
                                        color: theme.accent,
                                    }}
                                >
                                    {getInitials(toolName)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div
                                        style={{
                                            fontSize: 62,
                                            lineHeight: 1.05,
                                            fontWeight: 700,
                                            maxWidth: '620px',
                                        }}
                                    >
                                        {toolName}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: 24,
                                            lineHeight: 1.45,
                                            color: '#4B5563',
                                        }}
                                    >
                                        {tagline}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '14px',
                                alignItems: 'flex-end',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    minWidth: '182px',
                                    padding: '12px 18px',
                                    borderRadius: '999px',
                                    background: theme.accentSoft,
                                    color: theme.accent,
                                    fontSize: 18,
                                    fontWeight: 600,
                                }}
                            >
                                HyzenPro Verified
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-end',
                                    gap: '8px',
                                    color: '#6B7280',
                                    fontSize: 18,
                                }}
                            >
                                <div>Category</div>
                                <div style={{ color: '#0F0F0F', fontSize: 24, fontWeight: 600 }}>
                                    {category.replace(/^ai-/, '').replace(/-tools$/, '').replace(/-/g, ' ')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '24px',
                            borderTop: '1px solid #E5E7EB',
                            paddingTop: '24px',
                        }}
                    >
                        <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    border: '1px solid #E5E7EB',
                                    background: '#FFFFFF',
                                }}
                            >
                                <span style={{ fontSize: 18, color: '#6B7280' }}>Updated</span>
                                <span style={{ fontSize: 20, fontWeight: 600 }}>{reviewed}</span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    borderRadius: '8px',
                                    padding: '12px 16px',
                                    border: '1px solid #E5E7EB',
                                    background: '#FFFFFF',
                                }}
                            >
                                <span style={{ fontSize: 18, color: '#6B7280' }}>Includes</span>
                                <span style={{ fontSize: 20, fontWeight: 600 }}>Pricing, FAQ, alternatives</span>
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '14px 20px',
                                borderRadius: '8px',
                                background: theme.accent,
                                color: '#FFFFFF',
                                fontSize: 22,
                                fontWeight: 700,
                            }}
                        >
                            hyzenpro.com
                        </div>
                    </div>
                </div>
            </div>
        ),
        size
    );
}
