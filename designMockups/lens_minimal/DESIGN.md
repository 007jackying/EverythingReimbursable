# Design System Specification: The Precision Editorial

## 1. Overview & Creative North Star

The "Creative North Star" for this design system is **The Digital Curator**.

Receipt management is traditionally chaotic and tactile; this system seeks to transform that friction into a high-end editorial experience. We move beyond the "utilitarian scanner" by treating data like fine typography and receipts like curated artifacts.

To break the "template" look, we leverage **Intentional Asymmetry** and **Tonal Depth**. By utilizing a high-contrast typography scale and wide-set gutters, we create a layout that feels more like a premium financial journal than a mobile utility. We prioritize the "breath" between elements, ensuring that every piece of data has the space to be seen and understood.

---

## 2. Colors & Surface Philosophy

Our palette is rooted in a sophisticated "Warm Industrial" aesthetic. The Deep Indigo provides an authoritative weight, while the Soft Emerald acts as a surgical precision highlight for AI-verified data.

### Surface Hierarchy & Nesting

We reject the "flat" web. This design system utilizes a "Sheet Layering" approach. Instead of using lines to separate content, we use the hierarchy of `surface` tokens to create natural physical depth.

- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined through background shifts. For instance, a `surface-container-low` card should sit atop a `surface` background.
- **The Glass & Gradient Rule:** For floating navigation or high-level AI modals, use **Glassmorphism**. Apply `surface_container_lowest` at 80% opacity with a `24px` backdrop blur.
- **Signature Textures:** For primary CTA buttons or scanning "active" states, use a subtle linear gradient: `primary` (#070235) to `primary_container` (#1E1B4B). This adds "soul" and depth that prevents the UI from feeling static.

| Token                    | Hex     | Role                                   |
| :----------------------- | :------ | :------------------------------------- |
| `primary`                | #070235 | High-authority text and brand moments. |
| `primary_container`      | #1E1B4B | Primary brand surface / Brand CTAs.    |
| `secondary`              | #006C49 | Success states and verified AI data.   |
| `surface`                | #FAF9F7 | The base canvas (Warm Gray).           |
| `surface_container_low`  | #F4F3F1 | Secondary content groupings.           |
| `surface_container_high` | #E9E8E6 | Inset modules and deeply nested data.  |

---

## 3. Typography: The Editorial Edge

The type system pairs the geometric clarity of DM Sans (represented here by `plusJakartaSans` tokens for modern rendering) with the technical precision of JetBrains Mono (`spaceGrotesk` tokens).

- **Display & Headlines:** Used for "Hero" financial totals and category titles. DM Sans Bold should be set with -0.02em tracking to feel tight and authoritative.
- **Data Monospace:** JetBrains Mono is used for all "Extracted Data" (prices, dates, tax IDs). This signals to the user that the information was "read" by the AI, separating raw data from UI labels.
- **Body:** DM Sans Regular provides a neutral, high-readability experience for descriptions.

---

## 4. Elevation & Depth

In this system, elevation is a property of light and tone, not just shadows.

- **Tonal Layering:** To lift an element, move up the surface scale. Place a `surface_container_lowest` (Pure White) card on a `surface` (Warm Gray) background. This creates a "Natural Lift."
- **Ambient Shadows:** If an element must float (e.g., a Floating Action Button), use a shadow tinted with the `on_surface` color: `box-shadow: 0 12px 32px -4px rgba(26, 28, 27, 0.06);`.
- **The "Ghost Border" Fallback:** If accessibility requires a container boundary, use the `outline_variant` token at **15% opacity**. This creates a "perceived" edge without breaking the minimalist aesthetic.
- **Radius Scale:** The `md` (12px) radius is our standard. Use `full` only for pills/chips.

---

## 5. Components

### Buttons & Inputs

- **Primary CTA:** `primary` background, 12px radius, 48px height. Text in `on_primary` (White). Use the Signature Gradient on hover.
- **Input Fields:** 48px height, `surface_container_low` background. No border. On focus, transition the background to `surface_container_high` and add a 1px "Ghost Border."
- **The AI Scan Button:** Utilize a `secondary` (Emerald) glow effect to signify the "active" intelligent state of the app.

### Cards & Lists

- **The "No-Divider" List:** List items must not be separated by lines. Use `16px` of vertical whitespace. To group items, wrap them in a `surface_container_low` parent container with a 12px radius.
- **Receipt Cards:** Use `surface_container_lowest` with a subtle `xl` (1.5rem) corner radius for a softer, premium feel.

### Chips (Data Tags)

- **Monospaced Chips:** Use JetBrains Mono for the text inside chips. This creates a "label-maker" aesthetic that feels intentional and precise.

### Custom Component: The "Confidence Indicator"

- A small, circular progress ring using `secondary` (Emerald) that appears next to extracted text to show the AI's confidence level—visualizing the technology without clutter.

---

## 6. Do’s and Don’ts

### Do

- **Do** use asymmetrical margins. For example, a 32px left margin and a 16px right margin for a headline to create an editorial look.
- **Do** use `secondary_container` (#6CF8BB) for soft backgrounds behind "Verified" badges.
- **Do** rely on font weight and color (Indigo vs Warm Gray) to establish hierarchy before reaching for a new font size.

### Don’t

- **Don't** use 100% black. Use `on_background` (#1A1C1B) for all primary text to maintain the "warm" minimalist feel.
- **Don't** use standard "drop shadows" with default settings. Always tint your shadows to match the background surface.
- **Don't** crowd the edges. If a container is 12px from the screen edge, ensure the content inside is at least 16-20px from the container edge.
