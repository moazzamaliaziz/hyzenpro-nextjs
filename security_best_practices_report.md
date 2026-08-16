# HyzenPro Security Best Practices Report

Generated: 2026-05-12  
Scope: `hyzenpro-nextjs` Next.js/TypeScript app, App Router route handlers, auth, public forms, media handling, dependency posture, and security headers.

## Executive Summary

The project has several good foundations: admin UI routes use server-side auth checks, most admin APIs now check for an admin session, uploaded media is stored in MongoDB rather than `public/`, SVG upload is blocked, passwords are bcrypt-hashed, sign-in has lockout/rate limiting, and global security headers exist.

The main risks are dependency vulnerabilities in the current installed package tree, missing CSRF/origin protections on cookie-authenticated state-changing route handlers, public analytics/lead endpoints that can be spammed into database growth, public browser source maps, and incomplete CSP/header hardening. No committed real `.env` file was found; only `.env.sentry.example` is tracked.

## High Severity

### SEC-001: Vulnerable Next.js, NextAuth/Nodemailer, and Prisma Dependency Tree

Rule IDs: `NEXT-SUPPLY-001`, `REACT-SUPPLY-001`  
Severity: High  
Location: `package.json:45-47`, `package.json:65`; installed tree confirmed by `npm list`

Evidence:

```json
"next": "^16.1.6",
"next-auth": "beta",
"nodemailer": "^7.0.7",
"prisma": "^6.0.0"
```

`npm audit --json` reported 11 total vulnerabilities: 10 high and 1 moderate. The installed tree includes `next@16.1.6`, `next-auth@5.0.0-beta.30`, `nodemailer@7.0.7`, `prisma@6.19.2`, and vulnerable transitive packages including `@auth/core`, `@prisma/config`, `effect`, `fast-uri`, `picomatch`, and `postcss`.

Impact: Attackers may be able to exploit framework-level DoS, middleware/proxy bypass, SSRF, cache poisoning, XSS, or mail parsing/SMTP injection bugs depending on runtime exposure and feature use.

Fix plan:

1. Upgrade `next` to a patched release outside the audited vulnerable ranges.
2. Upgrade `next-auth` to at least `5.0.0-beta.31` or the current stable supported Auth.js release compatible with the app.
3. Upgrade `nodemailer` to a patched `8.x` line if compatible, or to the minimum version required by the updated auth stack.
4. Upgrade `prisma` and `@prisma/client` together.
5. Run `npm audit --json`, `npm test`/lint if available, and `npm run build`.
6. Add a dependency update workflow such as Dependabot/Renovate plus a CI audit gate.

### SEC-002: Cookie-Authenticated Mutating APIs Lack Explicit CSRF/Origin Protection

Rule IDs: `NEXT-CSRF-001`, `REACT-CSRF-001`  
Severity: High  
Location: `proxy.ts:32-33`, representative handlers at `app/api/tools/route.ts:26-33`, `app/api/user/saved-tools/route.ts:37-45`, `app/api/admin/media/route.ts:81-88`

Evidence:

```ts
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
```

The proxy deliberately excludes `/api`. Route handlers then rely on cookie-backed `auth()` and parse JSON/form data without visible CSRF token or strict `Origin`/`Referer` validation:

```ts
export async function POST(request: NextRequest) {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
```

Impact: A malicious site could attempt cross-site POST/PUT/DELETE requests against authenticated users. SameSite cookies reduce some risk, but Route Handlers need application-level CSRF/origin defenses.

Fix plan:

1. Add a shared helper for mutating route handlers that validates `Origin`/`Referer` against `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_URL`, and approved deployment origins.
2. For higher assurance, add a CSRF token flow for authenticated JSON/form routes.
3. Apply it consistently to admin, vendor, saved-tool, media, post, review, CTA, settings, and matcher admin mutations.
4. Add tests that cross-origin mutating requests are rejected and same-origin requests still work.

## Medium Severity

### SEC-003: Public Matcher Analytics Endpoint Has No Rate Limit

Rule IDs: `NEXT-DOS-001`, `NEXT-INPUT-001`  
Severity: Medium  
Location: `app/api/matcher-events/route.ts:8-22`, `lib/matcher-analytics.ts:91-95`, client caller `lib/quiz-tracking.ts:25-31`

Evidence:

```ts
export async function POST(req: NextRequest) {
  const body = await req.json();
  ...
  await insertMatcherEvent(buildMatcherEventDocument(event, payload));
  return NextResponse.json({ ok: true }, { status: 201 });
}
```

The endpoint inserts directly into `MatcherEvent` for every accepted event. It validates the event name and truncates known string fields, but it has no IP/session rate limit, bot signal, request-size guard, or origin validation.

Impact: Attackers can inflate analytics, create unbounded database growth, and increase query cost for admin analytics pages.

Fix plan:

1. Add `consumeRateLimit` to `/api/matcher-events`, keyed by client IP and optionally by event/category.
2. Reject requests with a serialized body above a small threshold.
3. Validate `Origin` for browser-originated analytics.
4. Consider sampling or batching client events and adding TTL/retention indexes for analytics collections.

### SEC-004: Public Matcher Lead Endpoint Allows Unbounded Lead Inserts and Stores Arbitrary `answers`

Rule IDs: `NEXT-DOS-001`, `NEXT-INPUT-001`  
Severity: Medium  
Location: `app/api/matcher-leads/route.ts:8-17`, `app/api/matcher-leads/route.ts:27-41`

Evidence:

```ts
const answers = body.answers && typeof body.answers === 'object' ? body.answers : null;
...
await (prisma as any).$runCommandRaw({
  insert: 'MatcherLead',
  documents: [{ email, name, category, resultId, resultName, source, answers, createdAt: new Date() }],
});
```

The endpoint accepts unauthenticated lead submissions without rate limiting. `answers` is accepted as any object and inserted using raw Mongo command APIs.

Impact: Attackers can spam PII-like lead data, store large nested payloads, inflate database size, and degrade admin analytics.

Fix plan:

1. Add IP-based rate limiting comparable to contact/tool submission endpoints.
2. Replace the permissive `answers` object with a schema of allowed question/answer IDs and size limits.
3. Limit lengths for `category`, `resultId`, and `resultName`.
4. Prefer Prisma model APIs once the schema includes matcher lead/event models; if raw commands remain, keep strict schemas at the boundary.

### SEC-005: Production Browser Source Maps Are Publicly Enabled

Rule IDs: `REACT-CONFIG-001`, `REACT-SUPPLY-001`  
Severity: Medium  
Location: `next.config.js:5`, `next.config.js:103-105`

Evidence:

```js
productionBrowserSourceMaps: true,
...
sourcemaps: {
    deleteSourcemapsAfterUpload: false,
},
```

Impact: Public source maps make client source easier to inspect, reveal internal structure and endpoint names, and reduce the effort needed to exploit other bugs. This is usually not a direct vulnerability by itself, but it raises attacker leverage.

Fix plan:

1. Set `productionBrowserSourceMaps: false` unless public maps are intentionally required.
2. Keep Sentry upload enabled, but set `deleteSourcemapsAfterUpload: true`.
3. Verify deployed `/_next/static/**/*.map` files are not publicly retrievable.

### SEC-006: CSP Is Missing From Global Security Headers

Rule IDs: `NEXT-SESS-001`, `REACT-CSP-001`, `REACT-HEADERS-001`  
Severity: Medium  
Location: `next.config.js:31-48`

Evidence:

```js
headers: [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ...
]
```

The app sets useful headers, but no `Content-Security-Policy` or `frame-ancestors` policy is visible in code. `X-XSS-Protection` is obsolete and should not be treated as meaningful protection.

Impact: If XSS is introduced through rich text, admin content, third-party scripts, or dependency bugs, there is less browser-enforced damage control.

Fix plan:

1. Add a report-only CSP first.
2. Move to enforcement after verifying Sentry, inline styles, images, and analytics still work.
3. Include at minimum `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, constrained `img-src`, and constrained `connect-src`.
4. Remove or ignore `X-XSS-Protection`; keep `X-Frame-Options` as legacy defense while CSP `frame-ancestors` is deployed.

## Low Severity / Hardening

### SEC-007: In-Memory Rate Limiting Is Not Durable Across Serverless Instances

Rule IDs: `NEXT-DOS-001`  
Severity: Low to Medium depending on deployment scale  
Location: `lib/rate-limit.ts:12-22`

Evidence:

```ts
const store = globalForRateLimit.__hyzenproRateLimitStore ?? new Map<string, RateLimitBucket>();
```

Impact: On multi-instance or serverless deployments, attackers can bypass limits by hitting different instances or waiting for cold starts. Existing limits on sign-in, contact, reset, and submissions are still useful, but not strong enough as the only abuse control.

Fix plan:

1. Move abuse-prone limits to Redis/Upstash, Vercel KV, database counters, or edge/WAF rate limiting.
2. Keep the in-memory limiter as a local/dev fallback.
3. Add structured logging for rate-limit rejections without logging secrets or full request bodies.

### SEC-008: Local `.env` Files Exist But Are Ignored; Keep Them Out of Git and Rotate if Ever Committed

Rule ID: `NEXT-SECRETS-001`  
Severity: Low currently, Critical if real secrets were committed  
Location: `.gitignore:26-35`

Evidence:

`rg --files -g '.env*'` found `.env`, `.env.local`, and `.env.sentry.example`, while `git ls-files -- .env .env.local .env.sentry.example` showed only `.env.sentry.example` is tracked. `.gitignore` ignores `.env*.local` and `.env`.

Impact: Current state looks acceptable, but local env files are present in the workspace and should never be committed or printed in logs.

Fix plan:

1. Keep `.env` and `.env.local` untracked.
2. If either file was ever committed in previous history, rotate all contained secrets.
3. Keep examples placeholder-only.

## Positive Observations

- Admin page access uses server-side session checks.
- Most admin API routes now call `isAdminSession`.
- Password reset tokens are random, hashed, short-lived, and deleted after use.
- Sign-in has IP and identity rate limiting plus account lockout.
- Uploaded SVG is blocked, file size is bounded, and uploaded media is stored in MongoDB rather than under `public/`.
- Contact and public tool submission endpoints already have IP rate limiting and input cleanup.

## Recommended Fix Order

1. Patch dependencies and rerun `npm audit --json`.
2. Add CSRF/origin protection to all cookie-authenticated mutating route handlers.
3. Add rate limiting and schemas to matcher events and matcher leads.
4. Disable public source maps and keep private Sentry sourcemap upload.
5. Add CSP in report-only mode, then enforce it.
6. Move rate limiting to a durable shared backend or edge provider.

