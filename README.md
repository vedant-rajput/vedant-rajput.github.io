# vedant-rajput.github.io

Personal portfolio of **Vedant Rajput** - Data Scientist, M.Sc. Data Science & Analytics at EPITA, Paris.

**Live:** <https://vedant-rajput.github.io/>

## Stack

Hand-written static HTML/CSS/JS - no build step, no framework. Deploys directly via GitHub Pages.
All libraries are vendored locally (zero third-party requests).

- `index.html` - single-page portfolio (hero, about, skills, flagship project showcases, experience, contact)
- `style.css` - dark "deep obsidian" design system: layered glassmorphism, bento grids, self-hosted variable fonts
- `script.js` - GSAP + ScrollTrigger choreography, Lenis smooth scroll, click-to-enter preloader, custom cursor, 3D card tilt, scroll-drawn timeline rails, scroll-scrubbed SVG chart, particle field, footer terminal
- `hero3d.js` - Three.js 3D neural network in the hero (drag to spin, mouse parallax, signal pulses)
- `play/` - interactive neural network playground (see below)
- `vendor/` - GSAP, ScrollTrigger, Lenis, Three.js (pinned, self-hosted)
- `fonts/` - self-hosted Inter & JetBrains Mono (variable woff2, latin subset)
- `assets/icons/` - self-hosted tech icons for the skills pyramid
- `assets/og.png` - social preview card

## The playground

`/play/` is a from-scratch multilayer perceptron - forward pass, binary
cross-entropy and the full backward pass written out by hand in `play/play.js`,
with no ML library underneath. Draw a dataset on the canvas or load a preset
(XOR, circles, moons, spiral), pick an architecture, and watch mini-batch SGD
carve out the decision boundary live.

Sanity check that the gradients are right: XOR with zero hidden layers stalls at
~0.69 loss (`ln 2`, exactly chance, since no linear model can separate XOR),
while a single hidden layer solves it within a few hundred epochs.

## Colour

One accent carries the site: electric teal `#2dd4bf`. `--cyan` only ever appears
as the far end of a teal gradient, and `--teal-soft` is the same hue lightened
for "available / ok" states. `--data-alt` is deliberately *not* a brand colour -
it exists solely to separate the predicted series from the observed one in the
Kp chart, and the two classes in the playground.

## Local development

```sh
python3 -m http.server
# → http://localhost:8000
```

No dependencies, no install.

## Credits

Tech icons in `assets/icons/` are from [Devicon](https://devicon.dev)
([MIT](https://github.com/devicons/devicon/blob/master/LICENSE)). The `pandas`
and `aws` marks have had their near-black fills lightened locally so they remain
legible on the dark background.
