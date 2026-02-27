# Space Tourism -- Multi-Page Website

This is a fully responsive static site featuring four pages with tabbed content navigation, built with Astro and SCSS.

![Design preview for the Space tourism website coding challenge](./preview.jpg)

---

## Tech Stack

| Technology                    | Purpose                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| [Astro](https://astro.build/) | Static site generator, component templating, scoped styles |
| SCSS (via `sass`)             | Styling with variables, mixins, and partials               |
| Vanilla JavaScript            | Tab switching and mobile menu toggle (no framework)        |
| Google Fonts                  | Bellefair, Barlow, Barlow Condensed                        |

**Tooling:** ESLint, Prettier, commitlint (conventional commits), lint-staged, simple-git-hooks.

---

## Project Structure

```shell
  src/
    components/
      Header.astro             # Site header with nav and mobile hamburger menu
      NumberedTitle.astro       # Section headings with a numbered prefix (e.g. "01 Pick your destination")
      TabBar.astro              # Text tab buttons for Destination page
      DotIndicators.astro       # Dot navigation for Crew page
      NumberedIndicators.astro  # Numbered circle buttons for Technology page
    data/
      data.json                 # All content: destinations, crew, technology
    layouts/
      MainLayout.astro          # Shared HTML shell (head, fonts, responsive backgrounds)
    pages/
      index.astro               # Home page
      destination.astro         # Destination page with tab switching
      crew.astro                # Crew page with dot navigation
      technology.astro          # Technology page with numbered navigation
    styles/
      _variables.scss           # Colors, fonts, font sizes, breakpoints, spacing
      _mixins.scss              # Responsive breakpoint mixins, responsive-bg mixin
      _reset.scss               # CSS reset / normalization
      _typography.scss          # Utility classes for font families, sizes, colors
      global.scss               # Entrypoint: imports partials, page wrapper, grid system, visibility
  public/
    assets/                     # Images and icons served at /assets/...
```

---

## Architecture Patterns

### Content Panel Visibility via `data-visible`

All tab/content switching uses a single pattern: every content panel is rendered in the HTML at build time, then shown or hidden by toggling a `data-visible` attribute between `"true"` and `"false"`. Global CSS in `global.scss` handles the transitions:

```scss
[data-visible="false"] {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.4s ease-in-out,
    visibility 0.4s ease-in-out;
}

[data-visible="true"] {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transition:
    opacity 0.4s ease-in-out,
    visibility 0.4s ease-in-out;
  transition-delay: 0.2s;
}
```

This produces a crossfade effect: the outgoing panel fades out immediately, and the incoming panel fades in after a 200ms delay.

### Grid Stacking for Tab Panels

Content panels that occupy the same visual space (e.g., destination images, crew info articles) are stacked using CSS Grid with all panels placed on `grid-area: 1 / 1`. Only the panel with `data-visible="true"` is visible. This avoids layout shifts when switching between tabs because every panel occupies the same grid cell.

### Responsive Background Mixin

Each page has a unique background image for mobile, tablet, and desktop. The `MainLayout` applies a modifier class (`page-wrapper--{section}`), and the `responsive-bg` mixin in `_mixins.scss` generates the correct `background-image` declarations:

```scss
@mixin responsive-bg($section) {
  background-image: url("/assets/#{$section}/background-#{$section}-mobile.jpg");
  background-size: cover;
  @include tablet {
    background-image: url("/assets/#{$section}/background-#{$section}-tablet.jpg");
  }
  @include desktop {
    background-image: url("/assets/#{$section}/background-#{$section}-desktop.jpg");
  }
}
```

### Page Wrapper Grid

The `.page-wrapper` uses a two-row grid (`min-content 1fr`) to ensure the header takes its natural height and the main content fills the remaining viewport space. This is critical for full-viewport background images.

---

## Tab / Content Switching

Each page with interactive navigation (Destination, Crew, Technology) follows the same vanilla JS pattern in a `<script>` tag:

1. Query all navigation buttons and all `.content-panel` elements on the page.
2. On button click, set all buttons to `aria-selected="false"` and all panels to `data-visible="false"`.
3. Calculate the correct panel indices to show. Since images and text panels are separate groups of `.content-panel` elements, the script shows both `panels[i]` (one group) and `panels[i + groupCount]` (the other group).

Example from the Destination page:

```js
const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".content-panel");
const imageCount = document.querySelectorAll(
  ".destination-images .content-panel",
).length;

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
    tab.setAttribute("aria-selected", "true");
    panels.forEach((p) => p.setAttribute("data-visible", "false"));
    panels[i]?.setAttribute("data-visible", "true");
    panels[i + imageCount]?.setAttribute("data-visible", "true");
  });
});
```

All indicator components use proper `role="tablist"` and `role="tab"` ARIA attributes for accessibility.

---

## Responsive Design

### Approach

Mobile-first. Base styles target mobile, then `@include tablet` and `@include desktop` mixins layer on overrides.

### Breakpoints

| Name    | Value  | Pixels |
| ------- | ------ | ------ |
| Tablet  | `35em` | ~560px |
| Desktop | `45em` | ~720px |

### Layout Strategy

- **Mobile:** Single-column grid, centered text, stacked sections.
- **Tablet:** Wider padding, adjusted font sizes, some horizontal layouts (e.g., destination meta).
- **Desktop:** Multi-column grid layouts using named `grid-template-areas`. The base `.grid-container` switches to a 4-column layout: `minmax(1rem, 1fr) repeat(2, minmax(0, 40rem)) minmax(1rem, 1fr)`.

Each page overrides `grid-template-areas` at the desktop breakpoint to position title, content, and images in a two-column arrangement.

### Font Sizing

Font sizes are defined as SCSS variables with mobile-first values and progressively larger values applied at tablet and desktop breakpoints in `_typography.scss`. The hero heading (`fs-900`) uses `clamp()` for fluid scaling.

---

## Component Overview

| Component            | Props                  | Description                                                                                                                                                                              |
| -------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MainLayout`         | `title`, `section`     | Wraps every page. Renders the `<html>` shell, loads fonts, imports global styles, applies the section-specific background via `page-wrapper--{section}`.                                 |
| `Header`             | `activeNav`            | Site navigation with logo, nav links, and mobile hamburger toggle. Highlights the active page. Uses a glassmorphic backdrop-filter nav bar. On mobile, the nav slides in from the right. |
| `NumberedTitle`      | `number`, `text`       | Section heading (`<h1>`) with a dimmed number prefix (e.g., "01"). Used on Destination, Crew, and Technology pages.                                                                      |
| `TabBar`             | `items` (string array) | Row of text tab buttons with underline indicators. Used on the Destination page.                                                                                                         |
| `DotIndicators`      | `count`                | Row of circular dot buttons. Used on the Crew page.                                                                                                                                      |
| `NumberedIndicators` | `count`                | Row of numbered circle buttons. Switches to a vertical column on desktop. Used on the Technology page.                                                                                   |

---

## Styling Architecture

### SCSS Module System

All partials use the modern `@use` syntax (not `@import`). Each file imports only its own dependencies:

```scss
@use "../styles/variables" as *;
@use "../styles/mixins" as *;
```

### Partials

| File               | Contents                                                                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_variables.scss`  | Design tokens: colors (`$clr-dark`, `$clr-light`, `$clr-white`), font families, font size scale (`$fs-200` through `$fs-900`), breakpoints, spacing                   |
| `_mixins.scss`     | `tablet` and `desktop` breakpoint mixins, `responsive-bg` mixin                                                                                                       |
| `_reset.scss`      | Box-sizing, margin resets, image defaults, form element normalization                                                                                                 |
| `_typography.scss` | Utility classes for font family (`.ff-serif`, `.ff-sans-cond`), font size (`.fs-500`, `.fs-800`), color (`.text-light`, `.text-dark`), letter spacing, text transform |
| `global.scss`      | Imports all partials, defines `.page-wrapper`, `.grid-container`, `.sr-only`, and the `[data-visible]` transition rules                                               |

### Scoped vs Global Styles

- **Global styles** (`global.scss`): Layout primitives, typography utilities, visibility transitions, page wrapper backgrounds.
- **Scoped styles** (`<style lang="scss">` in components): Component-specific layout and appearance. Astro automatically scopes these with unique class hashes.
- **Page-level `is:global` styles**: Used sparingly when a page needs to style elements outside its scoped boundary (e.g., the home page styling `.page-wrapper--home main`).

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Install and Run

```bash
# Install dependencies
npm install

# Start the development server
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

### Linting

```bash
  npm run lint
```

Pre-commit hooks run ESLint and Prettier automatically via `lint-staged`.

---

## Conventions

### Git

- **Branch naming:** Must follow `type/description` format (e.g., `feat/add-crew-page`, `fix/responsive-nav`). Enforced by a pre-push hook.
- **Commit messages:** Follow [Conventional Commits](https://www.conventionalcommits.org/) specification. Enforced by commitlint.

### Code

- **SCSS imports:** Always use `@use` with `as *`. Never use the deprecated `@import`.
- **Responsive styles:** Use `@include tablet` and `@include desktop` mixins rather than writing raw media queries.
- **Tab content:** Render all panels in the HTML. Toggle visibility with `data-visible`. Never dynamically insert or remove DOM nodes for tab switching.
- **Component styles:** Use Astro scoped `<style lang="scss">` by default. Only use `is:global` when you need to reach outside the component boundary.
- **Background images:** Use the `responsive-bg` mixin via the `.page-wrapper--{section}` modifier class. Place image assets in `public/assets/{section}/`.
- **Data:** All content lives in `src/data/data.json`. Image paths in the JSON reference `/assets/...` (the `public/` directory root).
- **Accessibility:** Navigation indicators use `role="tablist"` and `role="tab"` with `aria-selected`. The mobile menu toggle uses `aria-expanded` and `aria-controls`. Screen-reader-only text uses the `.sr-only` utility class.
