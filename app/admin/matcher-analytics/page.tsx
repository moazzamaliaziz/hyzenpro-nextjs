import { BarChart3, ExternalLink, Mail, MousePointerClick, Share2, Target } from 'lucide-react';
import { getMatcherAnalyticsOverview } from '@/lib/matcher-analytics';

export const metadata = {
  title: 'Matcher Analytics | HyzenPro Admin',
};

function formatCategoryLabel(value: string) {
  return value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function MatcherAnalyticsPage() {
  const analytics = await getMatcherAnalyticsOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-4xl text-white">Matcher Analytics</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-white/50">
          See how the matcher is actually performing across quiz starts, completions, lead capture, and sponsored-click
          activity. These numbers come from the live matcher event stream, not guesswork.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Quiz Starts',
            value: analytics.totals.starts,
            recent: analytics.recent.starts,
            icon: Target,
            tone: 'text-cyan-300 bg-cyan-400/10',
          },
          {
            label: 'Completions',
            value: analytics.totals.completions,
            recent: analytics.recent.completions,
            icon: BarChart3,
            tone: 'text-emerald-300 bg-emerald-400/10',
          },
          {
            label: 'Saved Leads',
            value: analytics.totals.leads,
            recent: analytics.recent.leads,
            icon: Mail,
            tone: 'text-amber-200 bg-amber-400/10',
          },
          {
            label: 'Sponsor Clicks',
            value: analytics.totals.sponsorClicks,
            recent: analytics.recent.sponsorClicks,
            icon: MousePointerClick,
            tone: 'text-fuchsia-200 bg-fuchsia-400/10',
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <div className="flex items-center justify-between">
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </span>
              <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Last 7d: {item.recent}</div>
            </div>
            <div className="mt-5 text-3xl font-heading text-white">{item.value.toLocaleString()}</div>
            <div className="mt-1 text-sm text-white/45">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Completion rate</div>
          <div className="mt-4 text-4xl font-heading text-white">{analytics.totals.completionRate}%</div>
          <p className="mt-3 text-sm leading-7 text-white/45">
            Percentage of matcher starts that reached a finished recommendation page.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Result shares</div>
          <div className="mt-4 text-4xl font-heading text-white">{analytics.totals.shares.toLocaleString()}</div>
          <p className="mt-3 text-sm leading-7 text-white/45">
            Copy-link shares coming from result pages. This is useful for seeing whether the matcher is creating
            portable recommendations.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <div className="text-[11px] uppercase tracking-[0.22em] text-white/35">Primary CTA clicks</div>
          <div className="mt-4 text-4xl font-heading text-white">{analytics.totals.primaryClicks.toLocaleString()}</div>
          <p className="mt-3 text-sm leading-7 text-white/45">
            Visits to the main recommended tool from the result flow, separate from sponsored partner clicks.
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.4fr_0.6fr]">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="font-heading text-2xl text-white">Category Performance</h2>
          <p className="mt-2 text-sm leading-7 text-white/45">
            This shows which matcher categories are actually moving users through the funnel.
          </p>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.22em] text-white/35">
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Starts</th>
                  <th className="px-3 py-3">Completion</th>
                  <th className="px-3 py-3">Leads</th>
                  <th className="px-3 py-3">Sponsor</th>
                  <th className="px-3 py-3">Shares</th>
                </tr>
              </thead>
              <tbody>
                {analytics.categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-6 text-sm text-white/40">
                      No matcher event data yet.
                    </td>
                  </tr>
                ) : (
                  analytics.categories.map((item) => (
                    <tr key={item.category} className="border-b border-white/5 text-sm text-white/70">
                      <td className="px-3 py-4">
                        <div className="font-medium text-white">{formatCategoryLabel(item.category)}</div>
                        <div className="mt-1 text-xs text-white/35">{item.completionRate}% completion</div>
                      </td>
                      <td className="px-3 py-4">{item.starts}</td>
                      <td className="px-3 py-4">{item.completions}</td>
                      <td className="px-3 py-4">{item.leads}</td>
                      <td className="px-3 py-4">{item.sponsorClicks}</td>
                      <td className="px-3 py-4">{item.shares}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <h2 className="font-heading text-2xl text-white">Top Results</h2>
            <div className="mt-5 space-y-4">
              {analytics.topResults.length === 0 ? (
                <p className="text-sm text-white/40">No completed matcher results yet.</p>
              ) : (
                analytics.topResults.map((item) => (
                  <div key={`${item.category}-${item.resultId}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-sm font-semibold text-white">{item.resultName || item.resultId}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.18em] text-white/35">
                      {formatCategoryLabel(item.category)}
                    </div>
                    <div className="mt-3 text-sm text-white/55">{item.completions} completions</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-white/60" />
              <h2 className="font-heading text-2xl text-white">Sponsor Destinations</h2>
            </div>
            <div className="mt-5 space-y-4">
              {analytics.sponsorDestinations.length === 0 ? (
                <p className="text-sm text-white/40">No sponsor clicks yet.</p>
              ) : (
                analytics.sponsorDestinations.map((item) => (
                  <div key={`${item.category}-${item.destination}`} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                    <div className="text-xs uppercase tracking-[0.18em] text-white/35">
                      {formatCategoryLabel(item.category)}
                    </div>
                    <div className="mt-2 break-all text-sm text-white/75">{item.destination}</div>
                    <div className="mt-3 flex items-center justify-between text-sm text-white/45">
                      <span>{item.clicks} clicks</span>
                      <a
                        href={item.destination}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-white/60 hover:text-white"
                      >
                        Open
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
