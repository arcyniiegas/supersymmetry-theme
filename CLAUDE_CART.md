# CLAUDE.md

# Supersymmetry Shopify Theme Engineering Constitution

This document defines the engineering standards for this repository.

It is not optional guidance.

Every task performed in this repository must follow these rules unless explicitly instructed otherwise.

---

# Mission

The purpose of this repository is to build and maintain a premium Shopify Online Store 2.0 theme for Supersymmetry.

The objective is not simply to build features.

The objective is to create one of the highest-converting fashion ecommerce experiences while maintaining exceptional code quality, long-term maintainability and excellent storefront performance.

Every modification should improve at least one of the following:

- Conversion rate
- User experience
- Maintainability
- Performance
- Accessibility
- Merchant usability

No task should make the repository worse.

---

# Engineering Philosophy

Assume you are the lead engineer responsible for this codebase for the next five years.

Every decision should reduce future maintenance costs.

Avoid temporary fixes.

Avoid shortcuts.

Avoid duplicate implementations.

Prefer deleting code over adding code.

If a feature exposes architectural problems, improve the architecture while implementing the feature.

Always leave the repository in a better state than you found it.

---

# Decision Hierarchy

When tradeoffs exist, optimize in this order.

1. Correctness

2. Reliability

3. Storefront stability

4. Conversion rate

5. Accessibility

6. Performance

7. Maintainability

8. Theme Editor usability

9. Developer experience

10. Code elegance

Never sacrifice a higher priority to improve a lower priority.

---

# Repository Philosophy

This repository should remain simple.

Simple code is preferred over clever code.

Predictable code is preferred over abstract code.

Readable code is preferred over compact code.

Maintainability is preferred over novelty.

Every file should have one responsibility.

Every function should have one responsibility.

Every component should have one owner.

---

# Claude Workflow

Never begin implementation immediately.

Always follow this workflow.

## Phase 1

Discovery

Read every relevant file.

Trace the execution flow.

Understand:

- Liquid
- JavaScript
- CSS
- snippets
- sections
- assets
- localization
- metafields
- settings
- cart flow
- product flow

Identify:

- dependencies
- duplicated logic
- dead code
- obsolete files
- unnecessary abstractions

Only after understanding the system should implementation begin.

---

## Phase 2

Planning

Identify the minimum architectural change that solves the problem.

Avoid creating new systems when existing systems can be extended.

Avoid introducing unnecessary abstractions.

Document assumptions internally before coding.

---

## Phase 3

Implementation

Implement incrementally.

Prefer multiple small improvements over one massive rewrite.

Maintain compatibility throughout the implementation.

---

## Phase 4

Validation

Verify:

Desktop

Mobile

Theme Editor

Accessibility

Performance

Localization

Cart

Product

Collections

Search

Customer Account

---

## Phase 5

Cleanup

Delete:

unused snippets

unused CSS

unused JavaScript

unused imports

dead Liquid

obsolete settings

unused schema entries

legacy code

Never leave dead code behind.

---

# Shopify Principles

Use Shopify-native patterns whenever possible.

Do not reinvent platform functionality.

Prefer:

Shopify APIs

Storefront standards

Theme App Extensions

App Blocks

Section Rendering API

Cart API

Bundled Section Rendering

Avoid workarounds when Shopify provides a supported solution.

---

# Online Store 2.0 Principles

Preserve full Theme Editor compatibility.

Every merchant-facing feature should be configurable.

Avoid hardcoded values whenever configuration makes sense.

Do not break:

Templates

JSON templates

Sections

Blocks

Presets

App blocks

Dynamic sources

Localization

---

# Liquid Standards

Liquid should primarily render HTML.

Avoid business logic in Liquid.

Avoid nested conditionals.

Avoid duplicated markup.

Move repeated UI into snippets.

Avoid giant section files.

Favor composition.

Schema should remain organized.

Avoid duplicated settings.

Every setting should have a clear purpose.

---

# JavaScript Standards

Use modern JavaScript.

No jQuery.

Prefer ES modules where architecture allows.

Avoid global variables.

Avoid polling.

Avoid unnecessary MutationObservers.

Avoid repeated DOM queries.

Cache references.

Batch DOM writes.

Use passive listeners.

Remove listeners when no longer needed.

Prevent memory leaks.

Every component should own its own lifecycle.

---

# CSS Standards

Mobile-first.

No !important unless absolutely unavoidable.

Avoid selector duplication.

Avoid specificity wars.

Avoid magic numbers.

Component-scoped styling whenever possible.

Prefer logical properties.

Respect prefers-reduced-motion.

Keep animations subtle.

---

# Theme Architecture

Prefer extending existing systems.

Do not create "v2" implementations.

Avoid wrappers around wrappers.

Avoid helper functions that merely rename other functions.

Every abstraction must reduce complexity.

If an abstraction increases complexity, remove it.

Delete obsolete implementations immediately.

Never leave parallel systems.

---

# File Organization

Every file should exist for a reason.

Large files should be decomposed.

Small files should not be fragmented unnecessarily.

Group related functionality.

Avoid circular dependencies.

Avoid deeply nested imports.

---

# UX Philosophy

The interface should feel effortless.

Reduce uncertainty before asking for commitment.

Never interrupt shopping.

Never surprise the customer.

Every interaction should provide immediate feedback.

Every click should move the customer closer to completing their goal.

Avoid modal fatigue.

Avoid unnecessary confirmations.

Avoid unnecessary animations.

Whitespace is intentional.

Typography is part of the experience.

The storefront should feel premium rather than promotional.

---

# CRO Philosophy

The primary KPI is completed purchases.

Optimize in this order.

Product understanding

↓

Confidence

↓

Add to Cart

↓

Checkout Started

↓

Purchase

↓

Average Order Value

↓

Repeat Purchase

Never increase friction to improve secondary metrics.

---

# Mobile Philosophy

Mobile is the primary platform.

Desktop is secondary.

Every feature must be designed for mobile first.

Avoid hover-dependent interactions.

Touch targets should remain comfortable.

Avoid horizontal scrolling.

Avoid hidden actions.

---

# Accessibility

Meet WCAG AA whenever possible.

Support:

Keyboard navigation

Focus management

Screen readers

ARIA

Reduced motion

Semantic HTML

Visible focus indicators

Escape key behavior

Accessible forms

Accessibility is not optional.

---

# Performance Budget

Every change should preserve or improve performance.

Avoid unnecessary JavaScript.

Avoid unnecessary CSS.

Lazy-load below-the-fold functionality.

Avoid layout thrashing.

Avoid synchronous rendering when asynchronous rendering is acceptable.

Minimize bundle growth.

Target:

Lighthouse Performance ≥95

CLS <0.05

Excellent INP

---

# Theme Editor Standards

Theme Editor is part of the product.

Merchant experience matters.

Settings should:

have logical defaults

be grouped logically

have clear labels

avoid duplication

avoid ambiguity

Support dynamic sources whenever practical.

---

# Refactoring Rules

Whenever touching existing code:

Reduce duplication.

Simplify.

Improve naming.

Improve organization.

Delete obsolete implementations.

Never leave technical debt because "it still works."

Broken architecture compounds.

---

# Error Handling

Every user-facing action should fail gracefully.

Never leave the interface in an inconsistent state.

Loading states should always resolve.

Errors should always be recoverable.

Network failures should produce helpful feedback.

---

# Logging

Development logging is acceptable.

Production console noise is not.

Remove debugging before completion.

---

# Comments

Good code requires few comments.

Comment:

Why

Not

What

Avoid redundant comments.

---

# Naming

Names should describe purpose.

Avoid abbreviations.

Avoid generic names.

Good:

cartDrawer

shippingProgress

productGallery

Bad:

helper

utils2

temp

newLogic

---

# Technical Debt

Technical debt should decrease over time.

If implementing a feature exposes poor architecture:

Improve it.

Do not ignore it.

---

# Backwards Compatibility

Do not break:

Theme Editor

Translations

Metafields

Dynamic Sources

App Blocks

Shopify Apps

Discounts

Selling Plans

Gift Cards

Cart Attributes

Line Item Properties

Bundles

Search & Discovery

Unless explicitly instructed.

---

# Definition of Done

A task is complete only when:

✓ Feature works

✓ Mobile verified

✓ Desktop verified

✓ Theme Editor verified

✓ Accessibility verified

✓ Performance maintained or improved

✓ No dead code remains

✓ No duplicate logic introduced

✓ Repository is cleaner than before

---

# Anti-Patterns

Never:

Copy-paste large blocks of code

Create parallel implementations

Leave dead files

Leave TODOs as permanent solutions

Hardcode merchant-configurable values

Introduce unnecessary dependencies

Optimize prematurely without evidence

Break Theme Editor

Use JavaScript where CSS is sufficient

Use CSS where semantic HTML solves the problem

---

# Supersymmetry Design Principles

This is a premium fashion brand.

The experience should resemble a luxury editorial publication more than a marketplace.

Avoid visual clutter.

Avoid excessive badges.

Avoid aggressive upselling.

Microinteractions should increase confidence.

Animations should feel elegant.

Every UI element should justify its existence.

Less is usually better.

Premium experiences are calm, not loud.

---

# Final Rule

Whenever multiple valid implementations exist, choose the solution that you would be happiest maintaining three years from now.

Code is a product.

Treat it accordingly.