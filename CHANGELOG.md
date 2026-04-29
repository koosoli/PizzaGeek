# Changelog

## 0.6.0 - 2026-04-27

- Added richer planner workflow controls, including collapsible baker notes, per-step done/skip/reset actions, and clearer process status tracking
- Surfaced hydration more clearly in the recipe sheet and expanded planner summaries so print/export output carries more of the live workflow context
- Added a dedicated preferment planning window to the planner so bakers can see the best mixing and use window separately from the main dough schedule
- Renamed the dough studio section to cover preferment and final dough more accurately instead of implying only one flour stage
- Extended the dough model to support combined preferment workflows, including mixes like partial biga plus poolish, while keeping older saved recipes backward compatible
- Updated calculator, planner, and recipe text generation so multiple preferment stages are reflected consistently across the app and covered by regression tests

## 0.5.0 - 2026-04-27

- Split flour blending by stage so preferments and main dough can use different flour mixes without breaking older saved recipes that still rely on the legacy shared blend
- Allowed hybrid natural-starter doughs by keeping manual commercial yeast available alongside `Lievito madre` and `Sourdough` instead of forcing those modes to be starter-only
- Added starter inoculation controls for natural-starter preferments so bakers can tune preferment strength directly in Dough Studio
- Updated recipe summaries, print sheets, sharing text, and flour breakdowns so the app explains preferment splits and main-dough additions more clearly
- Finished Italian method localization, including sauce instructions, so the full workflow now stays in Italian when that locale is selected
- Added calculator and normalization regression coverage for stage-specific flour blends, hybrid leavening, starter inoculation, and older input compatibility

## 0.4.0 - 2026-04-27

- Added Italian as a full app language, including Italian recipe naming, planner copy, settings labels, and bread/fermentation profile content
- Set Italian locale defaults to EUR, metric sizing, and Celsius so switching languages also lands on sensible regional defaults
- Expanded German localization with proper umlauts across the updated UI and workflow text instead of ASCII spellings like `ue`, `oe`, and `ae`
- Added `Lievito madre` and `Sourdough` as natural-starter preferment paths and localized their labels more accurately in English, German, and Italian
- Corrected the preferment model so `Bassinage` is no longer exposed as a preferment choice in the UI and is treated as a mixing technique rather than a starter style
- Coupled natural-starter preferments to the dough logic so they no longer require extra commercial yeast, and the UI now hides `IDY` / `ADY` / `Fresh yeast` selection while those modes are active
- Expanded yeast labeling to spell out `IDY`, `ADY`, and `Fresh yeast` more clearly in the interface instead of relying on unexplained abbreviations
- Hardened persisted settings and input normalization so invalid stored locale values and older preferment states fall back safely without overriding the new defaults
- Added and updated tests around Italian defaults, localized product profiles, preferment labeling, and natural-starter yeast suppression so the new release behavior is covered by typecheck and Vitest

## 0.3.0 - 2026-04-26

- Added a clearer product split between pizza and bread, including bread-first profiles and loaf-oriented workflows
- Expanded bread mode with ciabatta, semolina loaf, milk bread, whole-grain hearth, and schiacciata profiles, plus richer bread profile cards and bread-specific planner targets
- Added Guided and Studio workspace modes so new users can start simpler without losing deeper controls
- Added mobile-friendly sliders across key dough inputs and restored them on larger layouts after the responsive regression fix
- Added humidity-aware fermentation, richer environment controls, and quick environment presets for common kitchen conditions
- Expanded planning with a stronger fermentation schedule surface, timeline shortcuts, and more explicit bake timing guidance
- Added earlier dough workability guidance around hydration and flour strength so users see shaping risk before they mix
- Improved accessibility and UI robustness with clearer form labels, safer semantic progress indicators, and better Safari-compatible visual treatment
- Extracted major UI surfaces out of the main app flow, including fermentation, settings, and recipe sheet content, to keep the app easier to grow
- Added recipe backup import and export for saved recipes and bake journal entries, plus migration-aware normalization for older or malformed backup data
- Added PWA infrastructure including manifest generation, service worker registration, offline caching, and app-install groundwork for a later release
- Added a maskable app icon and cleaner mobile-web metadata for installable app support
- Updated the GitHub Pages deployment workflow, fixed CI type issues, and added tag-driven GitHub Release automation for versioned releases

## 0.2.0 - 2026-04-25

First public open-source Pizza Geek release.

- Reframed the project as an independent, community-owned spin on the Pizza Nerd calculator
- Reworked the interface into a darker, cleaner, more print-friendly product surface
- Added richer fermentation planning across bulk, temper, cold ball, cold bulk, and cellar stages
- Added preferment workflows for poolish, biga, tiga, and bassinage
- Expanded flour blending, sauce guidance, saved recipes, bake logging, and recipe export flows
- Added GitHub Pages deployment support and repo metadata for a cleaner public release
