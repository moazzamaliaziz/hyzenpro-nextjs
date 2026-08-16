# HyzenPro — 6 Persona Directory Pages: Implementation Plan

## Executive Summary

This plan implements 6 persona-first SEO directory pages for HyzenPro's AI tools directory, with a full admin CMS for content management. Each page targets a distinct audience segment (Creators, Marketers, Developers, Founders, Students, Agencies) with unique content, curated tool picks, and dedicated SEO metadata.

**Architecture Decision:** New `PersonaPage` Prisma model (not extending SiteContent) for clean relations, proper admin CRUD, and scalable queries.

---

## Phase 1: Database Schema (Prisma + MongoDB)

### New Model: `PersonaPage`

```prisma
model PersonaPage {
  id            String   @id @default(auto()) @map("_id") @db.ObjectId
  name          String                    // "Creators & YouTubers"
  slug          String   @unique          // "creators-youtubers"
  status        String   @default("draft") // draft, published, scheduled
  
  // Hero Section
  heroTitle     String?                   // "The Best AI Tools for Creators & YouTubers in 2026"
  heroSubtitle  String?                   // Body content (~400 words)
  heroImage     String?                   // Featured image URL
  
  // SEO
  metaTitle     String?                   // ≤60 chars
  metaDescription String?                 // ≤155 chars
  canonicalUrl  String?
  ogTitle       String?
  ogDescription String?
  ogImage       String?
  focusKeyword  String?
  
  // Content Sections (JSON for flexibility)
  painPoints    Json?                     // [{title, description, icon}]
  workflowSteps Json?                     // [{step, title, description}]
  starterKit    Json?                     // [{toolId, note}] — curated top picks
  faq           Json?                     // [{question, answer}]
  internalLinks Json?                     // [{label, href}]
  crossLinks    Json?                     // [{label, href, description}] — links to other persona pages
  
  // CTA
  ctaText       String?                   // "Browse all AI Video Tools →"
  ctaUrl        String?                   // "/ai-tools-directory/ai-video-tools/"
  
  // Display Control
  sortOrder     Int      @default(0)
  featuredImage String?
  
  // Tool Assignment (many-to-many via relation)
  toolIds       String[]  @db.Array @map("tool_ids") // ObjectId strings
  tools         Tool[]    @relation("PersonaTools")   // Prisma relation
  
  // Timestamps
  publishedAt   DateTime?
  scheduledAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@index([slug])
  @@index([status])
}
```

### Modified Model: `Tool`

Add relation field:

```prisma
model Tool {
  // ... existing fields ...
  personaPages  PersonaPage[] @relation("PersonaTools")
}
```

### Migration Strategy

1. `npx prisma db push` to sync schema to MongoDB
2. Seed script to create the 6 initial persona pages from the content brief
3. Assign existing tools to persona pages via seed script

---

## Phase 2: Admin System

### 2.1 Admin Navigation Update

**File:** `app/admin/layout.tsx`

Add to sidebar:
```
/persona-pages → Persona Pages (FileText icon)
```

### 2.2 Persona Pages List Page

**File:** `app/admin/persona-pages/page.tsx`

- Server component with auth check
- Table columns: Name, Slug, Status, Tools Count, Published Date, Actions
- Actions: Edit, Delete, View Live
- Status badges: draft (gray), published (green), scheduled (blue)
- Create button → `/admin/persona-pages/new`

### 2.3 Persona Page Form Component

**File:** `components/admin/PersonaPageForm.tsx`

Client component with sections:

#### Section 1: Basic Info
- Name (text input)
- Slug (SlugInput component, auto-generated from name)
- Status (select: draft/published/scheduled)
- Sort Order (number)

#### Section 2: Hero Section
- Hero Title (text input)
- Hero Subtitle (textarea — rich text)
- Featured Image (MediaLibraryLink)

#### Section 3: SEO
- Meta Title (text, ≤60 char counter)
- Meta Description (textarea, ≤155 char counter)
- Canonical URL (text)
- OG Title (text)
- OG Description (textarea)
- OG Image (MediaLibraryLink)
- Focus Keyword (text)

#### Section 4: Content Blocks
- Pain Points (dynamic list: add/remove items, each with title + description + icon)
- Workflow Steps (dynamic list: add/remove items, each with step number + title + description)
- Starter Kit (dynamic list: add/remove tools with notes)
- FAQ (dynamic list: add/remove Q&A pairs)
- Internal Links (dynamic list: add/remove link pairs)
- Cross Links (dynamic list: add/remove persona page links)

#### Section 5: Tool Assignment
- Searchable multi-select with checkboxes
- Shows: tool name, category, rating, pricing
- Filter by category, pricing, rating
- Selected tools shown as removable chips
- Drag-to-reorder for display priority

#### Section 6: CTA
- CTA Text (text)
- CTA URL (text)

### 2.4 API Routes

**New files:**
```
app/api/admin/persona-pages/route.ts          — GET (list) + POST (create)
app/api/admin/persona-pages/[id]/route.ts     — GET (single) + PUT (update) + DELETE
app/api/admin/persona-pages/assign-tools/route.ts — POST (batch assign tools)
```

**Pattern:** Follow existing admin API patterns with `auth()` + `isAdminSession()` check.

### 2.5 Admin Pages

```
app/admin/persona-pages/page.tsx              — List view
app/admin/persona-pages/new/page.tsx          — Create form
app/admin/persona-pages/[id]/page.tsx         — Edit form
```

---

## Phase 3: Frontend Pages

### 3.1 Dynamic Route

**File:** `app/ai-tools-directory/[persona]/page.tsx`

Server component with:
- `generateStaticParams()` for static generation
- `revalidate = 86400` (ISR 24h)
- Fetch persona page by slug
- Fetch assigned tools (ordered by display priority)
- 404 if not found or draft status

### 3.2 Page Sections (Component Tree)

```
<AnnouncementBar />
<Header />
<main>
  <Breadcrumbs> — Home > AI Tools Directory > [Page Name]
  
  <PersonaHero>
    - Hero Title (H1)
    - Hero Subtitle (body content)
    - Trust badges (Independently tested, Updated this month, Trusted by 40k readers)
    - CTA buttons (anchor to tools section + how we test link)
  
  <EditorTopPick>
    - First tool from starter kit or highest-rated tool
    - Featured card with rating, description, "Try" link
  
  <PainPoints>
    - "What [audience] keep getting stuck on"
    - 3 cards with icons, title, description
  
  <WorkflowSteps>
    - "A [N]-step stack that actually works"
    - Numbered steps with title + description
  
  <ToolsGrid>
    - "AI tools picked for [audience]"
    - UnifiedFilterPanel with assigned tools
    - Filter by pricing, rating, sort
  
  <StarterKit>
    - "If you only buy 3 tools..."
    - Top 3 curated picks with pricing and CTAs
  
  <PersonaFaq>
    - "Asked by [audience], answered honestly"
    - Accordion Q&A
  
  <CrossLinks>
    - "Who else is this for?"
    - 2-3 related persona page cards
  
  <DirectoryCTA>
    - "Want the whole directory?"
  
  <AIToolsSEOContent />
</main>
<Footer />
```

### 3.3 Component Files

```
components/persona/PersonaHero.tsx
components/persona/EditorTopPick.tsx
components/persona/PainPoints.tsx
components/persona/WorkflowSteps.tsx
components/persona/StarterKit.tsx
components/persona/PersonaFaq.tsx
components/persona/CrossLinks.tsx
```

### 3.4 SEO Metadata

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const page = await prisma.personaPage.findUnique({ where: { slug } });
  return {
    title: page.metaTitle || `${page.name} | HyzenPro`,
    description: page.metaDescription,
    alternates: { canonical: page.canonicalUrl || `https://hyzenpro.com/ai-tools-directory/${slug}/` },
    openGraph: { title: page.ogTitle, description: page.ogDescription, images: [page.ogImage] },
    robots: { index: true, follow: true },
  };
}
```

### 3.5 Structured Data

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "[Hero Title]",
  "description": "[Meta Description]",
  "url": "https://hyzenpro.com/ai-tools-directory/[slug]/",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://hyzenpro.com/" },
      { "@type": "ListItem", "position": 2, "name": "AI Tools Directory", "item": "https://hyzenpro.com/ai-tools-directory/" },
      { "@type": "ListItem", "position": 3, "name": "[Page Name]", "item": "https://hyzenpro.com/ai-tools-directory/[slug]/" }
    ]
  }
}
```

---

## Phase 4: Tool Assignment System

### 4.1 Assignment Flow

1. Admin opens tool edit form (`/admin/tools/[id]/edit`)
2. New section: "Persona Pages" with checkboxes for all 6 pages
3. Admin checks which pages the tool should appear on
4. On save, `PUT /api/tools/[id]` updates `personaPageIds` array
5. Also updates `PersonaPage.toolIds` arrays via cross-reference

### 4.2 Batch Assignment

Admin persona page form includes tool assignment panel:
- Fetches all published tools
- Shows selected tools with drag-to-reorder
- Save triggers batch update of both `Tool.personaPageIds` and `PersonaPage.toolIds`

### 4.3 Auto-Assignment Rules (Future)

Optional rules engine:
- Auto-assign tools to persona pages based on category
- Auto-assign tools with `featured: true` to relevant pages
- Configurable per-page in admin

---

## Phase 5: Performance & Caching

### 5.1 ISR Strategy

```typescript
// All persona pages
export const revalidate = 86400; // 24 hours
```

### 5.2 Cache Invalidation

```typescript
// On admin update
import { revalidatePath, revalidateTag } from 'next/cache';

// After saving persona page
revalidatePath(`/ai-tools-directory/${page.slug}/`);
revalidatePath('/ai-tools-directory/');
```

### 5.3 Database Queries Optimization

```typescript
// Single query with tool inclusion
const page = await prisma.personaPage.findUnique({
  where: { slug, status: 'published' },
  include: {
    tools: {
      where: { status: 'published' },
      select: {
        id: true, name: true, slug: true, shortDescription: true,
        logo: true, pricingType: true, rating: true, primaryCategory: true,
        views: true, featured: true,
      },
    },
  },
});
```

### 5.4 Static Generation

```typescript
export async function generateStaticParams() {
  const pages = await prisma.personaPage.findMany({
    where: { status: 'published' },
    select: { slug: true },
  });
  return pages.map(p => ({ persona: p.slug }));
}
```

---

## Phase 6: Content Seeding

### 6.1 Seed Script

**File:** `prisma/seed-persona-pages.ts`

Creates 6 persona pages from the content brief with:
- All SEO metadata
- Body content
- Tool assignments (by slug lookup)
- FAQ items
- Cross-links
- CTAs

### 6.2 Tool Assignment Mapping

From the content brief, each page has specific tool URLs. The seed script:
1. Looks up each tool by slug
2. Assigns it to the persona page
3. Sets display order based on the brief's table order

---

## Phase 7: Responsive Design & AdSense

### 7.1 Mobile Responsiveness

All persona page components follow existing patterns:
- `sm:grid-cols-2 lg:grid-cols-3` for tool grids
- Mobile drawer for filters (via UnifiedFilterPanel)
- Stack sections vertically on mobile
- Reduce heading sizes on mobile

### 7.2 AdSense Compliance

- Proper `AdSlot` placements between sections
- No intrusive interstitials
- Content-first layout
- Proper heading hierarchy (single H1, H2s for sections)
- Fast page loads (ISR + optimized queries)

---

## File Structure Summary

### New Files (Database)
```
prisma/seed-persona-pages.ts
```

### New Files (Admin)
```
app/admin/persona-pages/page.tsx
app/admin/persona-pages/new/page.tsx
app/admin/persona-pages/[id]/page.tsx
app/api/admin/persona-pages/route.ts
app/api/admin/persona-pages/[id]/route.ts
app/api/admin/persona-pages/assign-tools/route.ts
components/admin/PersonaPageForm.tsx
components/admin/PersonaPageList.tsx
```

### New Files (Frontend)
```
app/ai-tools-directory/[persona]/page.tsx
components/persona/PersonaHero.tsx
components/persona/EditorTopPick.tsx
components/persona/PainPoints.tsx
components/persona/WorkflowSteps.tsx
components/persona/StarterKit.tsx
components/persona/PersonaFaq.tsx
components/persona/CrossLinks.tsx
```

### Modified Files
```
prisma/schema.prisma                    — Add PersonaPage model + Tool relation
app/admin/layout.tsx                    — Add Persona Pages nav item
app/admin/tools/page.tsx                — Add persona page assignment column
components/admin/ToolForm.tsx           — Add persona page checkboxes
app/api/tools/route.ts                  — Handle personaPageIds in create
app/api/tools/[id]/route.ts             — Handle personaPageIds in update
```

---

## Implementation Order

| Step | Task | Estimated Lines |
|------|------|----------------|
| 1 | Prisma schema update + db push | ~50 |
| 2 | Seed script for 6 pages | ~400 |
| 3 | Admin API routes | ~200 |
| 4 | Admin UI (list + form) | ~600 |
| 5 | Tool assignment in ToolForm | ~100 |
| 6 | Frontend dynamic route + page | ~300 |
| 7 | Frontend components (7 components) | ~700 |
| 8 | SEO + structured data | ~100 |
| 9 | Responsive + AdSense | ~50 |
| 10 | Cache invalidation | ~30 |
| **Total** | | **~2,530** |

---

## Risk Mitigation

1. **MongoDB Array Queries:** `toolIds` stored as `String[]` — queries use `has` operator for membership checks
2. **Cache Staleness:** ISR 24h + manual revalidation on admin save ensures fresh content
3. **Tool Assignment Sync:** Use Prisma transactions to update both sides of the relation atomically
4. **SEO Migration:** Each page has canonical URL set — no duplicate content risk
5. **Admin UX:** Form validation for required fields (name, slug, metaTitle, metaDescription)
6. **Performance:** Single query with `include` for tools — no N+1 problem
7. **Fallback:** If persona page not found or draft → `notFound()` (404)
