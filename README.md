# Vedant Rajput — Portfolio

An interactive 3D portfolio for my work in AI & Machine Learning. Built with React,
TypeScript and Three.js, with a WebGL character, scroll-driven GSAP choreography and a
physics-based tech stack.

**AI & Machine Learning Engineer** · MSc Data Science & Analytics @ EPITA, Paris
Seeking a 6-month AI & ML internship from July 2026.

[vedantt.rajput@gmail.com](mailto:vedantt.rajput@gmail.com) ·
[LinkedIn](https://www.linkedin.com/in/vedant-rajputt/) ·
[GitHub](https://github.com/vedant-rajput)

---

## Features

- **3D character** — a Draco-compressed GLB rendered in raw Three.js, with
  head tracking that follows the cursor and idle/typing/blink animation blending
- **Scroll choreography** — GSAP ScrollSmoother + ScrollTrigger timelines drive the camera,
  character rotation and section reveals as you scroll
- **Physics tech stack** — 42 rigid bodies in a Rapier scene, each sphere textured with a
  tool I actually work in, reacting to the pointer
- **Project carousel** — the research and engineering work, each linking to its repository

## Tech stack

| Area | Tools |
| --- | --- |
| Core | React 18, TypeScript 5, Vite 5 |
| 3D | Three.js, react-three-fiber, drei, Rapier (physics), Draco, postprocessing |
| Animation | GSAP — ScrollSmoother, ScrollTrigger, SplitText |
| Styling | Plain CSS, per-component |

## Getting started

Requires Node 18+.

```bash
git clone https://github.com/vedant-rajput/vedant.rajput.git
cd vedant.rajput
npm install
npm run dev
```

Then open <http://localhost:5173>. The dev server binds with `--host`, so it's also
reachable from other devices on your network — handy for checking the mobile layout.

| Script | Purpose |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

> **First load takes a moment.** The loading screen waits on the 3D character to fetch
> and compile its shaders. On a machine without GPU acceleration this can take a while.

## Deploying

The site is a static Vite build — deploy `dist/` anywhere (Vercel, Netlify, GitHub
Pages). `ScrollSmoother` and `SplitText` ship free with GSAP 3.13+, so no Club
membership or plugin swap is needed.

```bash
npm run build   # outputs to dist/
```

CI (`.github/workflows/ci.yml`) runs lint + build on every push and pull request.

## Project structure

```text
public/
  draco/          Draco decoder for the compressed model
  images/         Tech-stack sphere textures + project cards
  models/         Character model (.glb) and HDR environment
src/
  components/     Sections — Landing, About, WhatIDo, Career, Work, TechStack, Contact
    Character/    Three.js scene, lighting, animation and mouse utilities
    styles/       Per-component CSS
    utils/        GSAP scroll timelines, intro effects, text splitting
  context/        Loading provider
  data/           Project list, contact constants, bone name maps
  lib/            ScrollSmoother instance store
```

## Credits

Built on an open-source portfolio template, cloned from
[shadhinnandi/Demo-portfolio](https://github.com/shadhinnandi/Demo-portfolio) and released
under the MIT License, © **Rajesh Chityal** ([@raxx21](https://github.com/raxx21)) — whose
copyright notice is retained in [LICENSE](LICENSE) as the licence requires.

The 3D scene architecture and scroll choreography come from that template. All content,
project work, tech-stack assets and copy are my own.

## License

Released under the [MIT License](LICENSE).
