# CLAUDE.md — Engineering guide for the Supersymmetry theme

Read this first, every session. It is the contract. The four companion guides
hold the detail; this file is the map and the rules.

---

## What this is

Supersymmetry is a bespoke **Shopify Online Store 2.0** theme for a Vilnius
leather‑footwear atelier. The storefront is **Lithuanian‑first**
(`locales/lt.default.json`), English secondary (`locales/en.json`). The design
language is a restrained editorial layout with an optional **liquid‑glass**
(glassmorphism) surface system, self‑hosted Geist / Geist Mono, and a warm
monochrome palette.

## The mission

Turn this repository from a **collection of pages** into a **framework**.

Today most pages ship their own bespoke section, their own stylesheet, their own
script, and their own one‑off block types. The target is a small, shared
vocabulary — **tokens → components → snippets → blocks** — that every page
composes from. The full model is in [ARCHITECTURE.md](ARCHITECTURE.md).

> **Hard constraint:** the storefront must stay **visually identical** through
> every refactor. Internal architecture may change freely; pixels may not.

## Priorities (in order — when they conflict, the higher one wins)

1. **Theme Editor experience**
2. **Maintainability**
3. **Reusability**
4. **Performance**
5. **Accessibility**
6. **Code quality**
7. **Visual fidelity** — a constraint to respect, never a licence to keep bad structure

Never optimise for writing the least code. Optimise for the best long‑term
architecture.

## Non‑negotiables

- **Every repeated UI element exists exactly once.** Markup that appears twice
  becomes a snippet. Behaviour that appears twice becomes a JS component. A
  content shape that appears twice becomes a shared block.
- **Respect the layers.** Sections orchestrate layout. Blocks are
  merchant‑editable content. Snippets render UI. Components own behaviour and
  styles. Never blur these.
- **No new bespoke block types.** Reuse the shared vocabulary in
  [COMPONENTS.md](COMPONENTS.md); extend it deliberately, not per page.
- **Follow the schema naming standard** in [SCHEMA_GUIDE.md](SCHEMA_GUIDE.md).
  No `headline` / `hero_title` / `k` / `v` improvisation.
- **No hardcoded customer‑facing strings.** All copy comes from `locales/*` or
  from section/block settings — never inline in Liquid. The store is
  Lithuanian; translators must be able to reach every word.
- **No new section‑scoped CSS/JS monoliths.** Styles belong in
  `assets/components/*`; behaviour belongs in shared JS components. See
  [STYLE_GUIDE.md](STYLE_GUIDE.md).
- **Prefer blocks over repeated settings. Prefer CSS over JS. Prefer Liquid and
  data‑attributes over inline styles.**

## Workflow for every change

1. **Analyze** — read the target code and its neighbours before touching anything.
2. **Explain** the architectural issue in plain terms.
3. **Describe** the intended solution.
4. **Refactor** in the smallest coherent step.
5. **Verify** — visual parity, Theme Editor still works, `theme-check` passes.
6. **Continue.**

Never modify dozens of files blindly. One responsibility per change.

The litmus test for any decision:
**"Would the engineers behind Dawn or Prestige build it this way?"** If not, don't.

## Repository map

| Directory     | Holds                                             | Notes |
|---------------|---------------------------------------------------|-------|
| `layout/`     | `theme.liquid`, `password.liquid`                 | Global HTML shell; loads `base.css` + core JS |
| `templates/`  | JSON page templates (+ `gift_card.liquid` legacy) | Compose sections; **merchant content lives here** |
| `sections/`   | 38 sections + `header-group` / `footer-group`     | Orchestrate layout; today they also define bespoke blocks |
| `snippets/`   | 10 partials                                       | Reusable UI — thin today, must grow |
| `blocks/`     | _(to be created)_                                 | Shared `@theme` blocks — the block vocabulary |
| `assets/`     | CSS, JS, fonts, images                            | Today: page‑scoped CSS/JS. Target: `tokens.css` + `components/` |
| `config/`     | `settings_schema.json`, `settings_data.json`      | Global theme settings |
| `locales/`    | `lt.default.json`, `en.json`                      | **All** customer‑facing strings |

## Conventions in brief (detail lives in the guides)

- **Snippets** — documented `{% comment %}` header listing params; render with
  named args. → [COMPONENTS.md](COMPONENTS.md)
- **Blocks** — shared types; `@theme` blocks in `/blocks` where cross‑section
  reuse applies. → [SCHEMA_GUIDE.md](SCHEMA_GUIDE.md)
- **CSS** — token‑driven, BEM‑ish `.block__element--modifier`, component files
  own the look, section CSS is layout‑only. → [STYLE_GUIDE.md](STYLE_GUIDE.md)
- **JS** — one component per behaviour, sections initialise; progressive
  enhancement, `defer`. → [STYLE_GUIDE.md](STYLE_GUIDE.md)
- **Schema** — canonical setting IDs, grouped settings, presets + sensible
  defaults + limits. → [SCHEMA_GUIDE.md](SCHEMA_GUIDE.md)

## Working in this repo

- **Version control** — commit a green baseline before refactoring. Keep commits
  small and behaviour‑preserving so any visual regression is bisectable.
- **Linting** — run `theme-check` (config `.theme-check.yml`). Treat it as the
  source of truth for Shopify correctness.
- **Preview** — `shopify theme dev` against a development store; diff every
  change against the committed baseline for pixel parity.
- **Roadmap** — [TODO.md](TODO.md) is the live plan. Update it as phases land.

## The companion guides

- **[ARCHITECTURE.md](ARCHITECTURE.md)** — the layer model, directory design, migration strategy.
- **[COMPONENTS.md](COMPONENTS.md)** — the registry of snippets, blocks and JS components (APIs + status).
- **[SCHEMA_GUIDE.md](SCHEMA_GUIDE.md)** — schema naming, setting groups, blocks‑vs‑settings, presets.
- **[STYLE_GUIDE.md](STYLE_GUIDE.md)** — CSS tokens & architecture, JS component pattern, performance, accessibility.
