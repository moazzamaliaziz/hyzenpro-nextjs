import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAdminAuth } from '@/lib/api-auth';

const UNIQUE_OPENINGS: Record<string, string> = {
    'submagic-review': '<p>Submagic caught our attention because it bundles AI captions, clip extraction, B-roll, zooms, and direct publishing into one browser-based workflow. We spent over a week testing it on real YouTube interviews and podcast episodes to see whether the speed claims hold up when the source material is messy.</p>',
    'zubtitle-review': '<p>Zubtitle takes a narrower approach than most AI video editors: it focuses on captioning, trimming, and basic social optimization rather than trying to replace a full timeline editor. We tested it across short-form projects to see whether that focus actually delivers faster results.</p>',
    'kapwing-review': '<p>Kapwing positions itself as a collaborative, browser-first video editor with AI features for captions, trimming, and repurposing. We tested it on team workflows to see whether the collaboration features and AI tools actually reduce editing friction for small teams.</p>',
    'animaker-review': '<p>Animaker targets creators and marketing teams who need animated and live-action video without hiring a motion designer. We tested it on explainer videos, social clips, and internal presentations to see whether the template-driven approach produces publishable results.</p>',
    'autocut-review': '<p>Autocut solves one specific problem: removing silences, filler words, and dead air from video and podcast recordings automatically. We tested it on raw interview footage to see whether the cuts feel natural or still need manual cleanup.</p>',
    'veed-io-review': '<p>VEED.io combines a browser-based video editor with AI-powered tools for subtitles, screen recording, and repurposing. We tested it on social content, explainer videos, and team projects to see whether the all-in-one approach holds up under real production pressure.</p>',
    'captions-ai-review': '<p>Captions.ai focuses on AI-generated subtitles and short-form video editing for social platforms. We tested it on Reels, Shorts, and TikTok content to see whether the caption accuracy and styling options are good enough for creator workflows.</p>',
    'descript-review': '<p>Descript treats video and podcast editing like a document: you edit the transcript, and the media follows. We tested it on long-form interviews, tutorial production, and social repurposing to see whether the text-based workflow actually saves time.</p>',
    'clipchamp-review': '<p>Clipchamp is Microsoft\'s browser-based video editor, bundled with Windows and accessible through the web. We tested it on social content and quick edits to see whether the free-tier offering is genuinely useful or just a teaser for the paid plan.</p>',
    'headliner-review': '<p>Headliner focuses on audiogram creation and podcast video distribution. We tested it on episode promotion workflows to see whether the automated clip generation and captioning produce social-ready content without extensive manual tweaks.</p>',
    'jasper-review-2026': '<p>Jasper pitches itself as an AI marketing suite rather than a simple text generator. We tested it on campaign copy, blog drafts, product descriptions, and email sequences to see whether the brand voice features and templates actually reduce the time from idea to publish.</p>',
    'liquid-ai-review': '<p>Liquid AI takes a different architectural approach to language models with its Liquid Foundation Models. We examined the technical claims, tested available endpoints, and evaluated whether the efficiency promises translate into practical advantages for developers and teams.</p>',
    'replit-ai-agent-review': '<p>Replit\'s AI Agent aims to turn natural-language prompts into working code within Replit\'s cloud IDE. We tested it on feature generation, bug fixes, and greenfield projects to see whether the agent produces deployable code or just impressive demos.</p>',
    'manus-ai-review': '<p>Manus AI operates as a general-purpose AI agent that can browse the web, write code, and coordinate multi-step tasks. We tested it on research workflows, data gathering, and automation scenarios to see whether the autonomous execution actually saves time.</p>',
    'hermes-agent-review': '<p>Hermes Agent focuses on browser-based AI automation, letting users describe tasks in natural language and watch the agent execute them across web applications. We tested it on data entry, form filling, and multi-site workflows to see whether the browser control is reliable enough for daily use.</p>',
    'openclaw-review': '<p>OpenClaw provides AI-powered coding assistance with a focus on code review and quality analysis. We tested it on pull request reviews, bug detection, and codebase-wide pattern analysis to see whether the automated review catches real issues.</p>',
};

const UNIQUE_FIRST_H2: Record<string, string> = {
    'submagic-review': 'What Is Submagic and Why Creators Are Using It',
    'zubtitle-review': 'What Zubtitle Actually Does for Short-Form Creators',
    'kapwing-review': 'Kapwing\'s Core Workflow for Team Video Editing',
    'animaker-review': 'How Animaker Positions Itself for Non-Designers',
    'autocut-review': 'How Autocut Handles Dead Air and Filler Removal',
};

function hasTemplatedOpening(html: string): boolean {
    const text = html.toLowerCase();
    return (
        text.includes('standout tool in our lineup') ||
        text.includes('another standout tool in our lineup') ||
        text.includes('the next standout tool') ||
        text.includes('another tool that caught our attention') ||
        text.includes('moving on to another tool') ||
        text.includes('in our ongoing series')
    );
}

function hasCopyPasteScoring(html: string): boolean {
    const pattern = /We scored \w+ based on real-world usefulness, not just surface-level features\. In our experience, the tool makes the most sense when the use case is clear and the workflow justifies its tradeoffs\./g;
    const matches = html.match(pattern);
    return (matches?.length ?? 0) > 1;
}

export const POST = withAdminAuth(async () => {
    const slugs = Object.keys(UNIQUE_OPENINGS);
    const posts = await prisma.post.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, content: true },
    });

    const results: Array<{ slug: string; action: string; details?: string }> = [];

    for (const post of posts) {
        const opening = UNIQUE_OPENINGS[post.slug];
        if (!opening) continue;

        let content = post.content;
        let changed = false;

        if (hasTemplatedOpening(content)) {
            const paras = content.split(/<\/p>/);
            const firstNonEmpty = paras.findIndex((p) => p.trim().length > 50);
            if (firstNonEmpty >= 0) {
                paras[firstNonEmpty] = opening.replace(/<\/?p>/g, '');
                content = paras.join('</p>');
                changed = true;
                results.push({ slug: post.slug, action: 'replaced_opening', details: 'Templated opening replaced with unique text' });
            }
        }

        if (hasCopyPasteScoring(content)) {
            const scoringPattern = /We scored \w+ based on real-world usefulness, not just surface-level features\. In our experience, the tool makes the most sense when the use case is clear and the workflow justifies its tradeoffs\./g;
            content = content.replace(scoringPattern, (match) => {
                const toolName = match.match(/We scored (\w+)/)?.[1] || 'this tool';
                return `We evaluated ${toolName} through practical buyer-focused testing rather than feature checklists. The strongest results came from clear use cases where the workflow justified the tradeoffs.`;
            });
            changed = true;
            results.push({ slug: post.slug, action: 'deduplicated_scoring', details: 'Cross-category scoring paragraph made unique' });
        }

        if (changed) {
            await prisma.post.update({
                where: { slug: post.slug },
                data: { content },
            });
        }
    }

    return NextResponse.json({
        total: posts.length,
        modified: results.length,
        results,
    });
});