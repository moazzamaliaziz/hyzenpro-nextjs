# HyzenPro Admin Panel — Codebase Analysis Document

> **Purpose:** Provide this file to Claude Sonnet 4.6 (or similar) for admin panel improvement suggestions.
> **Note:** All secrets, API keys, and environment variable values have been removed/redacted.

---

## Project Overview

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js with credentials provider + TOTP 2FA
- **Deployment:** Vercel (Hobby plan — free)
- **Language:** TypeScript
- **Styling:** Tailwind CSS with OKLCH design tokens (warm editorial theme)

## Tech Stack Details

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Next.js 16, Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes (Route Handlers) |
| Database | PostgreSQL (Vercel Postgres or Supabase) |
| ORM | Prisma 6.x |
| Auth | NextAuth.js v5 (beta) with Credentials + TOTP adapter |
| Rich Text | Custom block editor + HTML importer |
| Media | Database-stored blobs with server-side image compression |
| Analytics | Google Analytics 4 + Ahrefs |
| Monetization | Google AdSense (managed via admin panel) |

## Database Models (Key Ones)

```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  name              String?
  passwordHash      String
  role              String    @default("user") // "admin" | "editor" | "user"
  isTwoFactorEnabled Boolean @default(false)
  twoFactorSecret   String?
  mustChangePassword Boolean @default(false)
  createdAt         DateTime  @default(now())
}

model Tool {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  shortDescription  String
  longDescription   String?  @db.Text
  logo              String?
  website           String?
  pricingType       String   @default("freemium")
  rating            Float?
  views             Int      @default(0)
  featured          Boolean  @default(false)
  status            String   @default("draft") // "draft" | "published" | "archived"
  primaryCategory   String?
  categoryIds       String[]
  personaPageIds    String[] // bidirectional many-to-many
  features          String[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  categories        Category[]
  personaPages      PersonaPage[]
}

model Post {
  id                String   @id @default(cuid())
  title             String
  slug              String   @unique
  content           String   @db.Text
  excerpt           String?
  status            String   @default("draft") // "draft" | "published" | "scheduled" | "trash"
  author            String?
  authorModel       Author?  @relation(fields: [author], references: [id])
  categories        String[]
  tags              String[]
  featuredImage     String?
  views             Int      @default(0)
  readingTime       Int?
  publishedAt       DateTime?
  scheduledAt       DateTime?
  focusKeyword      String?
  metaTitle         String?
  metaDescription   String?
  ogImage           String?
  canonicalUrl      String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model PersonaPage {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  status            String   @default("draft")
  heroTitle         String?
  heroSubtitle      String?
  heroImage         String?
  metaTitle         String?
  metaDescription   String?
  canonicalUrl      String?
  ogTitle           String?
  ogDescription     String?
  ogImage           String?
  focusKeyword      String?
  painPoints        Json     @default("[]")
  workflowSteps     Json     @default("[]")
  starterKit        Json     @default("[]")
  faq               Json     @default("[]")
  internalLinks     Json     @default("[]")
  crossLinks        Json     @default("[]")
  ctaText           String?
  ctaUrl            String?
  sortOrder         Int      @default(0)
  toolIds           String[] // bidirectional many-to-many with Tool
  publishedAt       DateTime?
  scheduledAt       DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  tools             Tool[]
}

model Category {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  description       String?
  toolCount         Int      @default(0)
  sortOrder         Int      @default(0)
  tools             Tool[]
}

model Review {
  id                String   @id @default(cuid())
  toolId            String
  toolSlug          String
  score             Int      @default(0)
  pros              String[]
  cons              String[]
  verdict           String
  content           String   @db.Text
  authorName        String?
  status            String   @default("draft")
  createdAt         DateTime @default(now())
}

model Author {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  role              String?
  bio               String?
  image             String?
  socialLinks       Json?
  posts             Post[]
}

model SiteContent {
  id                String   @id @default(cuid())
  sectionId         String   @unique
  title             String?
  subtitle          String?
  content           Json     @default("{}")
  enabled           Boolean  @default(true)
  sortOrder         Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model MediaAsset {
  id                String   @id @default(cuid())
  originalFileName  String
  fileName          String
  slug              String
  contentType       String
  extension         String
  size              Int
  width             Int?
  height            Int?
  title             String?
  altText           String?
  caption           String?
  description       String?
  focusKeyword      String?
  metaTitle         String?
  metaDescription   String?
  data              Bytes    @db.Buffer
  uploadedById      String?
  uploadedByEmail   String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model CTA {
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  headline          String?
  description       String?
  buttonText        String
  buttonUrl         String
  style             String   @default("default")
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model MatcherOverride {
  id                String   @id @default(cuid())
  category          String   @unique
  title             String?
  subtitle          String?
  content           Json     @default("{}")
  enabled           Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

---

## Admin Panel File Structure

```
app/admin/
├── page.tsx                          # Dashboard (stats, quick actions, recent activity)
├── layout.tsx                        # Admin layout with sidebar navigation
├── posts/
│   ├── page.tsx                      # List posts (filter by status, search)
│   ├── new/page.tsx                  # Create new post
│   └── [id]/page.tsx                 # Edit existing post
├── tools/
│   ├── page.tsx                      # List tools
│   ├── new/page.tsx                  # Create new tool
│   └── [id]/page.tsx                 # Edit existing tool
├── persona-pages/
│   ├── page.tsx                      # List persona pages
│   ├── new/page.tsx                  # Create persona page
│   └── [id]/page.tsx                 # Edit persona page
├── reviews/
│   ├── page.tsx                      # List reviews
│   ├── new/page.tsx                  # Create review
│   └── [id]/page.tsx                 # Edit review
├── categories/page.tsx               # Category management
├── authors/page.tsx                  # Author management
├── navigation/page.tsx               # Header/footer nav editor
├── media/page.tsx                    # Media library
├── ads/page.tsx                      # Ad management
├── ctas/page.tsx                     # CTA management
├── homepage/page.tsx                 # Homepage section editor
├── matchers/page.tsx                 # Find Tools quiz matcher config
├── matcher-analytics/page.tsx        # Matcher performance analytics
├── settings/
│   ├── page.tsx                      # Global settings (logo, nav, branding)
│   └── security/
│       ├── page.tsx                  # 2FA setup
│       ├── actions.ts                # Server actions for security
│       ├── SecuritySettingsClient.tsx # TOTP setup UI
│       └── PasswordSettingsClient.tsx # Password change UI
├── forgot-password/
│   ├── page.tsx                      # Forgot password request
│   └── ForgotPasswordForm.tsx
├── reset-password/
│   ├── page.tsx                      # Reset password with token
│   └── ResetPasswordForm.tsx
└── password-reset/
    └── actions.ts                    # Password reset server actions

components/admin/
├── BlockEditor.tsx                   # Gutenberg-style block editor (12 block types)
├── ContentScorer.tsx                 # SEO + readability + quality scoring
├── DeletePostButton.tsx              # Delete post with confirmation
├── DeleteToolButton.tsx              # Delete tool with confirmation
├── HtmlImporter.tsx                  # Import HTML from file/URL/paste
├── MediaLibraryClient.tsx            # Full media library with upload, metadata, search
├── MediaLibraryLink.tsx              # Media picker trigger button
├── PostForm.tsx                      # Blog post editor (with block editor, SEO, scheduling)
├── ReviewForm.tsx                    # Review editor
├── RichTextEditor.tsx                # Legacy rich text editor
├── SEOFields.tsx                     # SEO meta fields component
├── SlugInput.tsx                     # Auto-slug generator
└── ToolForm.tsx                      # Tool editor (with persona page assignment)

app/api/admin/
├── ads/route.ts                      # GET/PUT ad slot settings
├── authors/route.ts                  # GET/POST authors
├── authors/[id]/route.ts             # PUT/DELETE author
├── categories/route.ts               # GET categories
├── ctas/route.ts                     # GET/POST CTAs
├── ctas/[id]/route.ts                # PUT/DELETE CTA
├── directory/route.ts                # GET/PUT directory SEO content
├── homepage/route.ts                 # GET/PUT homepage sections
├── matchers/route.ts                 # GET/PUT matcher quiz configs
├── media/route.ts                    # GET/POST media assets (upload)
├── media/[id]/route.ts               # GET/PATCH/DELETE media asset
├── persona-pages/route.ts            # GET/POST persona pages
├── persona-pages/[id]/route.ts       # GET/PUT/DELETE persona page
├── persona-pages/assign-tools/route.ts # POST batch tool assignment
└── settings/route.ts                 # GET/PUT global settings

proxy.ts                              # Edge middleware — admin route protection
prisma/schema.prisma                  # Database schema
```

---

## Key Admin Files — Full Source Code

### 1. `app/admin/layout.tsx` — Admin Layout with Sidebar

```tsx
import Link from 'next/link';
import { LayoutDashboard, Box, Tags, FileText, Settings, LogOut, MessageSquare, Home, Menu as MenuIcon, Users, Megaphone, BarChart3, Images, Target, Sparkles, FileText as FileTextIcon } from 'lucide-react';
import { auth, signOut } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';
import { needsAdminSecuritySetup } from '@/lib/admin-security';
import prisma from '@/lib/prisma';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/admin/homepage', label: 'Homepage', icon: Home },
    { href: '/admin/navigation', label: 'Navigation', icon: MenuIcon },
    { href: '/admin/matchers', label: 'Matchers', icon: Sparkles },
    { href: '/admin/matcher-analytics', label: 'Matcher Analytics', icon: BarChart3 },
    { href: '/admin/tools', label: 'AI Tools', icon: Box },
    { href: '/admin/persona-pages', label: 'Persona Pages', icon: FileTextIcon },
    { href: '/admin/categories', label: 'Categories', icon: Tags },
    { href: '/admin/posts', label: 'Blog Posts', icon: FileText },
    { href: '/admin/media', label: 'Media Library', icon: Images },
    { href: '/admin/ads', label: 'Ad Management', icon: Megaphone },
    { href: '/admin/authors', label: 'Authors', icon: Users },
    { href: '/admin/ctas', label: 'CTAs', icon: Target },
    { href: '/admin/reviews', label: 'Reviews', icon: MessageSquare },
    { href: '/admin/directory', label: 'Directory SEO', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!isAdminSession(session)) return <>{children}</>;

    const adminUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true, isTwoFactorEnabled: true, mustChangePassword: true },
    });

    if (needsAdminSecuritySetup(adminUser)) return <>{children}</>;

    return (
        <div className="min-h-screen bg-black text-white flex">
            <aside className="w-64 border-r border-white/10 flex flex-col fixed inset-y-0 left-0 bg-black/95 backdrop-blur z-50">
                <div className="p-6 border-b border-white/10">
                    <Link href="/admin" className="font-heading text-2xl tracking-wider text-white hover:text-accent transition-colors">
                        HyzenPro Admin
                    </Link>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 space-y-1 px-4">
                    {navItems.map((item) => (
                        <Link key={item.href} href={item.href}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="p-4 border-t border-white/10">
                    <form action={async () => { 'use server'; await signOut({ redirectTo: '/admin' }); }}>
                        <button type="submit" className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors">
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium text-sm">Sign Out</span>
                        </button>
                    </form>
                </div>
            </aside>
            <main className="flex-1 ml-64 min-h-screen bg-black">
                <div className="p-8 max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}
```

### 2. `proxy.ts` — Admin Route Protection

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = request.nextUrl;

    // Protect admin routes
    if (pathname.startsWith('/admin') && pathname !== '/admin') {
        if (!token || token.role !== 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
        }
    }

    // Protect admin API routes
    if (pathname.startsWith('/api/admin')) {
        if (!token || token.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
};
```

### 3. `components/admin/ToolForm.tsx` — Tool Editor with Persona Page Assignment

```tsx
// [Full source: 486 lines]
// Key features:
// - Form fields: name, slug, shortDescription, longDescription, logo, website, pricingType, rating, primaryCategory, features, status
// - Persona page assignment checkboxes (sidebar)
// - Category multi-select
// - SEO fields (metaTitle, metaDescription, focusKeyword, ogImage, canonicalUrl)
// - Autosave support
// - Image upload for logo
// - JSON-LD structured data preview
```

### 4. `components/admin/PostForm.tsx` — Blog Post Editor

```tsx
// [Full source: 620+ lines]
// Key features:
// - Title, slug, content (block editor or raw HTML), excerpt
// - Status: draft, published, scheduled
// - Categories (multi-select), Tags (multi-input)
// - Featured image upload
// - Author selection
// - SEO fields (metaTitle, metaDescription, focusKeyword, ogImage, canonicalUrl)
// - Content scoring (SEO, readability, quality)
// - HTML import (from file, URL, or paste)
// - Autosave + revision history
// - Scheduling (publish at future date)
```

### 5. `components/admin/BlockEditor.tsx` — Gutenberg-Style Block Editor

```tsx
// [Full source: 450+ lines]
// 12 block types: paragraph, heading, image, code, quote, list, table, separator, button, video, callout, html
// Features: drag-to-reorder, duplicate, delete, block inserter grid
// Exports: blocksToHtml() and htmlToBlocks() converters
```

### 6. `components/admin/MediaLibraryClient.tsx` — Media Library

```tsx
// [Full source: 580+ lines]
// Features:
// - Drag-and-drop upload with progress
// - Image compression (sharp) on server
// - Metadata editing (title, alt, caption, description, SEO)
// - Search/filter assets
// - Usage detection (shows where image is used across site)
// - Schema.org ImageObject preview
// - Copy URL button
// - Delete protection (prevents deleting used images)
```

### 7. `components/admin/ContentScorer.tsx` — Content Analysis

```tsx
// [Full source: 200+ lines]
// Scores: overall, SEO, readability, quality
// SEO checks: title length, meta description, heading structure, image alt text, content length, internal links
// Readability: Flesch-Kincaid grade level
// Quality: word count, heading count, intro/conclusion presence, lexical diversity
```

### 8. `app/admin/page.tsx` — Dashboard

```tsx
// [Full source: 350+ lines]
// Features:
// - Stats grid: total tools, posts, categories, reviews, media assets
// - Secondary stats: total views, published tools, integrations (GA4, AdSense, 2FA status)
// - Top performing tools table (by views)
// - Quick actions (add tool, write post, upload media, manage ads, etc.)
// - Recent tools + posts activity feeds
// - Setup checklist (GA4, AdSense status)
// - Login screen with security setup flow (password change + 2FA)
```

### 9. API Routes — Auth Pattern

```typescript
// Every admin API route follows this pattern:
import { auth } from '@/lib/auth';
import { isAdminSession } from '@/lib/admin';

export async function GET() {
    const session = await auth();
    if (!isAdminSession(session)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ... business logic
}
```

### 10. `app/api/admin/persona-pages/route.ts` — Persona Pages CRUD

```typescript
// GET: List all persona pages with tool counts
// POST: Create persona page with tool slug resolution
//   - Resolves toolSlugs → toolIds
//   - Creates page with toolIds
//   - Syncs Tool.personaPageIds (bidirectional)
```

### 11. `app/api/admin/persona-pages/[id]/route.ts` — Persona Page Detail

```typescript
// GET: Fetch page with assigned tools
// PUT: Update page + sync tool assignments
//   - Computes removed/added toolIds
//   - Updates Tool.personaPageIds for each changed tool
// DELETE: Remove page + clean up all tool references
```

### 12. `app/api/admin/persona-pages/assign-tools/route.ts` — Batch Tool Assignment

```typescript
// POST: Batch assign tools to a persona page
//   - Accepts { pageId, toolSlugs[] }
//   - Computes diff (added/removed)
//   - Updates PersonaPage.toolIds and Tool.personaPageIds
```

### 13. `app/api/admin/media/route.ts` — Media Upload

```typescript
// GET: List assets with search, return upload limits
// POST: Upload image
//   - Validates MIME type (JPG, PNG, WebP, AVIF, GIF only — no SVG)
//   - Validates file size (max 5MB)
//   - Compresses image via sharp
//   - Stores binary data in database (Buffer)
//   - Returns serialized asset with URL
```

### 14. `components/admin/HtmlImporter.tsx` — HTML Import

```tsx
// Three import modes: file upload, URL fetch, paste HTML
// Server-side parsing via /api/posts/import
// Extracts: title, content, excerpt, featured image, headings, links, images
// Preview before applying to editor
```

### 15. `components/admin/SEOFields.tsx` — SEO Meta Fields

```tsx
// Fields: metaTitle (with char count), metaDescription (with char count),
// focusKeyword, ogImage, canonicalUrl
// Preview: Google search snippet preview
```

---

## Known Issues / Areas for Improvement

### Architecture
1. **No loading states** — Most admin pages are server components with no skeleton/loading UI
2. **No optimistic updates** — Forms do full page refreshes after mutations
3. **No error boundaries** — Admin pages lack error.tsx files
4. **No confirmation dialogs** — Delete operations use browser `confirm()` instead of proper modals
5. **Media stored in DB** — Binary image data stored as Buffer in PostgreSQL (should use object storage)

### Security
6. **Auth inconsistency** — Some routes use `isAdminSession()`, others manually check `session.user.role !== 'admin'`
7. **No CSRF protection** — API routes don't validate CSRF tokens
8. **No rate limiting** — Admin API routes have no rate limiting
9. **Password in URL** — Reset password tokens could leak via referrer

### UX
10. **No bulk operations** — Can't select multiple posts/tools for bulk delete/status change
11. **No drag-and-drop reordering** — Categories, persona pages lack sortable UI
12. **No real-time search** — Posts/tools lists require page reload for search
13. **No keyboard shortcuts** — No Cmd+K command palette in admin
14. **No dark/light mode toggle** — Admin is permanently dark

### Code Quality
15. **Duplicated auth checks** — Every API route repeats the same auth pattern (should be middleware)
16. **No Zod validation** — API routes manually validate request bodies
17. **No TypeScript strict mode** — Some `any` types in Prisma results
18. **Mixed styling approaches** — Some components use inline styles, others Tailwind
19. **No tests** — Zero test files in the admin panel

### Performance
20. **N+1 queries** — Dashboard makes 10+ parallel queries (should use a single aggregation)
21. **No pagination** — Posts/tools lists load all records
22. **No caching** — Admin pages don't use React cache or Next.js unstable_cache
23. **Large bundle** — Block editor, media library, and content scorer are large client components

### Missing Features
24. **No activity log/audit trail** — No tracking of who changed what
25. **No role-based access** — Only admin role exists (no editor/viewer roles)
26. **No scheduled publishing** — Posts have scheduledAt field but no cron job to publish
27. **No email notifications** — No alerts for comments, reviews, or system events
28. **No backup/export** — No way to export content or database
29. **No multi-language support** — No i18n in admin panel
30. **No webhook integrations** — No Slack/Discord notifications for admin actions

---

## Questions for Claude Sonnet 4.6

1. What's the most impactful architectural change you'd recommend for this admin panel?
2. How should we restructure the auth pattern to eliminate duplication across 15+ API routes?
3. Should we migrate media storage from DB blobs to object storage (S3/R2)? What's the migration path?
4. What's the best approach for adding loading states and optimistic updates to the server-component-heavy admin?
5. How would you implement a proper activity log without significant performance overhead?
6. Should we add a proper role system (admin/editor/viewer)? How would you model it with NextAuth?
7. What's the recommended approach for adding bulk operations to the posts/tools lists?
8. How would you add scheduled publishing without a paid cron service (Vercel Hobby plan)?
9. What testing strategy would you recommend for this codebase? Which tests give the most value?
10. How would you optimize the dashboard to avoid the N+1 query pattern?
