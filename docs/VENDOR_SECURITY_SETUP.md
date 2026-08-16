# Vendor portal security setup (HyzenPro)

Follow these steps on your machine and in Cloudflare. **Do not commit real keys to GitHub.**

## 1. Cloudflare Turnstile (captcha)

1. Sign in to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Turnstile** → **Add site**.
2. Choose **Managed** widget, add your domain (`hyzenpro.com` and `www.hyzenpro.com`).
3. Copy **Site Key** and **Secret Key**.
4. Add to production environment (Vercel/hosting dashboard, not in git):

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_site_key_here
TURNSTILE_SECRET_KEY=your_secret_key_here
```

5. Redeploy the site. The vendor submit form will show the captcha widget.

If keys are missing in production, submissions are blocked when `TURNSTILE_SECRET_KEY` is set.

## 2. Rate limiting

Built-in limits (no extra keys):

| Endpoint | Limit |
|----------|--------|
| `POST /api/vendor/tools` | 8/hour per IP (API) + 30/15min (edge proxy) |
| `POST /api/tool-submissions` | 10/hour per IP |

For multi-server production, consider Cloudflare **WAF** rate rules on `/api/vendor/*`.

## 3. Fix existing 404 tool URLs

If tools were published with a missing or wrong category slug:

```bash
npx tsx scripts/fix-published-vendor-tools.ts
```

Then republish or save once in Admin → AI Tools so cache revalidates.

## 4. Secrets checklist

- `.env` and `.env.local` are in `.gitignore` — keep them local only.
- Never put `DATABASE_URL`, `AUTH_SECRET`, or `TURNSTILE_SECRET_KEY` in client code.
- Only `NEXT_PUBLIC_*` variables are exposed to the browser (site URL, Turnstile site key, AdSense client id).

## 5. Google AdSense

1. Ensure `NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-...` is set in production.
2. `public/ads.txt` must list your publisher id (already in repo).
3. Privacy policy should mention ads (see `/privacy-policy/`).

## 6. Recommended Cloudflare (DDoS)

On the zone for `hyzenpro.com`:

- **Security → Bots** → enable Bot Fight Mode (or Super Bot Fight on paid plans).
- **Security → WAF** → rate limit `POST` to `/api/*` if you see abuse.
- **SSL/TLS** → Full (strict).
