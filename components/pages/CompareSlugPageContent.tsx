import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { getComparisonBySlug } from '@/lib/compare-data';
import { getBaseUrl } from '@/lib/utils';
import ComparisonBenchmarkChart from '@/components/compare/ComparisonBenchmarkChart';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import Footer from '@/components/layout/Footer';

function TapeRow({ label, left, right, leftWins, rightWins }: {
    label: string; left: string; right: string; leftWins?: boolean; rightWins?: boolean;
}) {
    return (
        <div className="grid grid-cols-[1fr_auto_1fr] items-center border-t border-border">
            <div className={`py-3 px-5 font-mono text-sm ${leftWins ? 'text-pine font-medium' : 'text-foreground/70'}`}>
                {leftWins && <span className="mr-1 text-[10px]">&#9664;</span>}
                {left}
            </div>
            <div className="py-3 px-3 text-center text-[11px] uppercase tracking-wider text-muted-foreground bg-background border-x border-border min-w-[100px]">
                {label}
            </div>
            <div className={`py-3 px-5 font-mono text-sm text-right ${rightWins ? 'text-pine font-medium' : 'text-foreground/70'}`}>
                {right}
                {rightWins && <span className="ml-1 text-[10px]">&#9654;</span>}
            </div>
        </div>
    );
}

function PriceCard({ title, lines, note }: { title: string; lines: { k: string; v: string }[]; note?: string }) {
    return (
        <div className="bg-card p-6 border border-border rounded-2xl">
            <h3 className="font-serif text-xl mb-5">{title}</h3>
            <div className="space-y-0">
                {lines.map((line, i) => (
                    <div key={i} className={`flex justify-between items-baseline py-2.5 ${i > 0 ? 'border-t border-border' : ''}`}>
                        <span className="text-sm text-foreground/70">{line.k}</span>
                        <span className="font-mono text-sm font-medium">{line.v}</span>
                    </div>
                ))}
            </div>
            {note && <p className="mt-4 text-xs text-muted-foreground leading-relaxed">{note}</p>}
        </div>
    );
}

function ProsConsCard({ title, pros, cons }: { title: string; pros: string[]; cons: string[] }) {
    return (
        <div className="bg-card p-6 border border-border rounded-2xl">
            <h3 className="font-serif text-xl mb-5">{title}</h3>
            <div className="space-y-0">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Pros</p>
                <ul className="space-y-2 mb-5">
                    {pros.map((pro, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground/80 leading-snug">
                            <span className="text-pine font-mono font-medium mt-0.5 flex-shrink-0">+</span>
                            {pro}
                        </li>
                    ))}
                </ul>
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-2">Cons</p>
                <ul className="space-y-2">
                    {cons.map((con, i) => (
                        <li key={i} className="flex gap-2 text-sm text-foreground/80 leading-snug">
                            <span className="text-brick font-mono font-medium mt-0.5 flex-shrink-0">&minus;</span>
                            {con}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function ReviewCard({ review }: { review: { modelId: string; source: string; url: string; paraphrase: string; sentiment: string } }) {
    const sentColors: Record<string, string> = {
        positive: 'bg-emerald-50 text-emerald-700',
        mixed: 'bg-amber-50 text-amber-700',
        negative: 'bg-red-50 text-red-700',
    };
    return (
        <div className="bg-card p-5 border border-border rounded-2xl flex gap-5">
            <div className="flex-shrink-0 min-w-[100px]">
                <p className="font-mono text-xs text-muted-foreground">{review.source}</p>
                <span className={`inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${sentColors[review.sentiment] || ''}`}>
                    {review.sentiment}
                </span>
            </div>
            <div>
                <p className="font-serif italic text-base leading-relaxed text-foreground/90">{review.paraphrase}</p>
                <a href={review.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-foreground/50 hover:text-foreground transition-colors">
                    Read the thread <ExternalLink className="w-3 h-3" />
                </a>
            </div>
        </div>
    );
}

function FaqItem({ q, a }: { q: string; a: string }) {
    return (
        <div className="border-t border-border py-5">
            <h4 className="font-serif text-lg mb-2">{q}</h4>
            <p className="text-sm text-foreground/70 max-w-2xl leading-relaxed">{a}</p>
        </div>
    );
}

function SectionHeader({ tag, title }: { tag: string; title: string }) {
    return (
        <div className="flex items-baseline gap-4 mb-7">
            <span className="font-mono text-xs text-brass tracking-[0.05em] whitespace-nowrap">{tag}</span>
            <h2 className="font-serif text-3xl">{title}</h2>
        </div>
    );
}

export default async function CompareSlugPageContent({ slug }: { slug: string }) {
    const comparison = getComparisonBySlug(slug);
    if (!comparison) notFound();

    const { hero, models, overview, featureComparisonTable, bestFor, prosCons, pricing, apiCostExample, whereToUse, keyFeatures, benchmarks, humanReviews, faq, lastVerified } = comparison;
    const modelA = models[0];
    const modelB = models[1];
    const baseUrl = getBaseUrl();

    const featureRows = featureComparisonTable.map((row) => {
        const keys = Object.keys(row).filter((k) => k !== 'feature');
        return { feature: row.feature, values: keys.map((k) => ({ key: k, value: row[k] })) };
    });

    const pricingA = pricing[modelA.dataKey] || {};
    const pricingB = pricing[modelB.dataKey] || {};

    const breadcrumbItems = [
        { label: 'Compare', href: '/compare/tools/' },
        { label: hero.headline },
    ];

    const jsonLdBreadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
            { '@type': 'ListItem', position: 2, name: 'Compare', item: `${baseUrl}/compare/tools/` },
            { '@type': 'ListItem', position: 3, name: hero.headline, item: `${baseUrl}/compare/${slug}/` },
        ],
    };

    const faqSchema = faq.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    } : null;

    const comparisonSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: hero.headline,
        description: hero.verdictOneLiner,
        url: `${baseUrl}/compare/${slug}/`,
        dateModified: lastVerified,
        isPartOf: {
            '@type': 'WebSite',
            name: 'HyzenPro',
            url: baseUrl,
        },
    };

    return (
        <>
            <main className="min-h-screen bg-background">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* ── Breadcrumbs ───────────────────────────────────── */}
                    <div className="pt-6 pb-2">
                        <Breadcrumbs items={breadcrumbItems} />
                    </div>

                    {/* ── Hero ────────────────────────────────────────── */}
                    <header className="pb-10 border-b border-border">
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.08] tracking-tight mb-5 max-w-2xl">
                            {hero.headline}
                        </h1>
                        <p className="text-lg text-foreground/60 max-w-2xl leading-relaxed mb-7">
                            {hero.subheadline}
                        </p>

                        <div className="bg-card border border-border border-l-[3px] border-l-brass rounded-lg p-5">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-brass block mb-2">The short answer</span>
                            <p className="text-sm text-foreground/70 leading-relaxed">{hero.verdictOneLiner}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-6 font-mono text-xs text-muted-foreground border-t border-border pt-4">
                            <span>Reviewed by <span className="text-foreground/70 font-medium">the HyzenPro editorial team</span></span>
                            <span className="text-border">|</span>
                            <span>Last verified <span className="font-medium">{lastVerified}</span></span>
                            <span className="text-border">|</span>
                            <span>Reader-funded, no paid placements</span>
                        </div>
                    </header>

                    {/* ── Tale of the Tape ────────────────────────────── */}
                    <section className="py-10 border-b border-border">
                        <SectionHeader tag="Overview" title="At a glance" />
                        <div className="grid grid-cols-[1fr_auto_1fr] border border-border rounded-2xl overflow-hidden bg-card">
                            <div className="p-5">
                                <p className="font-serif text-xl mb-0.5">{modelA.name}</p>
                                <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">{modelA.vendor}</p>
                            </div>
                            <div className="w-px bg-border" />
                            <div className="p-5 text-right">
                                <p className="font-serif text-xl mb-0.5">{modelB.name}</p>
                                <p className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">{modelB.vendor}</p>
                            </div>
                        </div>
                        <div className="border-x border-b border-border rounded-b-2xl overflow-hidden">
                            <TapeRow
                                label="Context"
                                left={modelA.contextWindow.split(' (')[0]}
                                right={modelB.contextWindow.split(' (')[0]}
                                leftWins={parseInt(modelA.contextWindow.replace(/,/g, '')) > parseInt(modelB.contextWindow.replace(/,/g, ''))}
                            />
                            {benchmarks.data.map((row) => {
                                const keys = Object.keys(row).filter((k) => k !== 'benchmark');
                                const vals = keys.map((k) => (typeof row[k] === 'number' ? row[k] : null)).filter((v) => v !== null) as number[];
                                const maxVal = Math.max(...vals);
                                return (
                                    <TapeRow
                                        key={row.benchmark}
                                        label={row.benchmark}
                                        left={row[keys[0]] != null ? `${row[keys[0]]}%` : '—'}
                                        right={row[keys[1]] != null ? `${row[keys[1]]}%` : '—'}
                                        leftWins={typeof row[keys[0]] === 'number' && row[keys[0]] === maxVal && vals.length > 1}
                                        rightWins={typeof row[keys[1]] === 'number' && row[keys[1]] === maxVal && vals.length > 1}
                                    />
                                );
                            })}
                        </div>
                    </section>

                    {/* ── Overview ────────────────────────────────────── */}
                    <section className="py-12 border-b border-border">
                        <SectionHeader tag="Overview" title="How they compare" />
                        <p className="text-foreground/70 leading-relaxed max-w-3xl">{overview}</p>
                    </section>

                    {/* ── Pricing ─────────────────────────────────────── */}
                    <section className="py-12 border-b border-border">
                        <SectionHeader tag="Pricing" title="What each one costs" />
                        <p className="text-sm text-foreground/60 mb-7 max-w-2xl">
                            Pricing varies by provider and tier. The right pick depends on whether you pay per token, per subscription, or self-host.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <PriceCard
                                title={modelA.name}
                                lines={Object.entries(pricingA).filter(([k]) => !['notes', 'subscriptions', 'subscriptionAccess', 'selfHosted'].includes(k)).map(([k, v]) => ({ k: k.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()), v }))}
                                note={pricingA.notes || pricingA.standardAfter || undefined}
                            />
                            <PriceCard
                                title={modelB.name}
                                lines={Object.entries(pricingB).filter(([k]) => !['notes', 'subscriptions', 'subscriptionAccess', 'selfHosted'].includes(k)).map(([k, v]) => ({ k: k.replace(/([A-Z])/g, ' $1').replace(/^./, (s: string) => s.toUpperCase()), v }))}
                                note={pricingB.notes || pricingB.standardAfter || undefined}
                            />
                        </div>
                        {apiCostExample && (
                            <p className="mt-4 text-sm text-foreground/60 leading-relaxed max-w-3xl">
                                <strong className="text-foreground/80">Real-world cost:</strong> {apiCostExample}
                            </p>
                        )}
                    </section>

                    {/* ── Benchmarks ──────────────────────────────────── */}
                    <section className="py-12 border-b border-border">
                        <SectionHeader tag="Benchmarks" title="Head-to-head numbers" />
                        <p className="text-sm text-foreground/60 mb-7 max-w-2xl">
                            Cross-lab benchmark methodology differs, so treat these as directional. The chart below shows each model&apos;s published scores on shared benchmarks.
                        </p>
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <ComparisonBenchmarkChart
                                data={benchmarks.data}
                                unit={benchmarks.unit}
                                sourceNote={benchmarks.sourceNote}
                                models={models}
                            />
                        </div>
                    </section>

                    {/* ── Feature Comparison Table ─────────────────────── */}
                    <section className="py-12 border-b border-border">
                        <SectionHeader tag="Features" title="Side-by-side capabilities" />
                        <div className="border border-border rounded-2xl overflow-hidden bg-card">
                            <div className="grid grid-cols-3 border-b border-border">
                                <div className="p-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Feature</div>
                                <div className="p-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground text-center">{modelA.name}</div>
                                <div className="p-4 font-mono text-[11px] uppercase tracking-wider text-muted-foreground text-center">{modelB.name}</div>
                            </div>
                            {featureRows.map((row, i) => (
                                <div key={i} className={`grid grid-cols-3 ${i < featureRows.length - 1 ? 'border-b border-border' : ''}`}>
                                    <div className="p-4 text-sm text-foreground/80">{row.feature}</div>
                                    <div className="p-4 text-sm text-center text-foreground/70 font-mono">{row.values[0]?.value || '—'}</div>
                                    <div className="p-4 text-sm text-center text-foreground/70 font-mono">{row.values[1]?.value || '—'}</div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Key Features ────────────────────────────────── */}
                    <section className="py-12 border-b border-border">
                        <SectionHeader tag="Features" title="Key capabilities" />
                        <div className="grid md:grid-cols-2 gap-8">
                            {[modelA, modelB].map((model) => (
                                <div key={model.id}>
                                    <h3 className="font-serif text-xl mb-4">{model.name}</h3>
                                    <ul className="space-y-0">
                                        {(keyFeatures[model.dataKey] || []).map((feat, i) => (
                                            <li key={i} className={`py-2.5 text-sm text-foreground/70 flex gap-3 ${i > 0 ? 'border-t border-border' : ''}`}>
                                                <span className="text-muted-foreground mt-0.5 flex-shrink-0">&mdash;</span>
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Pros & Cons ─────────────────────────────────── */}
                    <section className="py-12 border-b border-border">
                        <SectionHeader tag="Analysis" title="Pros &amp; cons" />
                        <div className="grid md:grid-cols-2 gap-4">
                            {[modelA, modelB].map((model) => {
                                const pc = prosCons[model.dataKey] || { pros: [], cons: [] };
                                return <ProsConsCard key={model.id} title={model.name} pros={pc.pros} cons={pc.cons} />;
                            })}
                        </div>
                    </section>

                    {/* ── Best For ────────────────────────────────────── */}
                    <section className="py-12 border-b border-border">
                        <SectionHeader tag="Use cases" title="Who should use which" />
                        <div className="grid md:grid-cols-2 gap-4">
                            {[modelA, modelB].map((model) => (
                                <div key={model.id} className="bg-card p-6 border border-border rounded-2xl">
                                    <h3 className="font-serif text-lg mb-4">Reach for {model.name.split(' ').pop()} if you&apos;re&hellip;</h3>
                                    <ul className="space-y-2">
                                        {(bestFor[model.dataKey] || []).map((item, i) => (
                                            <li key={i} className="flex gap-2 text-sm text-foreground/70 leading-snug">
                                                <span className="text-muted-foreground mt-0.5 flex-shrink-0">&mdash;</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Where to Use ─────────────────────────────────── */}
                    {whereToUse.length > 0 && (
                        <section className="py-12 border-b border-border">
                            <SectionHeader tag="Platforms" title="Where to use" />
                            <div className="flex flex-wrap gap-2">
                                {whereToUse.map((platform, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-card border border-border rounded-full text-xs text-foreground/70 font-medium">
                                        {platform}
                                    </span>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── Developer Reviews ────────────────────────────── */}
                    {humanReviews.length > 0 && (
                        <section className="py-12 border-b border-border">
                            <SectionHeader tag="Reviews" title="What developers actually say" />
                            <p className="text-sm text-foreground/60 mb-6 max-w-2xl">
                                Pulled from public threads, not submitted testimonials &mdash; paraphrased, with the source linked so you can read the full context.
                            </p>
                            <div className="space-y-3">
                                {humanReviews.map((review, i) => (
                                    <ReviewCard key={i} review={review} />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ── FAQ ─────────────────────────────────────────── */}
                    {faq.length > 0 && (
                        <section className="py-12 border-b border-border">
                            <SectionHeader tag="FAQ" title="Common questions" />
                            {faq.map((item, i) => (
                                <FaqItem key={i} q={item.q} a={item.a} />
                            ))}
                        </section>
                    )}

                    {/* ── Final Verdict ────────────────────────────────── */}
                    <section className="py-16 mb-0">
                        <div className="bg-foreground text-background rounded-2xl p-8 md:p-12">
                            <span className="font-mono text-[11px] uppercase tracking-wider text-background/40 block mb-4">Final read</span>
                            <h2 className="font-serif text-3xl mb-4">So which one do you actually pick?</h2>
                            <p className="text-background/70 max-w-2xl leading-relaxed mb-6">
                                {hero.verdictOneLiner}
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/blog/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brass text-foreground text-xs font-bold uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity">
                                    Read our reviews
                                </Link>
                                <Link href="/ai-tools-directory/" className="inline-flex items-center gap-2 px-5 py-2.5 border border-background/20 text-background text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-background/10 transition-colors">
                                    Browse the directory
                                </Link>
                            </div>
                        </div>
                    </section>

                </div>
            </main>

            <Footer />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
        </>
    );
}
