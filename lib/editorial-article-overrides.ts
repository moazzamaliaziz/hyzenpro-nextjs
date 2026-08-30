import 'server-only';

export type EditorialArticleOverride = {
    title: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    seoTitle: string;
    seoDescription: string;
    updatedAt: string;
};

const AGENTROUTER_SIGNUP = 'https://agentrouter.org/register?aff=L5zz';
const AGENTROUTER_IMAGE = 'https://pub-a891e046fdd24f57a00b12e5d68c536a.r2.dev/media/2026/08/30/u14ttmbe_agent-router-dashboard.png';
const AGENTROUTER_VIDEO = 'https://drive.google.com/file/d/1D9oJOM8ZcndsnqLJWU9qPSSTjE-0BOqH/view?usp=drive_link';
const AGENTROUTER_VIDEO_PREVIEW = 'https://drive.google.com/file/d/1D9oJOM8ZcndsnqLJWU9qPSSTjE-0BOqH/preview';

const agentRouterContent = `
<p>Claude Code is powerful, but the normal setup can be confusing if you are not sure which account, API endpoint, or environment variable it expects. AgentRouter can act as a third-party gateway for compatible models, so you can try Claude Code with the credits and limits shown in your AgentRouter account instead of configuring a direct Anthropic API key.</p>

<p><strong>Important:</strong> “Free” means the promotional or free quota currently shown by AgentRouter, not unlimited usage. Quotas, supported models, access rules, and pricing can change. Check the dashboard before you start a long coding session, and never paste a real API key into a repository or commit it to Git.</p>

<figure class="article-media article-media-featured"><img src="${AGENTROUTER_IMAGE}" alt="AgentRouter dashboard showing the API access and model gateway interface" loading="eager" decoding="async" /><figcaption>The AgentRouter dashboard is where you create and manage the API key used by Claude Code.</figcaption></figure>

<div class="article-cta"><p><strong>Ready to create your gateway account?</strong> <a href="${AGENTROUTER_SIGNUP}" target="_blank" rel="noopener noreferrer">Create an AgentRouter account and check the current free quota</a>.</p></div>

<h2 id="before-you-start">Before you start</h2>
<p>You need a supported computer, an internet connection, a terminal, and a project you are comfortable allowing Claude Code to inspect. Current Claude Code documentation lists macOS 13+, Windows 10 1809 or newer, Ubuntu 20.04+, Debian 10+, Alpine 3.19+, and 4 GB or more of RAM as supported baselines. The AgentRouter integration guide lists Node.js 18 or newer for its CLI example.</p>
<ul><li>Use a personal test project first, not a production repository.</li><li>Keep your AgentRouter key private and use a placeholder while following this guide.</li><li>Install Git if you want a clean way to review and revert Claude Code changes.</li></ul>

<h2 id="step-1-install-claude-code">Step 1: Install Claude Code</h2>
<p>Anthropic now recommends its native installer. Use the command for your operating system, then open a new terminal if your shell does not immediately find the command.</p>
<h3 id="macos-linux-wsl">macOS, Linux, or WSL</h3>
<pre><code>curl -fsSL https://claude.ai/install.sh | bash</code></pre>
<h3 id="windows-powershell">Windows PowerShell</h3>
<pre><code>irm https://claude.ai/install.ps1 | iex</code></pre>
<p>If you prefer the package-manager route used in AgentRouter’s CLI guide and already manage global npm packages, this is also valid:</p>
<pre><code>npm install -g @anthropic-ai/claude-code@latest</code></pre>
<p>Verify the command before configuring the gateway:</p>
<pre><code>claude --version</code></pre>

<h2 id="step-2-create-agentrouter-key">Step 2: Create an AgentRouter key</h2>
<ol><li><a href="${AGENTROUTER_SIGNUP}" target="_blank" rel="noopener noreferrer">Open the AgentRouter registration page</a> and create an account.</li><li>Open the dashboard’s API-key or token area.</li><li>Create a key with the smallest permissions and quota that fit your test.</li><li>Copy it once into a password manager or another secure secret store. Do not place it in a committed file.</li></ol>
<p>The exact dashboard labels can change. If you do not see the same menu names, use the current AgentRouter documentation linked from the dashboard rather than guessing an endpoint or model ID.</p>

<h2 id="step-3-configure-anthropic-endpoint">Step 3: Configure Claude Code for the Anthropic-compatible endpoint</h2>
<p>Claude Code uses Anthropic’s protocol. AgentRouter’s current integration guidance distinguishes this from its OpenAI-compatible endpoint: for Claude models, use <code>https://co.agentrouter.org</code> <strong>without</strong> <code>/v1</code>. The key is supplied through <code>ANTHROPIC_AUTH_TOKEN</code>.</p>
<h3 id="macos-linux-configuration">macOS, Linux, or WSL</h3>
<p>These commands apply to the current terminal session only. Replace the placeholder with the key from your dashboard:</p>
<pre><code>export ANTHROPIC_AUTH_TOKEN="&lt;your-agentrouter-api-key&gt;"
export ANTHROPIC_BASE_URL="https://co.agentrouter.org"
export ANTHROPIC_MODEL="claude-opus-4-8"</code></pre>
<p>To persist non-secret settings, add the base URL and model to your shell profile. Prefer a secret manager or an untracked local environment file for the token. If you do add it to <code>~/.zshrc</code> or <code>~/.bashrc</code>, make sure that file is not shared or committed.</p>
<h3 id="windows-powershell-configuration">Windows PowerShell</h3>
<pre><code>$env:ANTHROPIC_AUTH_TOKEN="&lt;your-agentrouter-api-key&gt;"
$env:ANTHROPIC_BASE_URL="https://co.agentrouter.org"
$env:ANTHROPIC_MODEL="claude-opus-4-8"</code></pre>
<p>Open a new PowerShell session after setting persistent user-level variables so Claude Code receives the new values. Do not include a real token in screenshots, issue reports, or source control.</p>
<h3 id="why-v1-matters">Why the <code>/v1</code> detail matters</h3>
<p><code>/v1</code> is for AgentRouter’s OpenAI-compatible API. Adding it to the Anthropic-compatible Claude Code base URL can produce a 404 or an incompatible request. Conversely, removing it from an OpenAI-compatible client can do the same. Pick the protocol first, then use the matching endpoint.</p>

<figure class="article-media article-media-video"><div class="video-embed"><iframe src="${AGENTROUTER_VIDEO_PREVIEW}" title="Claude Code with AgentRouter setup walkthrough" loading="lazy" allow="autoplay; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><figcaption>Video walkthrough: creating the key, configuring Claude Code, and starting a test session. <a href="${AGENTROUTER_VIDEO}" target="_blank" rel="noopener noreferrer">Open the video in Google Drive</a> if the embedded player does not load.</figcaption></figure>

<h2 id="step-4-verify-configuration">Step 4: Verify the configuration safely</h2>
<p>Run these checks before asking Claude Code to edit anything:</p>
<pre><code>claude --version
claude doctor</code></pre>
<p><code>claude doctor</code> is a read-only diagnostic command. If it reports that a different provider or login is active, inspect your shell variables and restart Claude Code. Do not print the complete token in a public terminal recording.</p>

<h2 id="step-5-start-test-session">Step 5: Start a small test session</h2>
<p>Change into a disposable project directory and launch Claude Code:</p>
<pre><code>cd /path/to/a-test-project
claude</code></pre>
<p>Start with a read-only request such as:</p>
<pre><code>Read the project structure and summarize the main entry points. Do not edit files.</code></pre>
<p>Once the model responds, ask it to propose a small change without applying it. Review the proposed files, permissions, and diff before allowing an edit. A successful response confirms that the CLI can reach the configured gateway; it does not guarantee unlimited free usage or that every model is available to your account.</p>

<h2 id="model-selection-and-quotas">Model selection and quotas</h2>
<p>Use a model ID that appears in your AgentRouter account and is supported by the current integration guide. The example <code>claude-opus-4-8</code> is shown as a configuration example, not a promise that every account will have access to it. If the model is rejected, select an available Claude model from the dashboard and update <code>ANTHROPIC_MODEL</code>.</p>
<p>Watch quota, rate limits, context limits, and any provider-specific charges in the AgentRouter dashboard. A gateway may expose a model name while applying its own availability, routing, or usage policy.</p>

<h2 id="troubleshooting">Troubleshooting checklist</h2>
<h3 id="command-not-found">“claude: command not found”</h3><p>Open a new terminal, check that the installer directory is on your PATH, and rerun <code>claude --version</code>. On Windows, confirm that you are using the same PowerShell profile where the installer ran.</p>
<h3 id="authentication-error">Authentication or 401 errors</h3><p>Generate a fresh AgentRouter key, check for leading or trailing spaces, and confirm it is assigned to <code>ANTHROPIC_AUTH_TOKEN</code>. Do not use <code>ANTHROPIC_API_KEY</code> for this gateway configuration unless the current AgentRouter documentation explicitly tells you to.</p>
<h3 id="not-found-error">404 or unsupported endpoint errors</h3><p>For Claude Code’s Anthropic protocol, use <code>https://co.agentrouter.org</code> without <code>/v1</code>. For an OpenAI-compatible client, use the separate <code>https://co.agentrouter.org/v1</code> endpoint. Do not mix the two profiles.</p>
<h3 id="model-error">Model not found or unavailable</h3><p>Check the exact model ID shown in the AgentRouter dashboard. Model names and access can change, so do not rely on a copied value from an old tutorial.</p>
<h3 id="unexpected-billing">Unexpected usage or billing concerns</h3><p>Stop the session, review the gateway’s current quota and billing information, revoke a compromised key, and contact the provider if the account activity is not yours. The absence of an Anthropic API key does not mean a third-party gateway is risk-free or unlimited.</p>

<div class="article-cta"><p><strong>Try the setup with a fresh account.</strong> <a href="${AGENTROUTER_SIGNUP}" target="_blank" rel="noopener noreferrer">Check AgentRouter’s current free access and create your API key</a>.</p></div>

<h2 id="security-and-privacy">Security and privacy checklist</h2>
<ul><li>Never commit <code>ANTHROPIC_AUTH_TOKEN</code> to Git.</li><li>Use a separate key for experiments and revoke it when you finish.</li><li>Do not send private source code or credentials to a gateway unless your organization permits it.</li><li>Review the provider’s terms, retention policy, and current quota before using proprietary code.</li><li>Keep a local Git checkpoint before granting edit permissions.</li></ul>

<h2 id="final-verdict">Final verdict</h2>
<p>AgentRouter can simplify experimentation with Claude Code by providing a compatible gateway and a single account-level key. The reliable setup is straightforward: install Claude Code, create a key, use the Anthropic-compatible base URL without <code>/v1</code>, choose an available model, run diagnostics, and begin with a read-only test. Treat free access as quota-based and temporary, protect the key like a password, and verify the current AgentRouter dashboard whenever its endpoint or model catalog changes.</p>

<h2 id="sources">Sources</h2>
<ul><li><a href="https://code.claude.com/docs/en/setup" target="_blank" rel="noopener noreferrer">Claude Code setup documentation</a></li><li><a href="https://code.claude.com/docs/en/env-vars" target="_blank" rel="noopener noreferrer">Claude Code environment variables reference</a></li><li><a href="https://co.agentrouter.org/portal" target="_blank" rel="noopener noreferrer">AgentRouter third-party agent integration guide</a></li></ul>
`;

const overrides: Record<string, EditorialArticleOverride> = {
    'how-to-use-claude-code-free-with-agentrouter': {
        title: 'How to Use Claude Code Free With AgentRouter: A Safer, Step-by-Step Setup Guide',
        excerpt: 'A practical guide to installing Claude Code, creating an AgentRouter key, configuring the Anthropic-compatible endpoint, verifying the connection, and avoiding common endpoint and secret-management mistakes.',
        content: agentRouterContent,
        featuredImage: AGENTROUTER_IMAGE,
        seoTitle: 'How to Use Claude Code Free With AgentRouter: Setup Guide',
        seoDescription: 'Learn how to install Claude Code, connect it to AgentRouter with the correct Anthropic endpoint, verify the setup, troubleshoot errors, and protect your API key.',
        updatedAt: '2026-08-30T00:00:00.000Z',
    },
};

export function getEditorialArticleOverride(slug: string) {
    return overrides[slug];
}

export function applyEditorialArticleOverride<T extends Record<string, any>>(post: T): T {
    const override = getEditorialArticleOverride(String(post.slug));
    if (!override) return post;
    return {
        ...post,
        title: override.title,
        excerpt: override.excerpt,
        content: override.content,
        featuredImage: override.featuredImage,
        updatedAt: new Date(override.updatedAt),
    };
}

export const AGENTROUTER_ARTICLE_MEDIA = {
    image: AGENTROUTER_IMAGE,
    video: AGENTROUTER_VIDEO,
    videoPreview: AGENTROUTER_VIDEO_PREVIEW,
    signup: AGENTROUTER_SIGNUP,
};
