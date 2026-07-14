# vedant-rajput.github.io

Personal portfolio of **Vedant Rajput** — Data Scientist, M.Sc. Data Science & Analytics at EPITA, Paris.

**Live:** <https://vedant-rajput.github.io/>

## Stack

Hand-written static HTML/CSS/JS — no build step, no framework. Deploys directly via GitHub Pages.
All libraries are vendored locally (zero third-party requests).

- `index.html` — single-page portfolio (hero, about, skills, flagship project showcases, experience, contact)
- `style.css` — dark "deep obsidian" design system: layered glassmorphism, bento grids, self-hosted variable fonts
- `script.js` — GSAP + ScrollTrigger choreography, Lenis smooth scroll, preloader, custom cursor, 3D card tilt, scroll-scrubbed SVG chart, particle field, footer terminal
- `hero3d.js` — Three.js 3D neural network in the hero (drag to spin, mouse parallax, signal pulses)
- `vendor/` — GSAP, ScrollTrigger, Lenis, Three.js (pinned, self-hosted)
- `fonts/` — self-hosted Inter & JetBrains Mono (variable woff2, latin subset)
- `assets/og.png` — social preview card

## Local development

```sh
python3 -m http.server
# → http://localhost:8000
```

No dependencies, no install.
