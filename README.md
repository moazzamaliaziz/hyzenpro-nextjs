# HyzenPro Next.js Frontend

Modern, lightning-fast frontend for HyzenPro using Next.js with static export.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **Framer Motion** - Animations
- **WordPress Headless** - Content management via GraphQL/REST

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production (static export)
npm run build

# Output files are in the 'out' folder
```

## Deployment

This project exports to static HTML files. Upload the `out` folder to any web hosting (Hostinger, Netlify, Cloudflare Pages, etc.).

### Deploy to Hostinger:

1. Run `npm run build`
2. Upload contents of `out` folder to `public_html`
3. Configure `.htaccess` for URL routing
4. Done!

## Project Structure

```
├── app/                 # Next.js App Router pages
│   ├── page.tsx        # Homepage
│   ├── layout.tsx      # Root layout
│   ├── globals.css     # Global styles
│   ├── ai-tools/       # AI Tools pages
│   └── blog/           # Blog pages
├── components/          # React components
├── lib/                # Utilities & API
│   └── wordpress.ts    # WordPress API client
└── public/             # Static assets
```

## WordPress Integration

This frontend fetches data from WordPress via GraphQL (WPGraphQL plugin) or REST API as fallback.

Required WordPress plugins:
- WPGraphQL
- WPGraphQL for ACF (optional)

## Environment Variables

Copy `.env.local` and update with your values:
- `WORDPRESS_API_URL` - Your GraphQL endpoint
- `NEXT_PUBLIC_GA_ID` - Google Analytics ID
- `NEXT_PUBLIC_ADSENSE_CLIENT` - AdSense publisher ID
