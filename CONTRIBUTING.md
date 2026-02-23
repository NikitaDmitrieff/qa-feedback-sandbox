# Contributing Guide

This guide describes the conventions for TypeScript, styling, and code quality that all contributors must follow.

---

## TypeScript Practices

### Metadata Typing

All Next.js pages and layouts that export `metadata` must use the `Metadata` type from `next`:

```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}
```

### General TypeScript Rules

- Always use explicit types for function parameters and return values in shared/exported code.
- Prefer `type` imports (`import type { ... }`) for type-only imports to keep runtime bundles clean.
- Enable and respect `strict: true` (already configured in `tsconfig.json`).
- Never use `any` — use `unknown` and narrow the type, or define the correct type.

---

## Styling Practices

### No Inline Styles

**Never** add inline styles to JSX. All styles must live in a `.module.css` file:

```tsx
// ❌ Wrong
<div style={{ color: 'red', padding: '16px' }}>

// ✅ Correct
import styles from './MyComponent.module.css'
<div className={styles.container}>
```

### Use Design Tokens

All style values must reference a CSS custom property from `app/styles/globals.module.css`. Never hardcode raw values:

```css
/* ❌ Wrong */
color: #2563eb;
padding: 16px;
font-size: 14px;

/* ✅ Correct */
color: var(--color-primary-600);
padding: var(--spacing-4);
font-size: var(--font-size-sm);
```

Available token categories:
- **Colors** — `--color-primary-*`, `--color-gray-*`, `--color-success`, `--color-error`, etc.
- **Typography** — `--font-size-*`, `--font-weight-*`, `--line-height-*`, `--font-family-*`
- **Spacing** — `--spacing-1` through `--spacing-16`
- **Border radius** — `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full`
- **Layout** — `--max-width-sm`, `--max-width-md`, `--max-width-lg`, `--max-width-xl`

See `app/styles/README.md` for full token documentation and `app/design-system` for a live preview.

### CSS Modules

- One `.module.css` file per component/page.
- Co-locate the CSS file next to its component file.
- Class names use `camelCase` in CSS Modules (e.g., `.cardTitle`, `.btnPrimary`).

---

## ESLint

This project uses ESLint v9 with flat config (configured in `eslint.config.mjs`).

> **Note:** ESLint v9 requires the flat config format (`eslint.config.mjs`). The traditional `.eslintrc.json` format is not supported. Our configuration extends `eslint-config-next/core-web-vitals`, which includes `@next/eslint-plugin-next`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, and `eslint-plugin-jsx-a11y`.

### Running ESLint

```bash
npx eslint app/
```

All errors must be resolved before merging. Warnings should be addressed when feasible.

### Accessibility Rules (jsx-a11y)

The following accessibility rules are enforced at the `error` level:

| Rule | Description |
|---|---|
| `jsx-a11y/alt-text` | `<img>` must have an `alt` attribute |
| `jsx-a11y/aria-props` | ARIA properties must be valid |
| `jsx-a11y/aria-proptypes` | ARIA property values must be valid |
| `jsx-a11y/aria-unsupported-elements` | ARIA roles must not be used on unsupported elements |
| `jsx-a11y/role-has-required-aria-props` | Elements with roles must have all required ARIA props |
| `jsx-a11y/role-supports-aria-props` | ARIA props must be supported by the element's role |

---

## Design System Reference

Before building new UI components, review the live design system at `/design-system`. It shows:

- All color tokens with hex/RGB values and contrast ratios
- Typography scale with live samples
- Spacing scale with visual bars
- Button, Card, and Input component patterns with code examples

---

## Pull Request Checklist

Before opening a PR:

- [ ] No inline styles in any component (`style={{ ... }}` is forbidden)
- [ ] All style values use CSS custom properties (no raw hex/px values)
- [ ] `Metadata` is properly typed in any new layouts/pages
- [ ] `npx eslint app/` runs with 0 errors
- [ ] `npm run build` succeeds with 0 TypeScript errors
- [ ] New components follow the CSS Modules naming convention
