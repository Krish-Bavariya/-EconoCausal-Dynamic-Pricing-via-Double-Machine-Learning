---
name: Causal Analytics Interface
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#bcc7de'
  on-secondary: '#263143'
  secondary-container: '#3e495d'
  on-secondary-container: '#aeb9d0'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#1e0052'
  on-tertiary-container: '#9162fc'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d8e3fb'
  secondary-fixed-dim: '#bcc7de'
  on-secondary-fixed: '#111c2d'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-md-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 30px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar_width: 280px
  max_content_width: 1440px
  gutter: 24px
  container_padding: 32px
  stack_gap_sm: 8px
  stack_gap_md: 16px
  stack_gap_lg: 24px
---

## Brand & Style

This design system is built for high-stakes decision-making environments where clarity, precision, and authority are paramount. The aesthetic is **Modern Corporate Minimalism** with a focus on **Enterprise AI**. It leverages deep obsidian and navy tones to reduce visual fatigue during long analytical sessions while using high-frequency purple accents to highlight causal insights.

The emotional response should be one of "Expert Intelligence"—a tool that doesn't just show data, but understands it. The interface utilizes high-quality whitespace, crisp borders, and a utilitarian layout to reflect the rigor of causal inference.

## Colors

The palette is rooted in a "Deep Space" dark mode. 

- **Primary & Secondary:** These define the structural hierarchy. Use `#0f172a` for the deepest backgrounds (sidebar/base) and `#1e293b` for elevated containers (cards/modals).
- **Accents:** `#8b5cf6` (Purple) is the primary action and "intelligence" color, used for causal pathways and primary buttons.
- **Causal Segments:** 
    - **Persuadable:** Violet (`#8b5cf6`) representing potential.
    - **Sure Thing:** Emerald (`#10b981`) representing guaranteed outcomes.
    - **Lost Cause:** Rose (`#f43f5e`) representing attrition.
    - **Do Not Disturb:** Amber (`#f59e0b`) representing caution.

## Typography

The system uses a tri-font strategy to balance modernity, readability, and technical precision.

1.  **Geist (Headlines):** Used for all major page titles and section headers. Its geometric precision conveys a modern, developer-friendly AI aesthetic.
2.  **Inter (Body):** The workhorse for all UI text, descriptions, and data labels. It provides exceptional legibility at small sizes.
3.  **JetBrains Mono (Data/Labels):** Used sparingly for "Causal IDs," status indicators, and chart axis values to emphasize the mathematical nature of the platform.

Maintain a tight tracking (letter-spacing) on headings to keep the look "premium."

## Layout & Spacing

This design system utilizes a **Fixed Sidebar + Fluid Content** model.

- **Grid:** A 12-column grid is used within the content area. Gutters are fixed at 24px.
- **Sidebar:** A persistent 280px navigation bar sits on the left. It remains dark (#0f172a) regardless of the content's background.
- **Hierarchy of Space:** Use generous 32px padding for top-level card containers to ensure data visualizations have "room to breathe."
- **Breakpoints:** 
    - **Desktop:** 1440px+ (Full 12 columns).
    - **Tablet:** 768px - 1439px (Sidebar collapses to icons, 8 columns).
    - **Mobile:** <767px (Bottom navigation, 4 columns, padding reduced to 16px).

## Elevation & Depth

Depth is achieved through **Tonal Layering** rather than heavy shadows.

- **Level 0 (Base):** `#0f172a` – The foundation layer for the entire application.
- **Level 1 (Cards):** `#1e293b` – The primary surface for content. These should feature a 1px border of `#334155` (Slate 700) to define edges against the base.
- **Level 2 (Hover/Active):** Subtle "inner-glow" using a 1px top border of the tertiary accent (#8b5cf6) at 30% opacity.
- **Shadows:** Use a single, highly diffused "Ambient Shadow" for modals: `0px 20px 50px rgba(0, 0, 0, 0.5)`. Avoid shadows on standard dashboard cards.

## Shapes

The shape language is **Soft (0.25rem)** to maintain a professional, architectural feel. 

- **Cards and Modals:** Use `rounded-lg` (0.5rem) for a modern look that isn't overly "bubbly."
- **Buttons and Inputs:** Use `rounded` (0.25rem) to reinforce the precision of the data tool.
- **Badges:** Use `rounded-full` (Pill-shaped) for segment identifiers (e.g., "Persuadable") to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary:** Solid `#8b5cf6` with white text. No gradient.
- **Secondary:** Transparent background with a 1px border of `#334155`.
- **States:** Hover should increase background brightness by 10%; Active should slightly scale down (0.98).

### Cards
- Surfaces are `#1e293b`.
- Headers within cards should have a subtle bottom divider (1px `#334155`).
- Ensure all charts within cards have a minimum internal padding of 24px.

### Badges & Status Indicators
- **Causal Segments:** High-saturation background with 10% opacity, and a 1px solid border of the same color. Text should be the solid color.
- **System Health:** Small circular indicators (8px). Use a pulsing animation for "Live" API streams.

### Charts (Causal Specific)
- **ITE (Individual Treatment Effect):** Use a bi-directional bar chart with `#8b5cf6` for positive and `#f43f5e` for negative.
- **Uplift Curves:** Solid line weight (2px) with a subtle area fill (10% opacity).
- **Grid Lines:** Use `#334155` at 50% opacity. Keep axis labels in `label-mono`.

### Sidebar
- Icons should be stroke-based (2px width), using the Lucide or Phosphor set.
- Active state: A vertical 3px bar on the far left in `#8b5cf6`.