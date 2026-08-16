import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const guideFooterLinks = [
  { href: '/blog/best-ai-tools-for-small-business-owners-2026/', label: 'Small Business AI Tools' },
  { href: '/blog/ai-automation-tools-save-15-hours-week/', label: 'AI Automation Guide' },
  { href: '/blog/how-to-choose-ai-writing-tool-2026/', label: 'AI Writing Tool Guide' },
  { href: '/blog/20-best-ai-marketing-tools-2026/', label: 'AI Marketing Tools' },
  { href: '/blog/20-best-ai-video-generation-tools-2026/', label: 'AI Video Tools' },
];

const blogFooterLinks = [
  { href: '/blog/', label: 'Latest Posts' },
  { href: '/blog/?category=reviews', label: 'Reviews' },
  { href: '/blog/?category=tutorials', label: 'Tutorials' },
  { href: '/blog/?category=comparisons', label: 'Comparisons' },
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function chartWrapper(id, html) {
  return `<!-- hyzen-chart:${id} -->\n${html.trim()}\n<!-- /hyzen-chart:${id} -->`;
}

function replaceChart(content, chart) {
  const wrapped = chartWrapper(chart.id, chart.html);
  const markerRegex = new RegExp(`<!-- hyzen-chart:${escapeRegExp(chart.id)} -->[\\s\\S]*?<!-- /hyzen-chart:${escapeRegExp(chart.id)} -->`, 'g');
  if (markerRegex.test(content)) {
    return content.replace(markerRegex, wrapped);
  }

  const pathRegex = escapeRegExp(chart.imagePath);
  const figureRegex = new RegExp(`<figure[^>]*>\\s*<img[^>]+src=["']${pathRegex}["'][^>]*>\\s*</figure>`, 'g');
  return content.replace(figureRegex, wrapped);
}

const charts = [
  {
    slug: 'best-ai-tools-for-small-business-owners-2026',
    id: 'small-business-stack',
    imagePath: '/images/blog/small-business-ai-stack-graph.svg',
    html: `
<section class="blog-chart blog-chart--bars" aria-label="Small business AI stack monthly budget chart">
  <div class="blog-chart__header">
    <div>
      <p class="blog-chart__eyebrow">Starter stack</p>
      <h3>Practical AI stack for a small business</h3>
    </div>
    <p class="blog-chart__note">Estimated monthly spend for one lean team using entry paid plans.</p>
  </div>
  <div class="blog-chart__bars">
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">AI writing and research</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 50%"></span></span><strong class="blog-chart__bar-value">$20-49</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Design and creative</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 30%"></span></span><strong class="blog-chart__bar-value">$15</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Automation workflows</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 40%"></span></span><strong class="blog-chart__bar-value">$10-29</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Social scheduling</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 24%"></span></span><strong class="blog-chart__bar-value">$6-24</strong></div>
  </div>
  <div class="blog-chart__legend"><span>Bar length shows share of a $100 monthly software budget.</span></div>
</section>`,
  },
  {
    slug: 'ai-automation-tools-save-15-hours-week',
    id: 'automation-hours',
    imagePath: '/images/blog/automation-hours-saved-graph.svg',
    html: `
<section class="blog-chart blog-chart--bars" aria-label="Weekly hours saved by AI automation workflows">
  <div class="blog-chart__header">
    <div>
      <p class="blog-chart__eyebrow">15 hour target</p>
      <h3>Where automation saves the week</h3>
    </div>
    <p class="blog-chart__note">Modeled from five repeatable workflows a lean operator can automate.</p>
  </div>
  <div class="blog-chart__bars">
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Content repurposing</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 100%"></span></span><strong class="blog-chart__bar-value">4.0h</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Meeting notes and follow-ups</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 88%"></span></span><strong class="blog-chart__bar-value">3.5h</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Lead routing and CRM updates</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 75%"></span></span><strong class="blog-chart__bar-value">3.0h</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Email triage</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 63%"></span></span><strong class="blog-chart__bar-value">2.5h</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Reporting snapshots</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 50%"></span></span><strong class="blog-chart__bar-value">2.0h</strong></div>
  </div>
  <div class="blog-chart__legend"><span>Total modeled saving: 15 hours per week.</span></div>
</section>`,
  },
  {
    slug: 'how-to-choose-ai-writing-tool-2026',
    id: 'writing-tool-comparison',
    imagePath: '/images/blog/ai-writing-tool-comparison-graph.svg',
    html: `
<section class="blog-chart blog-chart--cards" aria-label="AI writing tool buying criteria">
  <div class="blog-chart__header">
    <div>
      <p class="blog-chart__eyebrow">Decision weights</p>
      <h3>How to choose the right AI writing tool</h3>
    </div>
    <p class="blog-chart__note">Scores reflect the criteria that usually matter most before pricing.</p>
  </div>
  <div class="blog-chart__cards">
    <article class="blog-chart__card"><span class="blog-chart__metric">35%</span><strong>Content quality</strong><p>Long-form structure, factual control, editing effort, and brand voice consistency.</p></article>
    <article class="blog-chart__card"><span class="blog-chart__metric">25%</span><strong>SEO workflow</strong><p>Keyword research, SERP guidance, content scoring, and internal linking support.</p></article>
    <article class="blog-chart__card"><span class="blog-chart__metric">20%</span><strong>Team process</strong><p>Approvals, reusable templates, collaboration, and workspace controls.</p></article>
    <article class="blog-chart__card"><span class="blog-chart__metric">20%</span><strong>Total cost</strong><p>Seats, usage limits, add-ons, and whether the plan fits your publishing volume.</p></article>
  </div>
</section>`,
  },
  {
    slug: '20-best-ai-marketing-tools-2026',
    id: 'marketing-budget-stack',
    imagePath: '/images/blog/ai-marketing-stack-under-100-graph.svg',
    html: `
<section class="blog-chart blog-chart--bars" aria-label="AI marketing stack under 100 dollars per month">
  <div class="blog-chart__header">
    <div>
      <p class="blog-chart__eyebrow">Budget stack</p>
      <h3>AI marketing stack under $100/month</h3>
    </div>
    <p class="blog-chart__note">A realistic starter mix across writing, SEO, email, social, and CRM.</p>
  </div>
  <div class="blog-chart__bars">
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Writing assistant</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 20%"></span></span><strong class="blog-chart__bar-value">$20</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">SEO content planner</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 23%"></span></span><strong class="blog-chart__bar-value">$23</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Email marketing</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 10%"></span></span><strong class="blog-chart__bar-value">$10</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">Social scheduler</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 6%"></span></span><strong class="blog-chart__bar-value">$6</strong></div>
    <div class="blog-chart__bar-row"><span class="blog-chart__bar-label">CRM and outreach</span><span class="blog-chart__bar-track"><span class="blog-chart__bar" style="--value: 0%"></span></span><strong class="blog-chart__bar-value">$0</strong></div>
  </div>
  <div class="blog-chart__legend"><span>Example total: $59/month, leaving room for usage spikes or one paid add-on.</span></div>
</section>`,
  },
  {
    slug: '20-best-ai-video-generation-tools-2026',
    id: 'video-decision-framework',
    imagePath: '/images/blog/ai-video-tool-decision-framework.svg',
    html: `
<section class="blog-chart blog-chart--matrix" aria-label="AI video tool decision framework">
  <div class="blog-chart__header">
    <div>
      <p class="blog-chart__eyebrow">Decision framework</p>
      <h3>Pick by the video job, not the tool hype</h3>
    </div>
    <p class="blog-chart__note">Use this when skimming the list and matching tools to one clear workflow.</p>
  </div>
  <div class="blog-chart__matrix">
    <article class="blog-chart__card"><strong>Generate without filming</strong><p>Start with Runway, Kling, Sora, or Pika when the output is net-new footage.</p></article>
    <article class="blog-chart__card"><strong>Edit filmed footage</strong><p>Use VEED, Descript, or Captions.ai when the raw recording already exists.</p></article>
    <article class="blog-chart__card"><strong>Create avatar videos</strong><p>Use HeyGen or Synthesia when presenter consistency matters more than cinematic motion.</p></article>
    <article class="blog-chart__card"><strong>Repurpose long content</strong><p>Use OpusClip, Submagic, or Captions.ai when the goal is short clips at speed.</p></article>
    <article class="blog-chart__card"><strong>Turn text into video</strong><p>Use Pictory or InVideo when blog posts, scripts, or explainers are the source material.</p></article>
  </div>
</section>`,
  },
];

function normalizeFooterLinks(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([section, links]) => {
      if (!Array.isArray(links)) {
        return [];
      }

      const cleaned = links.flatMap((link) => {
        if (!link || typeof link !== 'object') {
          return [];
        }

        if (typeof link.href !== 'string' || typeof link.label !== 'string') {
          return [];
        }

        return [{ href: link.href, label: link.label }];
      });

      return cleaned.length > 0 ? [[section, cleaned]] : [];
    }),
  );
}

function mergeUniqueLinks(existing, additions) {
  const seen = new Set(existing.map((link) => link.href));
  return [
    ...existing,
    ...additions.filter((link) => {
      if (seen.has(link.href)) {
        return false;
      }
      seen.add(link.href);
      return true;
    }),
  ];
}

async function updateCharts() {
  for (const chart of charts) {
    const post = await prisma.post.findUnique({
      where: { slug: chart.slug },
      select: { id: true, slug: true, content: true },
    });

    if (!post) {
      console.warn(`missing post: ${chart.slug}`);
      continue;
    }

    const nextContent = replaceChart(post.content, chart);
    if (nextContent === post.content) {
      console.log(`unchanged chart: ${chart.slug}`);
      continue;
    }

    await prisma.post.update({
      where: { id: post.id },
      data: { content: nextContent },
    });
    console.log(`updated chart: ${chart.slug}`);
  }
}

async function updateFooterNav() {
  const footerNav = await prisma.siteContent.findUnique({
    where: { sectionId: 'footer-nav' },
  });
  const content = footerNav?.content && typeof footerNav.content === 'object' && !Array.isArray(footerNav.content)
    ? footerNav.content
    : {};
  const links = normalizeFooterLinks(content.links);
  const nextLinks = {
    ...links,
    Blog: links.Blog?.length ? mergeUniqueLinks(links.Blog, blogFooterLinks) : blogFooterLinks,
    Guides: mergeUniqueLinks(links.Guides || [], guideFooterLinks),
  };

  await prisma.siteContent.upsert({
    where: { sectionId: 'footer-nav' },
    update: {
      content: {
        ...content,
        links: nextLinks,
      },
    },
    create: {
      sectionId: 'footer-nav',
      title: 'Footer Navigation',
      content: { links: nextLinks },
      enabled: true,
      sortOrder: 0,
    },
  });
  console.log('updated footer guides');
}

try {
  await updateCharts();
  await updateFooterNav();
} finally {
  await prisma.$disconnect();
}
