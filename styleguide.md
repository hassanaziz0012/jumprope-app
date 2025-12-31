# Style Guide

This style guide defines the visual language and design principles for the app. Follow these guidelines to create a cohesive, modern, and premium user experience.

---

## Color Palette

### Primary Colors

| Name               | Hex       | Usage                                                                        |
| ------------------ | --------- | ---------------------------------------------------------------------------- |
| **Primary Orange** | `#ff5526` | Primary CTAs, highlights, active states, accent elements                     |
| **Primary Lime**   | `#ccfa53` | Secondary accents, progress indicators, success states, interactive elements |

### Background Colors

| Name            | Hex       | Usage                                |
| --------------- | --------- | ------------------------------------ |
| **Deep Black**  | `#0a0a0a` | Main app background                  |
| **Dark Gray**   | `#1a1a1a` | Card backgrounds, elevated surfaces  |
| **Medium Gray** | `#2a2a2a` | Secondary card backgrounds, dividers |

### Text Colors

| Name           | Hex       | Usage                               |
| -------------- | --------- | ----------------------------------- |
| **White**      | `#ffffff` | Primary text, headings              |
| **Light Gray** | `#a0a0a0` | Secondary text, subtitles, captions |
| **Muted Gray** | `#666666` | Tertiary text, disabled states      |

### Semantic Colors

| Name                       | Hex       | Usage                               |
| -------------------------- | --------- | ----------------------------------- |
| **Success**                | `#ccfa53` | Completed states, positive feedback |
| **Warning**                | `#ff5526` | Alerts, important actions           |
| **Progress Ring - Red**    | `#ff5526` | Activity progress indicators        |
| **Progress Ring - Yellow** | `#f5c542` | Tonnage/secondary metrics           |
| **Progress Ring - Green**  | `#5adb5a` | Progress/completion percentage      |

---

## Typography

### Font Family

Use a clean, modern sans-serif typeface:

-   **iOS**: SF Pro Display / SF Pro Text
-   **Android**: Roboto
-   **Web**: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif

### Type Scale

| Style       | Size    | Weight         | Usage                            |
| ----------- | ------- | -------------- | -------------------------------- |
| **Display** | 48-64px | Bold (700)     | Hero numbers, large metrics      |
| **H1**      | 28-32px | Bold (700)     | Screen titles                    |
| **H2**      | 20-24px | SemiBold (600) | Section headings                 |
| **H3**      | 16-18px | SemiBold (600) | Card titles, labels              |
| **Body**    | 14-16px | Regular (400)  | Primary body text                |
| **Caption** | 12-13px | Regular (400)  | Secondary text, dates, subtitles |
| **Micro**   | 10-11px | Medium (500)   | Tags, badges, small labels       |

### Typography Hierarchy

-   Use **bold weights** for headings and important metrics
-   Use **regular weights** for body text and descriptions
-   Maintain **high contrast** (white text on dark backgrounds)
-   Keep **line heights** comfortable: 1.4-1.6 for body text

---

## Spacing & Layout

### Spacing Scale

Use a consistent 4px base unit:
| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Tight spacing, inline elements |
| `sm` | 8px | Small gaps, icon padding |
| `md` | 16px | Default spacing, card padding |
| `lg` | 24px | Section spacing |
| `xl` | 32px | Large section gaps |
| `2xl` | 48px | Major section separators |

### Screen Padding

-   **Horizontal padding**: 16-20px from screen edges
-   **Vertical padding**: 16-24px between sections

### Card Layout

-   **Internal padding**: 16-20px
-   **Border radius**: 16-20px (large, soft corners)
-   **Gap between cards**: 12-16px

---

## Components

### Cards

Cards are a primary UI element. Design them with:

-   **Dark background**: `#1a1a1a` or `#2a2a2a`
-   **Large border radius**: 16-20px
-   **Subtle shadow** (optional): `0 4px 20px rgba(0,0,0,0.3)`
-   **No visible borders** - use background contrast instead
-   **Internal padding**: 16-20px

```css
.card {
    background-color: #1a1a1a;
    border-radius: 16px;
    padding: 16px;
}
```

### Buttons

#### Primary Button

-   **Background**: Primary Orange (`#ff5526`)
-   **Text**: White
-   **Border radius**: 8-12px (pill shape for small buttons)
-   **Padding**: 12px 24px
-   **Font weight**: SemiBold (600)

#### Secondary Button / Tags

-   **Background**: Slightly lighter gray or primary color with low opacity
-   **Text**: White or primary color
-   **Border radius**: 6-8px

### Progress Rings / Circular Indicators

Use circular progress indicators for metrics:

-   **Ring thickness**: 6-10px
-   **Background ring**: Dark gray (`#2a2a2a`)
-   **Progress colors**: Use semantic colors (red, yellow, green)
-   **Center content**: Large number + label below

### Tab Bar / Bottom Navigation

-   **Background**: Deep black with slight transparency or blur
-   **Icons**: 24px, outlined style when inactive
-   **Active state**: Primary color icon + label
-   **Inactive state**: Muted gray icons

### Tags / Chips

-   **Background**: Low-opacity primary color or dark gray
-   **Text**: White or primary color
-   **Border radius**: 6px (pill shape)
-   **Padding**: 4px 12px
-   **Font size**: Micro (10-12px)

---

## Iconography

### Style

-   Use **outlined** icons for inactive/default states
-   Use **filled** icons for active states
-   Keep icon stroke width consistent (1.5-2px)
-   Prefer rounded corners over sharp angles

### Sizes

| Context          | Size    |
| ---------------- | ------- |
| Tab bar          | 24px    |
| In-card          | 20-24px |
| Action buttons   | 20px    |
| Small indicators | 16px    |

### Recommended Icon Libraries

-   SF Symbols (iOS)
-   Material Icons (Android)
-   Lucide / Feather Icons (Cross-platform)

---

## Charts & Data Visualization

### Line Charts

-   **Background**: Transparent or card background
-   **Line color**: Primary Orange (`#ff5526`)
-   **Line thickness**: 2-3px
-   **Smooth curves**: Use bezier interpolation
-   **Grid lines**: Subtle, use `#333333` or hidden
-   **Axis labels**: Caption size, muted gray

### Progress Indicators

-   **Circular progress**: Multi-ring style for multiple metrics
-   **Linear progress**: Use for simple percentages
-   **Colors**: Use the semantic color palette

---

## Dark Mode Design Principles

This is a **dark-first** design. Key principles:

1. **True dark backgrounds**: Use near-black (`#0a0a0a`) for the main background
2. **Elevated surfaces**: Cards should be slightly lighter than the background
3. **High contrast text**: White text on dark backgrounds
4. **Vibrant accents**: Bright primary colors pop against dark backgrounds
5. **Reduce eye strain**: Avoid pure white backgrounds; use dark grays
6. **Subtle depth**: Use shadows and layering to create hierarchy

---

## Interaction & Animation

### Transitions

-   **Duration**: 200-300ms for micro-interactions
-   **Easing**: Use ease-out or cubic-bezier for natural feel
-   **Properties**: Animate opacity, transform, background-color

### Hover/Press States

-   **Buttons**: Slight scale (0.98) or opacity change
-   **Cards**: Subtle lift effect or border highlight
-   **Interactive elements**: Background color shift

### Loading States

-   Use skeleton loaders with shimmer effect
-   Match skeleton colors to card backgrounds
-   Animate with subtle pulse or wave

---

## Accessibility

### Contrast Ratios

-   Ensure **4.5:1** minimum contrast for body text
-   Ensure **3:1** minimum for large text and icons
-   Test all color combinations against WCAG AA standards

### Touch Targets

-   Minimum touch target: **44x44px**
-   Add padding around small interactive elements

### Labels

-   Always provide accessible labels for icons and interactive elements
-   Use semantic HTML/components where possible

---

## Design Checklist

Before shipping any screen, verify:

-   [ ] Using correct primary colors (`#ff5526`, `#ccfa53`)
-   [ ] Dark background is near-black (`#0a0a0a`)
-   [ ] Cards have proper border radius (16-20px)
-   [ ] Typography follows the type scale
-   [ ] Consistent spacing using the spacing scale
-   [ ] Icons are the correct size and style
-   [ ] Touch targets are at least 44x44px
-   [ ] Text has sufficient contrast
-   [ ] Animations are smooth and subtle
-   [ ] The overall look feels modern, dark, and premium
