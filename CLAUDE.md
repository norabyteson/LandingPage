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

### Two apps, two root layouts
`app/` has two route groups with **separate root layouts** (navigating between them is a full page load):
- `app/(site)/`: the marketing site (landing, privacy, terms) with AdSense, GA, Lenis, theme scripts.
- `app/(demos)/`: the working demos at `/demos/<demo>`, with their own minimal root layout (no ads/GA/Lenis, `noindex`) and `demos.css`. Route files only; the demo code lives in the top-level `demos/` folder (see `demos/README.md`): `demos/shared/` (persistent store, toasts, formatting, seeded random) and one folder per demo (`demos/fluxpos/`: types, seed data, actions, calc, components, views). Each demo is client-only (`dynamic(..., { ssr: false })`), keeps fake data in `localStorage` and has a "Restablecer demo" reset. The site never imports from `demos/` and vice versa.
- `app/robots.ts`, `app/sitemap.ts` and `app/api/` sit outside both groups.

### i18n routing (`es` default, `en`)
- `proxy.ts` is the Next 16 replacement for `middleware.ts`: any path without a locale prefix is redirected to `/{locale}` based on `Accept-Language`, falling back to `es`. API, `_next`, `/demos/` and anything with a file extension are skipped.
- All pages live under `app/(site)/[lang]/`. `app/(site)/page.tsx` only redirects to the default locale.
- Strings come from `locales/{es,en}.json` via `getDictionary()` in `lib/i18n.ts`. The `Dictionary` type is inferred from the JSON, so **both files must keep identical keys**. Server pages load the dict and pass `dict`/`lang` down as props to the (mostly client) section components — components do not load dictionaries themselves.
- Exceptions: `app/(site)/[lang]/privacy` and `app/(site)/[lang]/terms` keep their es/en copy inline in the page file, and `components/ui/DemoViewer.tsx` holds its demo list and category labels inline.
- `<html lang>` is set three ways because the root layout can't see the route param: a blocking inline script in `app/(site)/layout.tsx`, plus `LangUpdater` on the client.
- When adding a route, also add it to `routes` in `app/sitemap.ts`.

### Theming (dark/light)
- Theme class (`dark`/`light`) on `<html>` is applied by a blocking script in `app/(site)/layout.tsx` (reads `localStorage['nb-theme']`, defaults to `light`) and toggled by `ThemeProvider` in `lib/theme.tsx`.
- `app/(site)/globals.css` is the single source of truth for color: `--ui-*` variables in `:root` (light) and `html.dark`, exposed to Tailwind by function, not hue: `canvas`/`surface` (backgrounds), `line` (borders), `ink`/`ink-muted`/`ink-subtle` (text), `brand`/`brand-soft`/`brand-ink`/`on-brand` (action). Components use those utilities (`bg-surface`, `text-ink-muted`, `border-line`…), never raw colors, so dark mode only redefines variables. `dark:` is bound to the `.dark` class, not `prefers-color-scheme`.
- Shared UI: `buttonClasses()` in `lib/ui.ts` (one look for every button/link-button; controls `rounded-xl`, media/cards `rounded-3xl`), `Reveal` in `components/ui/Reveal.tsx` (one-shot IntersectionObserver fade/rise, exposes `data-shown` for chained details), and `.landing-rise/.landing-pop/.landing-fade` CSS entrances. All motion honors `prefers-reduced-motion`.
- Entrance animations play once per tab (`lib/played.ts`, `sessionStorage['nb-played']`): every animated block carries `data-reveal="<unique key>"` (`Reveal` requires a `name`; CSS-only entrances like the Hero and `LegalPage` render `<MarkPlayed name=…>`). Already-seen keys are pinned to their final state by CSS in `document.adoptedStyleSheets`, built by a blocking script in `app/(site)/layout.tsx` before first paint, never by React state, so SSR and client markup stay identical (no hydration mismatch). Chained details that should also skip their transition need the `reveal-detail` class. Interaction motion (tab switch `landing-fade`, menus, hovers) is not affected.
- Design direction: minimal, Auxia-inspired (big tight headings, plain text blocks, hairline dividers, small motion). The user rejected decorative devices (bento grids, dark glow panels, scroll-progress timelines) as "looking AI-made".
- Windows dev quirk: Turbopack sometimes doesn't regenerate Tailwind when only `.tsx` files change; editing `globals.css` (or restarting `npm run dev`) forces it.

### Scrolling
Lenis smooth scrolling is set up globally in `LenisProvider` and exposed as `window.__lenis`. For programmatic scrolling use `smoothScrollTo()` from `lib/smooth-scroll.ts` (uses Lenis if present, honors `scroll-padding-top`).

### Demos
Two kinds, both opened in an iframe by `DemoViewer`: working apps at `/demos/<demo>` (FluxPOS, ArquitectOS and NexusERP; see "Two apps" above) and the remaining static mockups. `public/demos/**.html` are standalone static HTML mockups (use the vendored `public/demos/assets/vendors/tailwindcss.js`, not the app's Tailwind) shown in an iframe by `DemoViewer`. Demo URLs are listed in three places that must stay in sync: `DEMOS` in `DemoViewer.tsx`, `DEMOS` in `scripts/capture-demos.mjs`, and the `previews`/`demoNames` maps in `ServicesSection`. `DemoViewer` prefills the contact form by dispatching a `norabyte:prefill-service` window event that `ContactSection` listens for; the label comes from `serviceFormLabel()` in `ServicesSection`, which maps by array position (`SERVICE_IDS[i]` → `contact.form.services[i]`), so the order of `contact.form.services` in both locale files must match `SERVICE_IDS` — reordering either silently prefills the wrong service. Cache headers for `/demos` are set in `next.config.ts`.

Projects (`/[lang]/projects`, page in `app/(site)/[lang]/projects/`) are separate from the demos: our own live products (NorHud, Auxia; `kind: "project"`) and hosted demos (erp-demo.norabyte.com; `kind: "demo"`), linked in a new tab, never in `DemoViewer` (NorHud and Auxia send `frame-ancestors 'none'`). The landing only shows a preview (`ProjectsSection`, one card per item linking to `/[lang]/projects#<id>`); the full entries use `components/projects/ProjectDetail.tsx`. Copy lives in `projects` in the locale files; screenshots are `public/projects/<id>.webp` (1440×900), keyed by item `id` in `SCREENSHOTS`.

### Contact form
`app/api/contact/route.ts` validates with zod and sends two emails via nodemailer (to the team and a confirmation to the sender). The client form in `ContactSection` uses react-hook-form + zod.

### Analytics / ads
- GA4 is enabled only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` starts with `G-` (`lib/analytics/gtag.ts`); `GoogleAnalyticsNavigation` tracks client-side route changes.
- The AdSense publisher ID is a hard-coded constant in `lib/adsense.ts` on purpose (public, and avoids a forgotten Vercel env var); it is used in `app/(site)/layout.tsx` and must match `public/ads.txt`.

## Environment variables
`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `CONTACT_EMAIL` (contact API); `NEXT_PUBLIC_SITE_URL` (defaults to `https://norabyte.com`, used for metadata, sitemap, JSON-LD); `NEXT_PUBLIC_GA_MEASUREMENT_ID`; `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`. `.env*` files are gitignored.

## Git
`main` is production; work flows through `develop` (and feature branches) via PRs into `main`. Commit messages typically use `[ADD]` / `[MOD]` / `[Fix]` prefixes.
