import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx === -1) continue;
        const key = trimmed.substring(0, eqIdx).trim();
        let value = trimmed.substring(eqIdx + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        process.env[key] = value;
    }
}

const prisma = new PrismaClient();

const TOOL_LOGO_MAP = {
    'captions-ai': '/images/tool-logos/captions.png',
    gamma: '/images/tool-logos/gamma.png',
    'github-copilot': '/images/tool-logos/github_copilot.png',
    'hubspot-smart-crm': '/images/tool-logos/hubspot.jpeg',
    'lindy-ai': '/images/tool-logos/lindy_ai.jpeg',
    'liquid-ai': '/images/tool-logos/liquid_ai.jpg',
    make: '/images/tool-logos/make.jpeg',
    n8n: '/images/tool-logos/n8n.png',
    replit: '/images/tool-logos/replit.jpeg',
    submajic: '/images/tool-logos/submagic.jpeg',
    tabnine: '/images/tool-logos/tabnine.jpg',
    uipath: '/images/tool-logos/uipath.png',
    'veed-io': '/images/tool-logos/veed.png',
    zapier: '/images/tool-logos/zapier.jpeg',
};

function assertLogoFilesExist() {
    const missing = Object.entries(TOOL_LOGO_MAP)
        .filter(([, publicPath]) => !fs.existsSync(path.join(rootDir, 'public', publicPath.replace(/^\//, ''))))
        .map(([slug, publicPath]) => `${slug} -> ${publicPath}`);

    if (missing.length > 0) {
        throw new Error(`Missing logo files:\n${missing.join('\n')}`);
    }
}

async function main() {
    assertLogoFilesExist();

    const slugs = Object.keys(TOOL_LOGO_MAP);
    const tools = await prisma.tool.findMany({
        where: { slug: { in: slugs } },
        select: { id: true, name: true, slug: true, logo: true },
        orderBy: { slug: 'asc' },
    });

    const foundSlugs = new Set(tools.map((tool) => tool.slug));
    const missingTools = slugs.filter((slug) => !foundSlugs.has(slug));

    for (const tool of tools) {
        const logo = TOOL_LOGO_MAP[tool.slug];
        await prisma.tool.update({
            where: { id: tool.id },
            data: { logo },
        });
        console.log(`Updated ${tool.slug} (${tool.name}) -> ${logo}`);
    }

    if (missingTools.length > 0) {
        console.log(`No matching tool record for: ${missingTools.join(', ')}`);
    }

    console.log(`Updated ${tools.length} tool logos.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
