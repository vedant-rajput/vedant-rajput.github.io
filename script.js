/**
 * Vedant Rajput — Portfolio
 * Motion system: Lenis smooth scroll + GSAP/ScrollTrigger choreography,
 * preloader, custom cursor, 3D card tilt, magnetic buttons, scrubbed
 * chart drawing, ambient particles, footer terminal, contact form.
 * (The 3D hero lives in hero3d.js.)
 */

'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);
const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
const EASE = 'power3.out';

if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

/* ============================================================
   Smooth scrolling (Lenis) — skipped for reduced motion
   ============================================================ */
let lenis = null;
if (hasGSAP && !prefersReducedMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.05 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
}

function scrollToTarget(target) {
    const offset = -76;
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 });
    else if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
    else target.scrollIntoView({ behavior: 'smooth' });
}

// anchor navigation goes through Lenis
document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    scrollToTarget(target);
});

/* ============================================================
   Preloader → hero intro
   ============================================================ */
(function preloader() {
    const pre = document.getElementById('preloader');
    if (!pre) return;

    const heroBits = ['.hero-kicker', '.hero-sub', '.hero-btns', '.hero-meta'];
    const lines = document.querySelectorAll('.hero-title .line-inner');

    // No GSAP / reduced motion → skip the show entirely
    if (!hasGSAP || prefersReducedMotion) {
        pre.remove();
        return;
    }

    // Repeat visit this session → short hero intro, no counter
    if (sessionStorage.getItem('vr-seen')) {
        pre.remove();
        gsap.timeline({ defaults: { ease: EASE } })
            .from(lines, { yPercent: 115, duration: 0.9, stagger: 0.1, ease: 'power4.out' })
            .from(heroBits, { opacity: 0, y: 22, duration: 0.8, stagger: 0.08 }, '-=0.55');
        return;
    }
    sessionStorage.setItem('vr-seen', '1');

    if (lenis) lenis.stop();
    const count = document.getElementById('pre-count');
    const tl = gsap.timeline({
        defaults: { ease: EASE },
        onComplete: () => { pre.remove(); if (lenis) lenis.start(); },
    });

    tl.from('.pre-inner', { opacity: 0, y: 14, duration: 0.45 })
        .to({ v: 0 }, {
            v: 100, duration: 0.9, ease: 'power2.inOut',
            onUpdate() { count.textContent = String(Math.round(this.targets()[0].v)).padStart(2, '0'); },
        })
        .to('.pre-inner', { opacity: 0, y: -16, duration: 0.35 })
        .to(pre, { clipPath: 'inset(0 0 100% 0)', duration: 0.85, ease: 'power4.inOut' }, '-=0.05')
        // hero intro overlaps the wipe
        .from(lines, { yPercent: 115, duration: 1.1, stagger: 0.12, ease: 'power4.out' }, '-=0.55')
        .from(heroBits, { opacity: 0, y: 26, duration: 0.9, stagger: 0.09 }, '-=0.7')
        .from('#net-canvas', { opacity: 0, duration: 1.4, ease: 'power2.out' }, '-=0.9')
        .from('.scroll-cue', { opacity: 0, duration: 0.6 }, '-=0.4');
})();

/* ============================================================
   Scroll choreography (GSAP) — falls back to visible content
   ============================================================ */
(function choreography() {
    if (!hasGSAP || prefersReducedMotion) {
        // ensure state-classes still land for CSS-driven pieces
        document.querySelectorAll('.lang-card, .pipeline, .show-visual').forEach((el) => el.classList.add('in-view'));
        return;
    }

    // section heads + standalone reveals (hero is choreographed by the preloader)
    [...document.querySelectorAll('.reveal')].filter((el) => !el.closest('#hero')).forEach((el) => {
        gsap.from(el, {
            opacity: 0, y: 34, duration: 1.1, ease: EASE,
            scrollTrigger: { trigger: el, start: 'top 88%' },
        });
    });

    // bento cards / timeline items — batched stagger
    ScrollTrigger.batch('.stagger', {
        start: 'top 90%',
        once: true,
        onEnter: (batch) => gsap.from(batch, {
            opacity: 0, y: 44, duration: 1.1, ease: EASE, stagger: 0.09,
            clearProps: 'transform', // hand transform back to the tilt system
        }),
    });

    // skills tags ripple in
    document.querySelectorAll('.tags').forEach((group) => {
        gsap.from(group.children, {
            opacity: 0, y: 14, duration: 0.6, ease: EASE, stagger: 0.03,
            scrollTrigger: { trigger: group, start: 'top 92%' },
        });
    });

    // flagship big numbers
    document.querySelectorAll('.show-stats').forEach((row) => {
        gsap.from(row.querySelectorAll('.big-num'), {
            opacity: 0, y: 40, scale: 0.92, duration: 1, ease: 'power4.out', stagger: 0.12,
            scrollTrigger: { trigger: row, start: 'top 85%' },
        });
    });

    // showcase visuals drift slower than the page (parallax)
    document.querySelectorAll('.show-visual, .pipeline').forEach((el) => {
        gsap.fromTo(el, { y: 44 }, {
            y: -30, ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
    });

    // aurora breathes away as you leave the hero; hero content recedes
    gsap.to('#hero-content', {
        opacity: 0.06, y: -60, scale: 0.965, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom 25%', scrub: 0.4 },
    });
    gsap.to('.aurora', {
        opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true },
    });

    // section tags micro-parallax
    document.querySelectorAll('.section-tag, .show-kicker').forEach((el) => {
        gsap.from(el, {
            x: -18, opacity: 0, duration: 0.8, ease: EASE,
            scrollTrigger: { trigger: el, start: 'top 92%' },
        });
    });

    // CSS-state classes (language bars, pipeline lights, prediction fade)
    document.querySelectorAll('.lang-card, .pipeline, .show-visual').forEach((el) => {
        ScrollTrigger.create({
            trigger: el, start: 'top 82%', once: true,
            onEnter: () => el.classList.add('in-view'),
        });
    });

    // stat counters
    document.querySelectorAll('.stat-num[data-count]').forEach((el) => {
        const target = parseInt(el.dataset.count, 10);
        const obj = { v: 0 };
        ScrollTrigger.create({
            trigger: el, start: 'top 88%', once: true,
            onEnter: () => gsap.to(obj, {
                v: target, duration: 1.4, ease: 'power3.out',
                onUpdate: () => { el.textContent = Math.round(obj.v); },
            }),
        });
    });
})();

/* ============================================================
   Ambient background particles (constellation)
   ============================================================ */
(function backgroundParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const mouse = { x: -9999, y: -9999 };
    let particles = [];
    let w = 0, h = 0, rafId = null;

    function resize() {
        w = window.innerWidth;
        h = window.innerHeight;
        canvas.width = w * DPR;
        canvas.height = h * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        const target = Math.min(90, Math.floor((w * h) / 22000));
        particles = Array.from({ length: target }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            r: Math.random() * 1.6 + 0.4,
            hue: Math.random() < 0.8 ? '45, 212, 191' : '167, 139, 250',
        }));
    }

    const LINK_DIST = 110;

    function frame() {
        ctx.clearRect(0, 0, w, h);

        for (const p of particles) {
            const dx = mouse.x - p.x, dy = mouse.y - p.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 160 * 160 && d2 > 1) {
                const f = 0.012 / Math.sqrt(d2);
                p.vx += dx * f;
                p.vy += dy * f;
            }
            p.vx *= 0.985; p.vy *= 0.985;
            p.x += p.vx; p.y += p.vy;
            if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
            if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.hue}, 0.45)`;
            ctx.fill();
        }

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const a = particles[i], b = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d = Math.hypot(dx, dy);
                if (d < LINK_DIST) {
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(45, 212, 191, ${0.10 * (1 - d / LINK_DIST)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        rafId = requestAnimationFrame(frame);
    }

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
        else if (!rafId) rafId = requestAnimationFrame(frame);
    });

    resize();
    rafId = requestAnimationFrame(frame);
})();

/* ============================================================
   NASA showcase: actual vs predicted Kp — the observed line
   is drawn by your scroll position (scrubbed)
   ============================================================ */
(function kpChart() {
    const svg = document.getElementById('kp-chart');
    if (!svg) return;

    const NS = 'http://www.w3.org/2000/svg';
    const W = 860, H = 320;
    const M = { l: 34, r: 12, t: 14, b: 36 };
    const plotW = W - M.l - M.r, plotH = H - M.t - M.b;
    const KP_MAX = 5, HOURS = 200;

    const xFor = (h) => M.l + (plotW * h) / HOURS;
    const yFor = (kp) => M.t + plotH * (1 - kp / KP_MAX);
    const el = (name, attrs) => {
        const n = document.createElementNS(NS, name);
        for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
        return n;
    };

    // Actual NASA Kp — quantized steps: [hour the value starts, Kp]
    const actual = [
        [0, 1.3], [3, 1.7], [10, 2], [13, 2.3], [16, 3], [19, 2], [21, 1.7], [26, 2.7],
        [29, 2.3], [30, 2.7], [31, 1.7], [34, 3], [37, 2.7], [40, 0.7], [43, 2], [46, 1.3],
        [49, 2.7], [52, 4.3], [55, 3.3], [58, 1.7], [61, 1], [64, 1.3], [67, 1.7], [70, 2],
        [73, 1], [76, 0.3], [79, 0], [84, 0.3], [92, 1], [100, 0], [102, 0.7], [105, 1],
        [108, 2.7], [111, 3], [113, 4], [121, 2.7], [124, 1.7], [127, 1], [129, 2.7],
        [132, 2.3], [134, 2], [137, 2.7], [148, 4.7], [151, 4], [154, 2.3], [157, 2.7],
        [160, 2.3], [163, 2], [166, 2.3], [169, 3], [171, 1.7], [175, 2.3], [178, 1.7],
        [181, 2], [183, 2.7], [186, 4], [189, 2.3], [192, 3.7], [195, 3], [198, 3.3],
    ];

    // Predicted Kp (AI) — smooth curve keypoints
    const predicted = [
        [0, 2.35], [5, 2.6], [7, 2.7], [10, 2.5], [13, 2.3], [15, 2.15], [18, 2.7],
        [20, 2.85], [23, 2.9], [26, 3.1], [28, 2.9], [30, 2.8], [32, 2.9], [34, 3.0],
        [36, 3.5], [38, 3.7], [40, 3.3], [43, 2.4], [45, 2.0], [47, 2.05], [49, 2.35],
        [51, 2.4], [53, 2.35], [55, 2.5], [57, 2.6], [59, 2.3], [61, 2.0], [63, 1.6],
        [65, 1.2], [67, 1.1], [69, 1.15], [71, 1.8], [73, 1.75], [75, 1.6], [77, 1.5],
        [79, 1.45], [82, 1.35], [85, 1.3], [88, 1.3], [90, 1.35], [92, 1.3], [94, 1.5],
        [96, 1.8], [98, 2.0], [100, 1.9], [102, 1.95], [104, 1.75], [106, 2.0], [108, 2.3],
        [110, 2.5], [112, 2.7], [113, 3.3], [114, 2.9], [116, 3.1], [118, 3.9], [119, 4.5],
        [120, 4.1], [122, 3.8], [124, 3.5], [126, 3.0], [128, 2.85], [130, 2.7], [133, 2.7],
        [135, 2.9], [137, 3.0], [139, 2.7], [141, 2.4], [143, 2.1], [145, 2.0], [147, 2.05],
        [149, 2.4], [151, 2.3], [152, 2.1], [153, 3.0], [155, 4.1], [157, 3.7], [159, 3.5],
        [161, 3.3], [163, 3.4], [165, 3.0], [167, 2.6], [169, 2.4], [171, 2.3], [173, 2.4],
        [175, 2.4], [177, 2.35], [178, 2.8], [180, 2.5], [182, 2.3], [184, 2.2], [186, 1.9],
        [188, 1.8], [190, 2.1], [192, 2.8], [194, 2.4], [196, 2.5], [198, 2.3], [200, 2.2],
    ];

    for (let kp = 0; kp <= 4; kp++) {
        const y = yFor(kp);
        svg.appendChild(el('line', { class: 'kp-grid', x1: M.l, x2: W - M.r, y1: y, y2: y }));
        const label = el('text', { class: 'kp-label', x: M.l - 8, y: y + 4, 'text-anchor': 'end' });
        label.textContent = kp;
        svg.appendChild(label);
    }
    for (let h = 0; h <= HOURS; h += 25) {
        const x = xFor(h);
        svg.appendChild(el('line', { class: 'kp-grid', x1: x, x2: x, y1: M.t, y2: H - M.b }));
        if (h % 50 === 0) {
            const label = el('text', { class: 'kp-label', x, y: H - M.b + 16, 'text-anchor': 'middle' });
            label.textContent = h;
            svg.appendChild(label);
        }
    }
    const xAxis = el('text', { class: 'kp-label', x: M.l + plotW / 2, y: H - 4, 'text-anchor': 'middle' });
    xAxis.textContent = 'hours';
    svg.appendChild(xAxis);

    let stepD = `M${xFor(actual[0][0]).toFixed(1)},${yFor(actual[0][1]).toFixed(1)}`;
    for (let i = 1; i < actual.length; i++) {
        const x = xFor(actual[i][0]).toFixed(1);
        stepD += ` L${x},${yFor(actual[i - 1][1]).toFixed(1)} L${x},${yFor(actual[i][1]).toFixed(1)}`;
    }
    stepD += ` L${xFor(HOURS).toFixed(1)},${yFor(actual[actual.length - 1][1]).toFixed(1)}`;

    const predD = 'M' + predicted
        .map(([h, kp]) => `${xFor(h).toFixed(1)},${yFor(kp).toFixed(1)}`)
        .join(' L');

    const line = el('path', { class: 'kp-line', d: stepD, pathLength: 1 });
    svg.appendChild(line);
    svg.appendChild(el('path', { class: 'kp-pred', d: predD }));

    if (!hasGSAP || prefersReducedMotion) return;

    // scrubbed draw: the line follows your scroll through the visual
    gsap.set(line, { strokeDasharray: 1, strokeDashoffset: 1 });
    gsap.to(line, {
        strokeDashoffset: 0, ease: 'none',
        scrollTrigger: {
            trigger: '.show-visual',
            start: 'top 85%',
            end: 'top 25%',
            scrub: 0.5,
        },
    });
})();

/* ============================================================
   3D card tilt + cursor-tracked sheen
   ============================================================ */
(function cardTilt() {
    const cards = document.querySelectorAll('.card:not(.contact-form):not(.terminal)');

    cards.forEach((card) => {
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
        }, { passive: true });
    });

    if (!hasGSAP || prefersReducedMotion || !finePointer) return;

    cards.forEach((card) => {
        const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        const y = gsap.quickTo(card, 'y', { duration: 0.6, ease: 'power3.out' });
        gsap.set(card, { transformPerspective: 900 });

        card.addEventListener('pointerenter', () => y(-6));
        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            rx(py * -6);
            ry(px * 8);
        }, { passive: true });
        card.addEventListener('pointerleave', () => { rx(0); ry(0); y(0); });
    });
})();

/* ============================================================
   Magnetic buttons
   ============================================================ */
(function magnetic() {
    if (!hasGSAP || prefersReducedMotion || !finePointer) return;

    document.querySelectorAll('.magnetic, .nav-cta, .nav-icon, .show-link').forEach((el) => {
        const strength = el.classList.contains('magnetic') ? 0.28 : 0.35;
        const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
        const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            x((e.clientX - r.left - r.width / 2) * strength);
            yTo((e.clientY - r.top - r.height / 2) * strength);
        }, { passive: true });
        el.addEventListener('pointerleave', () => {
            gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
        });
    });
})();

/* ============================================================
   Custom cursor — dot leads, ring follows; labels over links
   ============================================================ */
(function cursor() {
    if (!hasGSAP || prefersReducedMotion || !finePointer) return;
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const label = document.getElementById('cursor-label');
    if (!dot || !ring) return;

    document.body.classList.add('has-cursor');

    const dotX = gsap.quickSetter(dot, 'x', 'px');
    const dotY = gsap.quickSetter(dot, 'y', 'px');
    const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
    const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

    gsap.set([dot, ring], { xPercent: 0, yPercent: 0, opacity: 0 });

    window.addEventListener('pointermove', (e) => {
        gsap.to([dot, ring], { opacity: 1, duration: 0.3, overwrite: 'auto' });
        dotX(e.clientX); dotY(e.clientY);
        ringX(e.clientX); ringY(e.clientY);
    }, { passive: true });

    document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.3 }));

    // context-aware states
    const scaleRing = gsap.quickTo(ring, 'scale', { duration: 0.35, ease: 'power3.out' });
    document.addEventListener('mouseover', (e) => {
        const openable = e.target.closest('.proj-link, .show-link, .cert-list a, .contact-link');
        const interactive = e.target.closest('a, button, .card');
        const typing = e.target.closest('input, textarea');

        if (typing) {
            gsap.to([dot, ring], { opacity: 0, duration: 0.2, overwrite: 'auto' });
            return;
        }
        gsap.to([dot, ring], { opacity: 1, duration: 0.2, overwrite: 'auto' });

        if (openable) {
            label.textContent = 'open';
            ring.classList.add('is-label');
            scaleRing(1.9);
            gsap.to(dot, { scale: 0, duration: 0.25 });
        } else {
            ring.classList.remove('is-label');
            scaleRing(interactive ? 1.5 : 1);
            gsap.to(dot, { scale: interactive ? 0.5 : 1, duration: 0.25 });
        }
    });
})();

/* ============================================================
   Nav chrome: shrink, hide-on-scroll-down, active link,
   progress bar, mobile menu, back-to-top
   ============================================================ */
(function chrome() {
    const navbar = document.getElementById('navbar');
    const bar = document.getElementById('scroll-bar');
    const toTop = document.getElementById('back-to-top');
    const toggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const sections = [...document.querySelectorAll('section[id], header[id]')];
    const linkMap = new Map(
        [...document.querySelectorAll('.nav-link')].map((a) => [a.getAttribute('href').slice(1), a])
    );

    let lastY = 0;
    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            navbar.classList.toggle('scrolled', y > 24);
            toTop.classList.toggle('visible', y > 600);

            // hide nav scrolling down, reveal scrolling up
            if (hasGSAP && !prefersReducedMotion && !navLinks.classList.contains('open')) {
                const goingDown = y > lastY && y > 300;
                gsap.to(navbar, { yPercent: goingDown ? -100 : 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
            }
            lastY = y;

            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

            let current = null;
            for (const s of sections) {
                if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) current = s.id;
            }
            linkMap.forEach((a, id) => {
                const active = id === current;
                a.classList.toggle('active', active);
                if (active) a.setAttribute('aria-current', 'true');
                else a.removeAttribute('aria-current');
            });
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    toTop.addEventListener('click', () => scrollToTarget(0));

    toggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('open');
        toggle.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
            navLinks.classList.remove('open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
})();

/* ============================================================
   Footer terminal — typed system log + rotating quotes
   ============================================================ */
(function terminal() {
    const body = document.getElementById('terminal-body');
    if (!body) return;

    const bootAt = Date.now();
    const quotes = [
        '"In God we trust. All others must bring data." — W. E. Deming',
        '"All models are wrong, but some are useful." — G. Box',
        '"Data is the new oil, but refined models are the engine."',
        '"Torture the data, and it will confess to anything." — R. Coase',
        '"The goal is to turn data into information, and information into insight." — C. Fiorina',
        '"The world is one big data problem." — Andrew McAfee',
        '"Without data, you\'re just another person with an opinion." — W. Edwards Deming',
        '"Data is a precious thing and will last longer than the systems themselves." — T. Berners-Lee',
        '"In God we trust, all others bring data." — W. Edwards Deming',
        '"Data is like garbage. You\'d better know what you are going to do with it before you collect it." — M. Loukides',
        '"The most valuable commodity I know of is information." — G. Moore',
        '"Data is the sword of the 21st century, those who wield it well, the samurai." — J. Rosenberg',
        '"Big data is at the foundation of all the megatrends that are happening." — E. Schmidt',
        '"Data is a tool for enhancing intuition." — H. Davenport',
        '"The purpose of computing is insight, not numbers." — R. Tukey',
        '"Data beats emotions." — S. Jobs',
        '"Data is the new science. Big Data holds the answers." — Pat Gelsinger',
        '"Data is a precious thing and will last longer than the systems themselves." — Tim Berners-Lee',
        '"The goal is to turn data into information, and information into insight." — Carly Fiorina',
    ];

    function uptime() {
        const s = Math.floor((Date.now() - bootAt) / 1000);
        const m = String(Math.floor(s / 60)).padStart(2, '0');
        return `00:${m}:${String(s % 60).padStart(2, '0')}`;
    }

    let qi = 0;
    const lines = () => [
        { html: `<span class="prompt">$</span> systemctl status vedant.service`, delay: 0 },
        { html: `<span class="ok">● active (running)</span> · uptime ${uptime()} · models loaded: 8/8 · gpu: dreaming`, delay: 600 },
        { html: `<span class="prompt">$</span> echo $QUOTE_OF_THE_SESSION`, delay: 1400 },
        { html: quotes[qi % quotes.length], delay: 2000 },
    ];

    function render(seq, i) {
        if (i >= seq.length) {
            setTimeout(() => { qi++; body.innerHTML = ''; render(lines(), 0); }, 9000);
            return;
        }
        setTimeout(() => {
            const div = document.createElement('div');
            div.innerHTML = seq[i].html + (i === seq.length - 1 ? ' <span class="cursor-block"></span>' : '');
            const prev = body.querySelector('.cursor-block');
            if (prev) prev.remove();
            body.appendChild(div);
            render(seq, i + 1);
        }, i === 0 ? 0 : seq[i].delay - seq[i - 1].delay);
    }

    if (prefersReducedMotion) {
        body.innerHTML = lines().map((l) => `<div>${l.html}</div>`).join('');
    } else {
        render(lines(), 0);
    }
})();

/* ============================================================
   Contact form (Web3Forms)
   ============================================================ */
(function contactForm() {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form) return;

    // the plane takes off through the button; a light sweep crosses the card
    function playSendFX() {
        if (!hasGSAP || prefersReducedMotion) return;
        const plane = form.querySelector('.btn .plane');
        const sweep = form.querySelector('.form-sweep');

        if (plane) {
            gsap.timeline()
                // gentle lift-off: eases in, banks, and glides out of the button
                .to(plane, { x: 26, y: -10, rotation: 12, scale: 1.15, duration: 0.45, ease: 'power1.in' })
                .to(plane, { x: 130, y: -85, rotation: 42, scale: 0.85, opacity: 0, duration: 0.75, ease: 'power2.in' })
                // a new plane drifts back in and settles with a soft overshoot
                .fromTo(plane,
                    { x: -90, y: 52, rotation: -26, scale: 0.9, opacity: 0 },
                    { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.3, ease: 'back.out(1.4)' },
                    '+=0.35');
        }
        if (sweep) {
            gsap.fromTo(sweep, { x: '-130%' }, {
                x: '130%', duration: 2.1, ease: 'sine.inOut', delay: 0.15,
            });
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        playSendFX();
        const btn = form.querySelector('button[type="submit"]');
        btn.disabled = true;
        status.classList.remove('error');
        status.textContent = '→ transmitting...';

        try {
            const res = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                body: JSON.stringify(Object.fromEntries(new FormData(form))),
            });
            const data = await res.json();
            if (data.success) {
                status.textContent = '✓ message received — I\'ll get back to you soon.';
                form.reset();
            } else {
                throw new Error(data.message || 'submission failed');
            }
        } catch {
            status.classList.add('error');
            status.textContent = '✗ something went wrong — email me directly at vedantt.rajput@gmail.com';
        } finally {
            btn.disabled = false;
        }
    });
})();
