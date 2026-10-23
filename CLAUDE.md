# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing landing page for NORABYTE (software agency in Hermosillo, Sonora, MX), deployed on Vercel at norabyte.com. Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript. Code comments, commit messages and user-facing copy are in Spanish; keep that convention.

## Commands

```bash
npm run dev                     # dev server on http://localhost:3000
npm run build                   # production build (also type-checks)
npm run lint                    # eslint (flat config, next core-web-vitals + typescript)
npx tsc --noEmit                # type-check only
npm run capture-demos           # puppeteer screenshots of the 9 demos -> public/demos/previews/ (needs `npm run dev` running)
npm run capture-hero-dashboard  # renders scripts/templates/dashboard-capture.html -> public/dashboard-assets/dashboard-{en,es}.webp
```

There is no test suite.

## Architecture

### i18n routing (`es` default, `en`)
- `proxy.ts` is the Next 16 replacement for `middleware.ts`: any path without a locale prefix is redirected to `/{locale}` based on `Accept-Language`, falling back to `es`. API, `_next` and anything with a file extension are skipped.
- All pages live under `app/[lang]/`. `app/page.tsx` only redirects to the default locale.
- Strings come from `locales/{es,en}.json` via `getDictionary()` in `lib/i18n.ts`. The `Dictionary` type is inferred from the JSON, so **both files must keep identical keys**. Server pages load the dict and pass `dict`/`lang` down as props to the (mostly client) section components — components do not load dictionaries themselves.
- Exceptions: `app/[lang]/privacy` and `app/[lang]/terms` keep their es/en copy inline in the page file, and `components/ui/DemoViewer.tsx` holds its demo list and category labels inline.
- `<html lang>` is set three ways because the root layout can't see the route param: a blocking inline script in `app/layout.tsx`, plus `LangUpdater` on the client.
- When adding a route, also add it to `routes` in `app/sitemap.ts`.

### Theming (dark/light)
- Theme class (`dark`/`light`) on `<html>` is applied by a blocking script in `app/layout.tsx` (reads `localStorage['nb-theme']`, defaults to `light`) and toggled by `ThemeProvider` in `lib/theme.tsx`.
- Colors are CSS variables (`--nb-*`, `--glass-*`, `--nb-section-*`, `--transition-*`). `config/theme.ts` is the intended single source of truth: `ThemeVarsInjector` writes its values as inline styles on `<html>` at runtime, overriding `app/globals.css`. `globals.css` holds fallback values (`:root` = dark, `html.light` overrides) for first paint — if you change a color in `config/theme.ts`, update the fallback in `globals.css` too, or the page flashes the old value before hydration.
- Components style with `var(--nb-…)` in Tailwind arbitrary values (e.g. `bg-[var(--nb-primary)]`). Note `--nb-dark`/`--nb-light` are semantic bg/fg and swap meaning in light mode.

### Scrolling
Lenis smooth scrolling is set up globally in `LenisProvider` and exposed as `window.__lenis`. For programmatic scrolling use `smoothScrollTo()` from `lib/smooth-scroll.ts` (uses Lenis if present, honors `scroll-padding-top`).

### Demos
`public/demos/**.html` are standalone static HTML mockups (use the vendored `public/demos/assets/vendors/tailwindcss.js`, not the app's Tailwind) shown in an iframe by `DemoViewer`. Demo URLs are listed in three places that must stay in sync: `DEMOS` in `DemoViewer.tsx`, `DEMOS` in `scripts/capture-demos.mjs`, and the preview image names used by `ServicesSection`. `DemoViewer` prefills the contact form by dispatching a `norabyte:prefill-service` window event that `ContactSection` listens for; the label comes from `serviceFormLabel()` in `ServicesSection`, which maps by array position (`SERVICE_IDS[i]` → `contact.form.services[i]`), so the order of `contact.form.services` in both locale files must match `SERVICE_IDS` — reordering either silently prefills the wrong service. Cache headers for `/demos` are set in `next.config.ts`.

### Contact form
`app/api/contact/route.ts` validates with zod and sends two emails via nodemailer (to the team and a confirmation to the sender). The client form in `ContactSection` uses react-hook-form + zod.

### Analytics / ads
- GA4 is enabled only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` starts with `G-` (`lib/analytics/gtag.ts`); `GoogleAnalyticsNavigation` tracks client-side route changes.
- The AdSense publisher ID is a hard-coded constant in `lib/adsense.ts` on purpose (public, and avoids a forgotten Vercel env var); it is used in `app/layout.tsx` and must match `public/ads.txt`.

## Environment variables
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `CONTACT_EMAIL` (contact API); `NEXT_PUBLIC_SITE_URL` (defaults to `https://norabyte.com`, used for metadata, sitemap, JSON-LD); `NEXT_PUBLIC_GA_MEASUREMENT_ID`; `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. `.env*` files are gitignored.

## Git
`main` is production; work flows through `develop` (and feature branches) via PRs into `main`. Commit messages typically use `[ADD]` / `[MOD]` / `[Fix]` prefixes.
