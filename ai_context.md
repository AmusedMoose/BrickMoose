# BrickMoose Project Context

## Project Status
* **Architecture**: Static (HTML/CSS/JS).
* **Dependencies**: Zero-dependency (Vanilla JS/CSS).
* **Environment**: 
    * Root (`index.html`, `style.css`, `main.js`): Homepage & Marketing.
    * Commission Hub (`custom/index.html`, `custom/custom.css`): Intake & Services.
* **Backend Status**: Form placeholder defined (method="POST").

## Design System & Patterns
* **Aesthetic**: Dark Mode (Background `#0a0510`), Tech-Industrial, High-End Souvenir Wholesale.
* **Component Patterns**:
    * **Hero**: Parallax-scrolling, high-opacity background overlays, dual-CTA (Primary/Secondary).
    * **Gallery**: Custom draggable snap-carousel (Desktop grab, mobile touch), CSS-only spotlight hover effects.
    * **Forms**: Stepper-based pipeline, card-based layout, responsive grid forms.
    * **Dynamics**: `requestAnimationFrame`-style parallax and mouse-following spotlight glow.
* **Assembly Policy**: JLCPCB assembly user. Component size and manual solderability are non-constraints.

## Technical Requirements
* **Performance**: Hardware acceleration (`will-change: transform`), `scroll-snap` for gallery performance.
* **Responsiveness**: Mobile-first (iPhone SE-target).
* **Maintainability**: Global CSS variables for branding; modular CSS separation.

## Future Development Roadmap
* **Phase 1 (Complete)**: Core static structure & UI/UX.
* **Phase 2 (Pending)**: Form backend integration, Case Study expansion, SEO metadata.