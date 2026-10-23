# Graph Report - LandingPage  (2026-10-23)

## Corpus Check
- Corpus is ~36,932 words - fits in a single context window. You may not need a graph.

## Summary
- 337 nodes · 610 edges · 13 communities (10 shown, 3 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.85)
- Token cost: 274,582 input · 0 output

## Community Hubs (Navigation)
- Localized Routes & Metadata
- Ecommerce & Landing Demos
- Page Sections & Contact Form
- Contact API & Dev Tooling
- Root Layout & Theming
- Demo Viewer & Custom Demos
- Screenshot Capture Scripts
- TypeScript Config
- Navigation & Smooth Scroll
- Runtime Dependencies
- Image Divider
- PostCSS Config

## God Nodes (most connected - your core abstractions)
1. `next` - 21 edges
2. `cn()` - 19 edges
3. `Locale` - 17 edges
4. `compilerOptions` - 16 edges
5. `react` - 15 edges
6. `isValidLocale()` - 13 edges
7. `SectionBadge()` - 12 edges
8. `framer-motion` - 12 edges
9. `getDictionary()` - 11 edges
10. `lucide-react` - 11 edges

## Surprising Connections (you probably didn't know these)
- `getDictionary()` --shares_data_with--> `locales/{es,en}.json dictionaries`  [EXTRACTED]
  lib/i18n.ts → CLAUDE.md
- `i18n Routing (es default, en)` --references--> `routes`  [EXTRACTED]
  CLAUDE.md → app/sitemap.ts
- `ContactSection()` --references--> `norabyte:prefill-service window event`  [EXTRACTED]
  components/sections/ContactSection.tsx → CLAUDE.md
- `DemoViewer()` --references--> `ArquitectOS demo (staff management for architecture firms)`  [INFERRED]
  components/ui/DemoViewer.tsx → public/demos/custom/arquitectos.html
- `DemoViewer()` --references--> `FluxPOS demo (point of sale system)`  [INFERRED]
  components/ui/DemoViewer.tsx → public/demos/custom/fluxpos.html

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Demo URL lists that must stay in sync** — components_ui_demoviewer_demoviewer, scripts_capture_demos, claude_static_demo_mockups [EXTRACTED 1.00]
- **Theme color sources that must agree (config, injector, CSS fallback)** — config_theme, components_ui_themevarsinjector_themevarsinjector, claude_globals_css_fallback, lib_theme_themeprovider [EXTRACTED 1.00]
- **Custom demos sharing vendored Tailwind, inline tailwind.config and icon normalizer boilerplate** — public_demos_custom_arquitectos, public_demos_custom_fluxpos, public_demos_custom_nexuserp, claude_vendored_tailwindcss [INFERRED 0.95]
- **Duplicated Material Symbols whitespace normalizer across demo pages** — public_demos_ecommerce_casamarket_material_symbols_normalizer, public_demos_ecommerce_luxemode_material_symbols_normalizer, public_demos_ecommerce_tueste_material_symbols_normalizer, public_demos_landing_aura_material_symbols_normalizer, public_demos_landing_dentalux_material_symbols_normalizer, public_demos_landing_gastronomo_material_symbols_normalizer [EXTRACTED 1.00]
- **Per-demo Tailwind configs using Material Design 3 color roles** — public_demos_ecommerce_casamarket_tailwind_config, public_demos_ecommerce_luxemode_tailwind_config, public_demos_ecommerce_tueste_tailwind_config, public_demos_landing_aura_tailwind_config, public_demos_landing_dentalux_tailwind_config, public_demos_landing_gastronomo_tailwind_config, material_design_3_color_tokens [INFERRED 0.85]
- **Demos localized to Hermosillo, Sonora businesses** — public_demos_ecommerce_tueste, public_demos_landing_dentalux, public_demos_landing_gastronomo, hermosillo_sonora [EXTRACTED 1.00]

## Communities (13 total, 3 thin omitted)

### Community 0 - "Localized Routes & Metadata"
Cohesion: 0.10
Nodes (30): generateMetadata(), LangLayout(), LangLayoutProps, viewport, generateMetadata(), Page(), PageProps, PageProps (+22 more)

### Community 1 - "Ecommerce & Landing Demos"
Cohesion: 0.06
Nodes (47): Hermosillo, Sonora (demo business location), Material Design 3 color role tokens (surface/on-surface/primary-container...), NORABYTE developer credit (norabyte.com), CasaMarket demo (home decor e-commerce catalog), Catalog filter sidebar (categories, price range, brands, rating), CasaMarket Material Symbols whitespace normalizer script, Catalog pagination controls, CasaMarket product grid with add-to-cart cards (+39 more)

### Community 2 - "Page Sections & Contact Form"
Cohesion: 0.09
Nodes (37): AboutSection(), AboutSectionProps, ContactSection(), ContactSectionProps, createSchema(), FieldWrapper(), FormStatus, FormValues (+29 more)

### Community 3 - "Contact API & Dev Tooling"
Cohesion: 0.05
Nodes (40): contactSchema, Environment variables (SMTP_*, CONTACT_EMAIL, NEXT_PUBLIC_*), eslintConfig, devDependencies, eslint, eslint-config-next, puppeteer, tailwindcss (+32 more)

### Community 4 - "Root Layout & Theming"
Cohesion: 0.07
Nodes (31): geistMono, geistSans, langInitScript, metadata, RootLayout(), themeInitScript, viewport, app/globals.css fallback theme values (+23 more)

### Community 5 - "Demo Viewer & Custom Demos"
Cohesion: 0.11
Nodes (24): locales/{es,en}.json dictionaries, norabyte:prefill-service window event, Vendored tailwindcss.js (public/demos/assets/vendors), DemoViewer(), ArquitectOS demo (staff management for architecture firms), Directorio de Empleados table, Material Symbols text whitespace normalizer script, Employee profile glass-card side panel (+16 more)

### Community 6 - "Screenshot Capture Scripts"
Cohesion: 0.11
Nodes (17): npm scripts (dev, build, lint, capture-demos, capture-hero-dashboard), puppeteer, DEMOS, __dirname, OUT_DIR, ROOT, VIEWPORT, __dirname (+9 more)

### Community 7 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 8 - "Navigation & Smooth Scroll"
Cohesion: 0.19
Nodes (12): Navbar(), NavbarProps, CATEGORY_LABELS, Demo, DEMOS, DemoViewerProps, SmoothScroll(), easeInOutQuart() (+4 more)

### Community 9 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, clsx, flag-icons, framer-motion, @hookform/resolvers, lenis, lucide-react, next (+7 more)

## Ambiguous Edges - Review These
- `DentaLux demo (dental clinic landing)` → `El Gastronomo demo (fine dining restaurant landing)`  [AMBIGUOUS]
  public/demos/landing/dentalux.html · relation: shares_data_with

## Knowledge Gaps
- **36 isolated node(s):** `@types/nodemailer`, `flag-icons`, `react-dom`, `@tailwindcss/postcss`, `@types/node` (+31 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 156 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Localized Routes & Metadata` to `Page Sections & Contact Form`, `Contact API & Dev Tooling`, `Root Layout & Theming`, `Navigation & Smooth Scroll`, `Image Divider`?**
  _High betweenness centrality (0.167) - this node is a cross-community bridge._
- **What connects `@types/nodemailer`, `flag-icons`, `react-dom` to the rest of the system?**
  _36 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Localized Routes & Metadata` be split into smaller, more focused modules?**
  _Cohesion score 0.09647058823529411 - nodes in this community are weakly interconnected._
- **Why does `DemoViewer()` connect `Demo Viewer & Custom Demos` to `Navigation & Smooth Scroll`, `Page Sections & Contact Form`?**
  _High betweenness centrality (0.096) - this node is a cross-community bridge._
- **Should `Ecommerce & Landing Demos` be split into smaller, more focused modules?**
  _Cohesion score 0.05735430157261795 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Navigation & Smooth Scroll` to `Localized Routes & Metadata`, `Page Sections & Contact Form`, `Contact API & Dev Tooling`, `Root Layout & Theming`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `DentaLux demo (dental clinic landing)` and `El Gastronomo demo (fine dining restaurant landing)`?**
  _Edge tagged AMBIGUOUS (relation: shares_data_with) - confidence is low._