# ARCHITECTURE.md

# Supersymmetry Theme Architecture

This document defines the architectural standards for the Shopify theme.

These standards are mandatory.

Every feature should reinforce this architecture rather than introducing alternative patterns.

---

# Core Philosophy

The architecture should optimize for:

1. Maintainability
2. Simplicity
3. Performance
4. Theme Editor usability
5. Conversion rate

Every architectural decision should reduce complexity.

If complexity increases, there should be a measurable long-term benefit.

---

# Golden Rules

## One Responsibility

Every file should have one purpose.

Examples:

✓ Product gallery

✓ Cart drawer

✓ Product form

✓ Sticky ATC

Avoid components that solve multiple unrelated problems.

---

## One Source of Truth

Never duplicate application state.

Product state should exist once.

Cart state should exist once.

Variant state should exist once.

Settings should exist once.

If multiple components need the same data, synchronize from one authoritative source.

---

## Extend Before Replacing

Before creating a new component ask:

Can the existing one be extended?

Can it become more reusable?

Can responsibilities simply be separated?

Only create a new component if extending the old one would make it worse.

---

# Repository Structure

The repository should remain organized by responsibility.

```
assets/
```

Contains only:

JavaScript

CSS

Fonts

Images

No business logic.

---

```
config/
```

Theme configuration.

Do not place implementation here.

---

```
layout/
```

Global document structure.

Avoid feature logic.

---

```
locales/
```

Translations only.

Never hardcode customer-facing strings.

---

```
sections/
```

Top-level page components.

A section owns layout.

A section does NOT own reusable UI.

---

```
snippets/
```

Reusable UI components.

Examples:

Product Card

Price

Badge

Drawer

Button

Icon

Progress Bar

Do not duplicate snippets.

---

```
templates/
```

Compose pages.

Templates should remain thin.

Avoid business logic.

---

# Section Principles

Sections should:

Own layout.

Own blocks.

Own schema.

Delegate reusable UI to snippets.

Avoid large rendering trees.

Avoid duplicated markup.

A section should never become a "god component."

---

# Snippet Principles

Snippets should be:

Reusable.

Focused.

Stateless whenever possible.

Avoid snippets depending on page context unless explicitly documented.

---

# JavaScript Architecture

JavaScript should be component-driven.

Each UI component owns:

Initialization

State

Lifecycle

Cleanup

Avoid giant application scripts.

Avoid global event spaghetti.

---

# Event Architecture

Prefer event-driven communication.

Examples:

cart:updated

variant:changed

drawer:opened

drawer:closed

product:added

Avoid direct coupling between unrelated components.

Components should communicate through clearly named events.

---

# State Management

State should be predictable.

Examples:

Cart State

Current Variant

Selected Size

Drawer State

Theme Settings

Never compute the same state repeatedly.

Avoid duplicate state.

Derived state should remain derived.

---

# Product Architecture

Product pages should be composed from independent systems.

Examples:

Gallery

Media

Variant Picker

Price

Inventory

Product Form

Sticky ATC

Description

Recommendations

Each should own one responsibility.

Changing one should not require changing unrelated systems.

---

# Cart Architecture

The Cart Drawer is the primary cart interface.

Cart state should synchronize across:

Header

Drawer

Product Form

Quantity Controls

Cart Page

Never maintain multiple cart implementations.

AJAX should be the default interaction model.

---

# Drawer Principles

All drawers should share common behavior.

Open

Close

Focus trap

Escape

Scroll locking

Animation

Accessibility

Avoid each drawer implementing its own mechanics.

---

# Forms

Forms should progressively enhance.

Without JavaScript:

The store should continue functioning.

With JavaScript:

Enhance speed and UX.

Never make JavaScript mandatory for core purchasing.

---

# CSS Architecture

Styles should be component-oriented.

Avoid page-specific hacks.

Avoid selector chains.

Avoid styling based on DOM depth.

Prefer explicit class ownership.

---

# Naming Conventions

Use descriptive names.

Examples:

product-gallery

sticky-add-to-cart

cart-drawer

shipping-progress

delivery-estimate

Avoid:

component-final

component2

temp

new-cart

test-button

---

# Theme Settings

Every merchant-facing option belongs in Theme Settings.

Avoid hidden configuration.

Avoid hardcoded business values.

Settings should:

have sensible defaults

be logically grouped

be documented

---

# Metafields

Use metafields for product-specific information.

Examples:

Fit

Materials

Shipping Notes

Badges

Avoid creating Theme Settings when the value belongs to the product.

---

# Performance Strategy

Every feature must justify its cost.

Before adding JavaScript ask:

Can HTML solve this?

Can CSS solve this?

Can Liquid solve this?

Use JavaScript only when interactivity requires it.

---

# Dependency Strategy

Reduce dependencies.

Avoid libraries unless they provide significant value.

Prefer platform APIs.

Prefer native browser APIs.

---

# Progressive Enhancement

Everything should function without JavaScript whenever practical.

JavaScript enhances.

It should not replace basic functionality.

---

# Accessibility Architecture

Accessibility is designed in from the beginning.

Not added afterwards.

Components should expose:

roles

labels

focus

keyboard support

announcements

---

# Error Recovery

Errors should never leave broken UI.

Failed requests should:

restore state

inform the customer

allow retry

never require refreshing

---

# Refactoring Philosophy

Whenever touching an area:

Simplify.

Reduce duplication.

Delete obsolete code.

Improve naming.

Improve organization.

Never increase technical debt.

---

# Technical Debt Policy

Temporary solutions become permanent.

Do not introduce temporary architecture.

If something deserves a TODO,

it probably deserves implementation instead.

---

# Future Features

Every new feature should answer:

Can this become reusable?

Will another page need this?

Can it be composed instead?

Will merchants understand it?

Will developers understand it six months later?

---

# Architecture Review Checklist

Before completing a task ask:

Does this introduce duplicate logic?

Does this introduce duplicate state?

Does this introduce unnecessary abstractions?

Does this increase maintenance?

Can this be simpler?

Did obsolete code get removed?

Would a new developer immediately understand this?

If any answer is "No",

continue refactoring before considering the task complete.