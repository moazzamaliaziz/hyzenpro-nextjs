'use client';

import type { CSSProperties, KeyboardEvent } from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, X, Shield, RefreshCw } from 'lucide-react';
import styles from './HeroSection.module.css';

const trustBadges = [
  { icon: Shield, label: 'No paid rankings' },
  { icon: RefreshCw, label: 'Re-tested every 30 days' },
];

interface HeroSectionProps {
  toolCount?: number;
  postCount?: number;
  categoryCount?: number;
}

export default function HeroSection({
  toolCount = 0,
  postCount = 0,
  categoryCount = 0,
}: HeroSectionProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const query = searchQuery.trim();
    if (!query) return;
    router.push(`/ai-tools-directory/?search=${encodeURIComponent(query)}`);
  };

  return (
    <section className={styles.heroSection} aria-labelledby="home-hero-heading">
      <div className={styles.inner}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          {toolCount} verified AI tools indexed
        </div>

        <h1 id="home-hero-heading" className={styles.headline}>
          Find the AI tool<br />
          <span>that actually fits.</span>
        </h1>

        <p className={styles.subtitle}>
          Independent reviews, side-by-side comparisons and field-tested
          buyer guides for the AI tools creators, marketers and small teams
          actually rely on.
        </p>

        {/* Trust Badges */}
        <div className={styles.trustBadges}>
          {trustBadges.map((badge, i) => (
            <span key={badge.label} className={styles.trustBadge}>
              {i > 0 && <span className={styles.trustDivider} aria-hidden="true" />}
              <badge.icon className={styles.trustIcon} aria-hidden="true" />
              {badge.label}
            </span>
          ))}
        </div>

        {/* Glass Search Box */}
        <div className={styles.searchBox}>
          <label className={styles.searchInner}>
            <Search className={styles.searchIcon} aria-hidden="true" />
            <span className="sr-only">Search AI tools</span>
            <input
              type="search"
              placeholder="Try 'video captions', 'coding', 'ElevenLabs'..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={handleSearch}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={styles.clearBtn}
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </label>

          <div className={styles.searchFooter}>
            <div className={styles.pillRow}>
              {['video', 'writing', 'coding'].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSearchQuery(s);
                    router.push(`/ai-tools-directory/?search=${encodeURIComponent(s)}`);
                  }}
                  className={styles.quickPill}
                >
                  {s}
                </button>
              ))}
            </div>
            <Link href="/compare/tools/" className={styles.compareCta}>
              Compare two tools <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
