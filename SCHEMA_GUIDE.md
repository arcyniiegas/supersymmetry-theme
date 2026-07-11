# SCHEMA_GUIDE.md — Section & block schema standard

Every `{% schema %}` in this theme follows these rules. Consistent schema is what
makes the Theme Editor (priority #1) feel like one product instead of thirty.

---

## 1. Canonical setting IDs

Use these IDs for these concepts, everywhere. Do not invent synonyms.

| Concept              | Canonical `id`                          | Type |
|----------------------|-----------------------------------------|------|
| Primary heading      | `heading`                               | `text` / `inline_richtext` |
| Secondary heading    | `subheading`                            | `text` |
| Small label above heading | `eyebrow`                          | `text` |
| Body copy            | `text`                                  | `richtext` |
| Button label         | `button_label`                          | `text` |
| Button link          | `button_link`                           | `url` |
| Button style         | `button_style`                          | `select` (`primary` / `secondary` / `link`) |
| Second button        | `button_label_2`, `button_link_2`, `button_style_2` | — |
| Image                | `image`                                 | `image_picker` |
| Video                | `video`                                 | `video` |
| Product              | `product`                               | `product` |
| Collection           | `collection`                            | `collection` |
| Top / bottom padding | `padding_top`, `padding_bottom`         | `range` (px) |
| Color scheme         | `color_scheme`                          | `color_scheme` |

**Banned** (existing debt to migrate away from): `headline`, `headline_light`,
`headline_bold`, `hero_title`, `main_title`, `big_heading`, `lede`, and any
single‑letter ID (`k`, `v`, `t`, `b`, `n`, `d`, `q`, `f`). One concept, one name.

> Migration note: existing sections use `text_color` + `*_scale` via the
> `section-appearance` snippet, and two‑part hero headlines
> (`headline_light`/`headline_bold`). Preserve them until a section is refactored,
> then converge on the canonical IDs above (and `color_scheme`).

## 2. Group and order settings

A merchant should never scroll a wall of inputs. Organise every schema with
`header` dividers in a consistent order:

```
Content        → heading, subheading, text, image, links
Layout         → alignment, columns, widths
Appearance     → color_scheme, background, borders
Spacing        → padding_top, padding_bottom
Advanced       → custom classes, anchors, visibility
```

- Group related settings under a `{ "type": "header", "content": "…" }`.
- Put the settings a merchant changes most at the top.
- Use `info` for guidance, not `label`. Labels are short and human
  (“Button label”, not “button_label”).

## 3. Standard patterns

**Button** (three settings, always together):

```json
{ "type": "text",   "id": "button_label", "label": "Button label" },
{ "type": "url",    "id": "button_link",  "label": "Button link" },
{ "type": "select", "id": "button_style", "label": "Button style",
  "options": [
    { "value": "primary",   "label": "Primary" },
    { "value": "secondary", "label": "Secondary" },
    { "value": "link",      "label": "Text link" }
  ], "default": "primary" }
```

**Spacing** (every section that needs it, identical):

```json
{ "type": "header", "content": "Spacing" },
{ "type": "range", "id": "padding_top",    "label": "Top padding",    "min": 0, "max": 160, "step": 4, "unit": "px", "default": 80 },
{ "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 160, "step": 4, "unit": "px", "default": 80 }
```

**Color** — use Shopify **color schemes**, not raw `color` pickers, so a section
inherits the store palette and both glass and solid surfaces stay coherent:

```json
{ "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" }
```

The `color_scheme_group` is defined in `settings_schema.json` (`scheme-1` = the
current light palette mirrored exactly; `scheme-2` surface; `scheme-3` ink). The
store default is applied on `<body>` via `snippets/color-schemes.liquid`.

A section opts into per-section colours by **just adding the `color_scheme`
setting above** — the shared `section-appearance` snippet (already rendered near
the top of every content section) reads it and emits a scoped `{% style %}` on
`#shopify-section-{id}` that remaps the full palette (`--bg` / `--surface` /
`--line` / `--text` / `--ink` / muted greys) **and paints `background` + `color`**,
so the scheme actually recolours the whole section — dark schemes included, with
buttons/chips correctly inverting (they read `--ink` on `--bg`). `scheme-1` equals
the current values, so the default is a computed no-op (pixel parity). Prefer this
over hand-adding a `class="color-…"` to each root; the behaviour lives in one
snippet. This is the successor to the per-section `text_color` picker, which still
works and layers on top of the scheme for fine-tuning just the words.

## 4. Blocks vs settings

> **If a merchant might reorder, repeat, or remove it, it is a block — not a
> setting.**

- A fixed field (the section's heading) → **setting**.
- A repeatable unit (an FAQ item, a stat, a logo, a step) → **block**.
- Never fake repetition with `item_1_title`, `item_2_title`, … — that is the
  anti‑pattern this theme is moving away from.

## 5. Shared blocks (`@theme`) over section‑local blocks

When a content shape is used by **more than one** section, make it a **theme
block** in `/blocks/*.liquid` and let sections opt in:

```json
"blocks": [{ "type": "@theme" }]
```

This is how `accordion_item`, `stat`, `step`, `heading`, `button`, `image`,
`rich_text` become a single shared vocabulary (see [COMPONENTS.md](COMPONENTS.md))
instead of the current per‑page `qa` / `story` / `habit` / `tstep` one‑offs.
Section‑local blocks remain fine for a shape that is genuinely unique to one
section.

## 6. Presets, defaults, limits

- **Every section has a `presets` entry** so it appears in “Add section”, with a
  sensible starter block set.
- **Meaningful defaults** on every setting — the section must look finished the
  moment it is added, with no empty state.
- **Limits:** set `max_blocks` where unbounded repetition would break layout;
  set `min`/`max` on ranges.
- **`enabled_on` / `disabled_on`** to constrain where a section can be placed
  (e.g. header/footer‑group only).

## 7. Required attributes & hygiene

- **`shopify_attributes`** on every section root and every block root:
  `<div {{ block.shopify_attributes }}>` — the Theme Editor needs it for
  select/hover/scroll‑to.
- **Labels are translatable** — use `"label": "t:sections.hero.name"` keys with
  entries in `locales/*.schema.json` for anything merchant‑facing at scale.
- **`tag` and `class`** set intentionally on sections (default `section`).
- **Support dynamic sources** (`"info"` + connect‑to‑metafield) on text, image
  and product settings wherever a merchant might bind data.

## 8. Naming the files

- Sections: `type-purpose.liquid` — structural prefix + purpose
  (`main-product`, `home-hero`, `footer`). New reusable sections drop
  page‑specific/localised names in favour of purpose (`content-accordion`,
  `content-steps`, `stat-row`) so they read as reusable, not one‑off.
- Blocks: the concept, singular — `accordion-item.liquid`, `stat.liquid`,
  `button.liquid`.

## 9. A good schema, end to end

```json
{% schema %}
{
  "name": "Content — Accordion",
  "tag": "section",
  "class": "section",
  "settings": [
    { "type": "text", "id": "heading", "label": "Heading" },
    { "type": "richtext", "id": "text", "label": "Intro" },
    { "type": "header", "content": "Appearance" },
    { "type": "color_scheme", "id": "color_scheme", "label": "Color scheme", "default": "scheme-1" },
    { "type": "header", "content": "Spacing" },
    { "type": "range", "id": "padding_top",    "label": "Top padding",    "min": 0, "max": 160, "step": 4, "unit": "px", "default": 80 },
    { "type": "range", "id": "padding_bottom", "label": "Bottom padding", "min": 0, "max": 160, "step": 4, "unit": "px", "default": 80 }
  ],
  "blocks": [{ "type": "@theme" }],
  "presets": [
    { "name": "Content — Accordion",
      "blocks": [
        { "type": "accordion-item" },
        { "type": "accordion-item" }
      ]
    }
  ]
}
{% endschema %}
```
