export type MatcherDiscoveryContext = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

const MATCHER_CONTEXTS: Record<string, MatcherDiscoveryContext> = {
  'ai-automation-tools': {
    eyebrow: 'Need a faster shortlist?',
    title: 'Use the automation matcher instead of browsing tool by tool.',
    description:
      'Answer a few workflow questions and we will narrow platforms like Make, Zapier, n8n, and Lindy based on complexity, control, and budget.',
    primaryHref: '/find-tools/automation-tool/',
    primaryLabel: 'Launch automation matcher',
    secondaryHref: '/find-tools/',
    secondaryLabel: 'Browse all matchers',
  },
  'ai-marketing-tools': {
    eyebrow: 'Matcher recommendation',
    title: 'Not sure which workflow tool fits your team?',
    description:
      'If the shortlist includes automation-heavy tools, the automation matcher is the fastest way to narrow the field before reading full reviews.',
    primaryHref: '/find-tools/automation-tool/',
    primaryLabel: 'Find the right automation tool',
    secondaryHref: '/find-tools/',
    secondaryLabel: 'See all matchers',
  },
  'ai-coding-tools': {
    eyebrow: 'Developer shortcut',
    title: 'Compare coding copilots with the matcher first.',
    description:
      'Use the coding assistant matcher to weigh IDE fit, privacy needs, and team usage before you commit to a tool like Copilot, Tabnine, or Replit.',
    primaryHref: '/find-tools/coding-assistant/',
    primaryLabel: 'Launch coding matcher',
    secondaryHref: '/find-tools/',
    secondaryLabel: 'Browse all matchers',
  },
  'ai-video-tools': {
    eyebrow: 'Creator shortcut',
    title: 'Find the right caption workflow before you commit.',
    description:
      'The caption matcher is built for creators and teams deciding between tools like VEED, Captions, and Submagic.',
    primaryHref: '/find-tools/caption-tool/',
    primaryLabel: 'Launch caption matcher',
    secondaryHref: '/find-tools/',
    secondaryLabel: 'Browse all matchers',
  },
  'ai-subtitle-generators': {
    eyebrow: 'Creator shortcut',
    title: 'Use the caption matcher to narrow the shortlist faster.',
    description:
      'Instead of opening every subtitle tool one by one, answer a few questions and get a cleaner recommendation path.',
    primaryHref: '/find-tools/caption-tool/',
    primaryLabel: 'Launch caption matcher',
    secondaryHref: '/find-tools/',
    secondaryLabel: 'Browse all matchers',
  },
};

const DEFAULT_CONTEXT: MatcherDiscoveryContext = {
  eyebrow: 'HyzenPro AI Tool Matcher',
  title: 'Want a faster path to the right AI tool?',
  description:
    'Use the matcher hub to move from broad browsing into a guided shortlist based on workflow, budget, and team context.',
  primaryHref: '/find-tools/',
  primaryLabel: 'Open the matcher hub',
  secondaryHref: '/ai-tools-directory/',
  secondaryLabel: 'Browse the full directory',
};

export function getMatcherDiscoveryContext(category?: string | null): MatcherDiscoveryContext {
  if (!category) {
    return DEFAULT_CONTEXT;
  }

  return MATCHER_CONTEXTS[category] || DEFAULT_CONTEXT;
}
