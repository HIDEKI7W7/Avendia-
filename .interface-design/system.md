# Avendia Design System (`.interface-design/system.md`)

This file guides the AI coding assistant in maintaining visual craft, typography, depth, and spatial rhythm for Avendia.

---

## Direction & Feel

- **Domain Metaphor:** The Pedagogy Workshop & Teacher Portfolio (El Taller Pedagógico y Portafolio Docente).
- **Tone:** Structured, supportive, warm, and highly readable. It should feel like a physical desk organizer or a clean paper portfolio with clear margins, rather than a generic tech platform.
- **Human Context:** A teacher preparing class materials at their desk, requiring rapid visual scanning, clean printed layouts, and absolute clarity on grading structures and lesson flows.

---

## Typography Hierarchy

- **Headings Font:** Montserrat (headings, buttons, tags)
- **Body Font:** Source Sans 3 (body copy, forms, inputs)
- **Scale (Ratio ~1.25):**
  - `display`: 36px / Montserrat Bold / Letter-spacing: -0.02em
  - `h1`: 28px / Montserrat Bold / Letter-spacing: -0.015em
  - `h2`: 22px / Montserrat Bold / Letter-spacing: -0.01em
  - `h3`: 18px / Montserrat SemiBold
  - `h4`: 15px / Montserrat SemiBold
  - `body-lg`: 16px / Source Sans Regular / Leading: 1.6
  - `body`: 14px / Source Sans Regular / Leading: 1.5
  - `label`: 12px / Montserrat SemiBold / Letter-spacing: 0.05em / Uppercase
  - `caption`: 11px / Source Sans Regular / Leading: 1.4 / Muted color

---

## Color World

- **Paper White (Background):** `#FAFBFC` (`--color-bg-main`) - mimicking premium white paper.
- **Pure White (Surfaces):** `#FFFFFF` - for cards, sidebars, and paper canvas.
- **Ink Blue (Text/Dark Neutral):** `#1E293B` (`text-slate-800` / `text-slate-900`) - representing ink pens.
- **Morado IA (Accent/Action):** `#7C6CF2` (`--color-morado-ia`) - intelligence and premium highlights.
- **Azul Educativo (Structure):** `#4A90E2` (`--color-azul-educativo`) - navigation highlights, primary borders.
- **Celeste Amigable (Muted Support):** `#7DD3FC` (`--color-celeste-amigable`) - support banners, notifications.
- **Verde Éxito (Success/Valid):** `#34D399` (`--color-verde-exito`) - positive validation marks, completed status.
- **Borders:** `#E8EDF3` (`--color-border-custom`) - whisper-soft edges.

---

## Depth & Spacing

- **Base Unit:** 4px (all spacing/padding must be multiples of 4px: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`).
- **Depth Strategy:** Subtle border separation + warm elevations. No heavy shadow blocks.
  - *Base Surface:* `#FAFBFC`
  - *Card Surface:* `#FFFFFF` with `border border-[#E8EDF3] shadow-[0_1px_3px_rgba(74,90,226,0.04)]`
  - *Dropdown/Modal Surface:* `#FFFFFF` with `border border-[#E8EDF3] shadow-[0_4px_12px_rgba(30,41,59,0.08)]`
- **Border Radius:**
  - `Button / Input`: 8px (`rounded-lg`)
  - `Card / Canvas`: 12px (`rounded-xl`)
  - `Large Containers / Modals`: 16px (`rounded-2xl`)

---

## Signature Element: The Pedagogy Sheet (Lienzo Pedagógico)

Every generated educational plan, unit, or checklist is rendered inside a **Lienzo Pedagógico**:
- A container with a white sheet background (`bg-white`), thin slate borders (`border-slate-200`), and a layout representing physical printing bounds (A4 proportions visually if possible).
- Left-side margin notes (`text-[10px] text-slate-400 font-mono tracking-tight border-l border-slate-100 pl-2 mt-1`), simulating professional editor margins.

---

## Component Specifications

### 1. Primary Action Button
- **Height:** 40px
- **Padding:** `10px 18px`
- **Typography:** `13px / Montserrat SemiBold`
- **Class:** `bg-morado-ia text-white hover:bg-[#6b5ae0] rounded-xl transition-all duration-150 active:scale-[0.98] shadow-sm shadow-[#7C6CF2]/10`

### 2. Document Card
- **Padding:** `20px` (20px symmetrical)
- **Class:** `bg-white border border-[#E8EDF3] rounded-xl hover:border-morado-ia/30 hover:shadow-md transition-all duration-200`
