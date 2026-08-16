'use client';

import { useMemo, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

type MatcherItem = {
  category: string;
  title: string;
  subtitle: string;
  toolCount: number;
  readinessStatus: 'ready' | 'growing' | 'building' | 'empty';
  readinessLabel: string;
  readinessNote: string;
  isLaunchReady: boolean;
  updatedAt: string | null;
  enabled: boolean;
  content: unknown;
};

interface MatcherAdminClientProps {
  initialMatchers: MatcherItem[];
}

export default function MatcherAdminClient({ initialMatchers }: MatcherAdminClientProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialMatchers[0]?.category || '');
  const [drafts, setDrafts] = useState<Record<string, string>>(
    Object.fromEntries(
      initialMatchers.map((matcher) => [
        matcher.category,
        matcher.content ? JSON.stringify(matcher.content, null, 2) : '{}',
      ]),
    ),
  );
  const [enabledMap, setEnabledMap] = useState<Record<string, boolean>>(
    Object.fromEntries(initialMatchers.map((matcher) => [matcher.category, matcher.enabled])),
  );
  const [savingCategory, setSavingCategory] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedMatcher = useMemo(
    () => initialMatchers.find((item) => item.category === selectedCategory),
    [initialMatchers, selectedCategory],
  );

  async function handleSave() {
    if (!selectedMatcher) {
      return;
    }

    setSavingCategory(selectedMatcher.category);
    setMessage('');
    setError('');

    let parsedContent: Record<string, unknown>;
    try {
      parsedContent = JSON.parse(drafts[selectedMatcher.category] || '{}');
    } catch {
      setError('Matcher JSON is not valid. Please fix it before saving.');
      setSavingCategory('');
      return;
    }

    try {
      const res = await fetch('/api/admin/matchers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedMatcher.category,
          enabled: enabledMap[selectedMatcher.category],
          content: parsedContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save matcher config.');
      }

      setMessage(`Saved ${selectedMatcher.title}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save matcher config.');
    } finally {
      setSavingCategory('');
    }
  }

  if (!selectedMatcher) {
    return null;
  }

  const readinessTone =
    selectedMatcher.readinessStatus === 'ready'
      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
      : selectedMatcher.readinessStatus === 'growing'
        ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
        : 'border-white/10 bg-white/[0.05] text-white/70';

  return (
    <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
        <div className="px-3 pb-3">
          <h1 className="font-heading text-3xl text-white">Matchers</h1>
          <p className="mt-2 text-sm leading-6 text-white/60">
            Edit live matcher question sets, copy, and scoring overrides without touching code.
          </p>
        </div>

        <div className="space-y-2">
          {initialMatchers.map((matcher) => (
            <button
              key={matcher.category}
              type="button"
              onClick={() => {
                setSelectedCategory(matcher.category);
                setMessage('');
                setError('');
              }}
              className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                selectedCategory === matcher.category
                  ? 'border-accent/50 bg-white/10'
                  : 'border-white/10 bg-transparent hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-sm font-semibold text-white">{matcher.title}</div>
                <span
                  className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                    matcher.readinessStatus === 'ready'
                      ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                      : matcher.readinessStatus === 'growing'
                        ? 'border-amber-400/30 bg-amber-400/10 text-amber-100'
                        : 'border-white/10 bg-white/[0.04] text-white/60'
                  }`}
                >
                  {matcher.readinessLabel}
                </span>
              </div>
              <div className="mt-1 text-xs leading-5 text-white/50">{matcher.subtitle}</div>
              <div className="mt-3 text-[11px] uppercase tracking-[0.18em] text-white/35">
                {matcher.toolCount} live tools
              </div>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="font-heading text-2xl text-white">{selectedMatcher.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">{selectedMatcher.subtitle}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${readinessTone}`}>
                {selectedMatcher.readinessLabel}
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-white/35">
                {selectedMatcher.toolCount} live tools
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-xs leading-6 text-white/45">{selectedMatcher.readinessNote}</p>
            <p className="mt-2 text-xs text-white/40">
              Category key: <code className="font-mono text-white/60">{selectedMatcher.category}</code>
            </p>
          </div>

          <label className="inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={enabledMap[selectedMatcher.category]}
              onChange={(event) =>
                setEnabledMap((current) => ({
                  ...current,
                  [selectedMatcher.category]: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-white/20 bg-transparent"
            />
            Override enabled
          </label>
        </div>

        <div className="mt-6">
          <label className="mb-2 block text-sm text-white/60">Matcher Override JSON</label>
          <textarea
            value={drafts[selectedMatcher.category] || '{}'}
            onChange={(event) =>
              setDrafts((current) => ({
                ...current,
                [selectedMatcher.category]: event.target.value,
              }))
            }
            rows={28}
            spellCheck={false}
            className="w-full rounded-xl border border-white/10 bg-[#05070B] px-4 py-4 font-mono text-[13px] leading-6 text-white focus:border-accent/50 focus:outline-none"
          />
          <p className="mt-3 text-xs leading-5 text-white/40">
            Add only the fields you want to override, such as <code className="font-mono text-white/60">title</code>,
            <code className="font-mono text-white/60"> questions</code>, <code className="font-mono text-white/60">tools</code>,
            <code className="font-mono text-white/60"> faq</code>, or{' '}
            <code className="font-mono text-white/60">sponsoredPlacement</code>. Arrays replace the existing values for
            that matcher.
          </p>
          <p className="mt-3 text-xs leading-5 text-white/35">
            Example sponsor block:{' '}
            <code className="font-mono text-white/60">
              {`"sponsoredPlacement":{"badge":"Sponsored","headline":"Featured partner","body":"Short sponsor message.","ctaLabel":"Visit partner","ctaUrl":"https://example.com","disclosure":"Sponsored placement."}`}
            </code>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={savingCategory === selectedMatcher.category}
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-semibold text-black transition-colors hover:bg-accent/90 disabled:opacity-50"
          >
            {savingCategory === selectedMatcher.category ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Matcher
          </button>

          {message ? <p className="text-sm text-emerald-400">{message}</p> : null}
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </div>
      </section>
    </div>
  );
}
