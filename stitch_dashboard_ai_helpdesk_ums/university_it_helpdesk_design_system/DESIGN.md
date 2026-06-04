---
name: University IT Helpdesk Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#d5dae5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef4fe'
  surface-container: '#e9eef9'
  surface-container-high: '#e3e8f3'
  surface-container-highest: '#dde3ed'
  on-surface: '#161c23'
  on-surface-variant: '#434656'
  inverse-surface: '#2b3139'
  inverse-on-surface: '#ecf1fc'
  outline: '#737687'
  outline-variant: '#c3c5d8'
  surface-tint: '#004de9'
  primary: '#0040c5'
  on-primary: '#ffffff'
  primary-container: '#1456f5'
  on-primary-container: '#e0e4ff'
  inverse-primary: '#b6c4ff'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#dee0e2'
  on-secondary-container: '#606365'
  tertiary: '#4c4f51'
  on-tertiary: '#ffffff'
  tertiary-container: '#656769'
  on-tertiary-container: '#e5e6e8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dce1ff'
  primary-fixed-dim: '#b6c4ff'
  on-primary-fixed: '#001550'
  on-primary-fixed-variant: '#0039b3'
  secondary-fixed: '#e1e2e4'
  secondary-fixed-dim: '#c5c7c8'
  on-secondary-fixed: '#191c1e'
  on-secondary-fixed-variant: '#444749'
  tertiary-fixed: '#e1e2e4'
  tertiary-fixed-dim: '#c5c6c8'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#161c23'
  surface-variant: '#dde3ed'
typography:
  display:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  h3:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-page: 40px
---

## Brand & Style

This design system is built on the philosophy of "Efficiency through Clarity." Inspired by the polished aesthetics of high-end Asian enterprise platforms, it balances the authoritative nature of a university institution with the accessibility required for a support environment. 

The style is **Corporate / Modern**, characterized by a rigorous commitment to whitespace, meticulous alignment, and a "soft-professional" tone. It avoids the coldness of traditional institutional software by utilizing vibrant primary blues and friendly rounded corners. The goal is to reduce the cognitive load for students and faculty while evoking a sense of reliability and modern technical capability.

## Colors

The color palette is anchored by a high-energy primary blue that signifies action and resolution. To maintain a clean, "breathable" interface, the system relies heavily on a pure white background complemented by varying degrees of cool-toned greys.

- **Primary (#1456F5):** Used for primary actions, active states, and critical branding moments.
- **Secondary Surface (#F7F8FA):** Utilized for large background areas, sidebars, and grouped content containers to provide subtle separation from the primary workspace.
- **Neutral Accents (#F2F3F5):** Reserved for hover states on light elements and secondary UI chrome.
- **Borders (#E4E6EA):** A thin, low-contrast grey used to define structure without creating visual noise.
- **Text Hierarchy:** Deep charcoal (#1F2329) for headings, slate grey (#646A73) for body text, and light silver (#8F959E) for captions/placeholder text.

## Typography

The design system utilizes **Inter** for its exceptional legibility on digital screens. The typographic scale is optimized for high-density information environments typical of IT ticketing and documentation.

The hierarchy relies on subtle weight shifts rather than dramatic size differences. Body copy is set at 14px for standard density, while 16px is used for long-form knowledge base articles to improve reading stamina. Line heights are intentionally generous (1.5x) to ensure the "warm and responsive" feel requested, preventing the UI from feeling cramped.

## Layout & Spacing

This design system uses a **Fluid Grid** model for dashboard views and a **Fixed Centered** model for content-heavy pages like help articles or submission forms.

- **Grid:** A 12-column system with 20px gutters. 
- **Rhythm:** An 8px spatial grid governs all layout decisions. 
- **Density:** Elements are given significant "breathing room." Content blocks are separated by 24px or 32px to ensure clear visual grouping. 
- **Alignment:** Consistent left-alignment for all text-heavy modules to mirror the reading patterns of an enterprise portal.

## Elevation & Depth

To maintain the "Asian Enterprise" aesthetic, depth is achieved through **Tonal Layers** and **Low-contrast Outlines** rather than heavy shadows.

- **Surface Tiers:** The base layer is pure white. Secondary content (sidebars, search bars) sits on the `#F7F8FA` surface.
- **Shadows:** When necessary for modals or dropdowns, shadows must be extremely diffused. Use a "Large Soft" shadow: `0 8px 24px rgba(31, 35, 41, 0.08)`. 
- **Borders:** Most components use a 1px solid border in `#E4E6EA` to define their shape. Active states use a 1px blue border or a soft blue outer glow (halo).

## Shapes

The shape language is defined by a friendly, approachable radius. 

- **Standard Radius:** 10px is the default for buttons, input fields, and small cards. 
- **Large Radius:** 12px to 16px is used for main content containers and modal windows.
- **Pills:** Used exclusively for status tags (e.g., "In Progress," "Resolved") to distinguish them from actionable buttons.

This consistent rounding softens the technical nature of the IT Helpdesk and creates a cohesive, modern look across all platforms.

## Components

- **Buttons:** Primary buttons are solid `#1456F5` with white text. Secondary buttons use a light blue tint (`#E8F0FF`) with primary blue text. All buttons feature a 10px radius and a medium font weight.
- **Input Fields:** Fields use a white background with an `#E4E6EA` border. Upon focus, the border changes to primary blue with a 2px soft blue focus ring.
- **Cards:** Clean white surfaces with a 1px border. No shadows are used for static cards; a very subtle shadow may appear on hover to indicate interactivity.
- **Status Chips:** Solid backgrounds with low-saturation colors (e.g., light green for "Done," light orange for "Pending") and 12px text.
- **Icons:** Use solid-style iconography. Icons should be colored `#646A73` for neutral states and `#1456F5` for active or primary navigational items.
- **Search Bar:** A prominent component in the Helpdesk. It should be large, featuring a 12px radius, a search icon in the leading position, and a light grey background to differentiate it from the main white surface.