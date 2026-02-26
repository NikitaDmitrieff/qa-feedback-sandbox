# Design System

This document describes the design tokens and utility classes available in `globals.module.css`.

## Usage

Import the stylesheet and apply classes via CSS Modules:

```tsx
import styles from '@/app/styles/globals.module.css'

// Apply to body in layout.tsx
<body className={styles.body}>

// Use utility classes in components
<div className={`${styles.flex} ${styles.itemsCenter} ${styles.gap4}`}>
```

---

## Color Palette

Colors follow a 50–900 scale. Use semantic tokens wherever possible.

### Primary (Blue)

| Token | Value | Usage |
|---|---|---|
| `--color-primary-50` | `#eff6ff` | Light backgrounds |
| `--color-primary-100` | `#dbeafe` | Hover states |
| `--color-primary-500` | `#3b82f6` | Interactive elements |
| `--color-primary-600` | `#2563eb` | Links, buttons |
| `--color-primary-700` | `#1d4ed8` | Hover on primary |
| `--color-primary-900` | `#1e3a8a` | Dark text |

### Neutrals (Gray)

| Token | Value | Usage |
|---|---|---|
| `--color-gray-50` | `#f9fafb` | Page background |
| `--color-gray-100` | `#f3f4f6` | Code backgrounds |
| `--color-gray-200` | `#e5e7eb` | Borders |
| `--color-gray-500` | `#6b7280` | Muted text |
| `--color-gray-700` | `#374151` | Secondary text |
| `--color-gray-900` | `#111827` | Body text |

### Semantic

| Token | Value | Usage |
|---|---|---|
| `--color-success` | `#16a34a` | Success states |
| `--color-warning` | `#d97706` | Warning states |
| `--color-error` | `#dc2626` | Error states |
| `--color-info` | `#0284c7` | Info states |

### Surface

| Token | Resolves To | Usage |
|---|---|---|
| `--color-background` | `#ffffff` | Page/root background |
| `--color-surface` | `--color-gray-50` | Cards, panels |
| `--color-border` | `--color-gray-200` | Dividers, outlines |
| `--color-text` | `--color-gray-900` | Primary text |
| `--color-text-muted` | `--color-gray-500` | Secondary/helper text |

---

## Typography

### Font Families

| Token | Value |
|---|---|
| `--font-family-sans` | `system-ui, -apple-system, ...` |
| `--font-family-mono` | `ui-monospace, SFMono-Regular, ...` |

### Font Sizes

| Token | Value | px |
|---|---|---|
| `--font-size-xs` | `0.75rem` | 12px |
| `--font-size-sm` | `0.875rem` | 14px |
| `--font-size-base` | `1rem` | 16px |
| `--font-size-lg` | `1.125rem` | 18px |
| `--font-size-xl` | `1.25rem` | 20px |
| `--font-size-2xl` | `1.5rem` | 24px |
| `--font-size-3xl` | `1.875rem` | 30px |
| `--font-size-4xl` | `2.25rem` | 36px |

### Font Weights

| Token | Value |
|---|---|
| `--font-weight-normal` | `400` |
| `--font-weight-medium` | `500` |
| `--font-weight-semibold` | `600` |
| `--font-weight-bold` | `700` |

### Line Heights

| Token | Value |
|---|---|
| `--line-height-tight` | `1.25` |
| `--line-height-snug` | `1.375` |
| `--line-height-normal` | `1.5` |
| `--line-height-relaxed` | `1.625` |
| `--line-height-loose` | `2` |

---

## Spacing

All spacing tokens use a 4px base unit.

| Token | Value | px |
|---|---|---|
| `--spacing-1` | `0.25rem` | 4px |
| `--spacing-2` | `0.5rem` | 8px |
| `--spacing-3` | `0.75rem` | 12px |
| `--spacing-4` | `1rem` | 16px |
| `--spacing-5` | `1.25rem` | 20px |
| `--spacing-6` | `1.5rem` | 24px |
| `--spacing-8` | `2rem` | 32px |
| `--spacing-10` | `2.5rem` | 40px |
| `--spacing-12` | `3rem` | 48px |
| `--spacing-16` | `4rem` | 64px |

### Layout Constraints

| Token | Value |
|---|---|
| `--max-width-sm` | `640px` |
| `--max-width-md` | `768px` |
| `--max-width-lg` | `1024px` |
| `--max-width-xl` | `1280px` |
| `--max-width-content` | `640px` (reading width) |

---

## Utility Classes

### Flex

```tsx
<div className={styles.flex}>           // display: flex
<div className={styles.flexCol}>        // flex-direction: column
<div className={styles.itemsCenter}>    // align-items: center
<div className={styles.justifyBetween}> // justify-content: space-between
<div className={styles.gap4}>           // gap: 1rem
```

### Grid

```tsx
<div className={styles.grid}>           // display: grid
<div className={styles.gridCols2}>      // 2-column grid
<div className={styles.mdGridCols3}>    // 3-column at 768px+
```

### Responsive Breakpoints

| Prefix | Breakpoint |
|---|---|
| `sm` | `640px+` |
| `md` | `768px+` |
| `lg` | `1024px+` |

---

## Design Token Constraints

- **Never** use raw hex values in component styles — always reference a CSS variable.
- **Never** use magic numbers for spacing — always use a spacing token.
- **Never** add inline styles to JSX — extract to a `.module.css` file.
- **Always** prefer semantic tokens (`--color-text`, `--color-background`) over palette tokens.

---

## Live Reference

Visit `/design-system` to see all tokens rendered with live examples and contrast ratios.
