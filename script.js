/**
 * Vedant Rajput — Portfolio
 * Ambient particle field · interactive neural network hero · scroll-drawn Kp chart ·
 * staggered reveals · magnetic buttons · card sheen · footer terminal · contact form.
 */

'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

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
   Hero: interactive neural network
   ============================================================ */
(function neuralNet() {
    const canvas = document.getElementById('net-canvas');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, rafId = null;
    let nodes = [], edges = [], signals = [];
    let layerCount = 0;
    const mouse = { x: -9999, y: -9999 };
    let dragged = null;

    const LAYERS = [4, 6, 7, 6, 3];

    function build() {
        const rect = canvas.getBoundingClientRect();
        w = rect.width; h = rect.height;
        canvas.width = w * DPR;
        canvas.height = h * DPR;
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

        nodes = []; edges = []; signals = [];
        const compact = w < 700;
        const layers = compact ? [3, 4, 4, 3] : LAYERS;
        layerCount = layers.length;
        const x0 = compact ? w * 0.08 : w * 0.52;
        const x1 = compact ? w * 0.92 : w * 0.95;
        const y0 = h * 0.22, y1 = h * 0.78;

        layers.forEach((count, li) => {
            const x = x0 + (x1 - x0) * (li / (layers.length - 1));
            for (let ni = 0; ni < count; ni++) {
                const y = count === 1 ? (y0 + y1) / 2 : y0 + (y1 - y0) * (ni / (count - 1));
                nodes.push({
                    hx: x, hy: y,
                    x, y, vx: 0, vy: 0,
                    r: 5 + Math.random() * 2.5,
                    layer: li,
                    phase: Math.random() * Math.PI * 2,
                });
            }
        });

        let offset = 0;
        for (let li = 0; li < layers.length - 1; li++) {
            const a0 = offset, a1 = offset + layers[li];
            const b0 = a1, b1 = a1 + layers[li + 1];
            for (let a = a0; a < a1; a++) {
                for (let b = b0; b < b1; b++) {
                    if (Math.random() < 0.72) edges.push([a, b]);
                }
            }
            offset += layers[li];
        }
    }

    function spawnSignal() {
        if (!edges.length) return;
        const e = edges[(Math.random() * edges.length) | 0];
        signals.push({ e, t: 0, speed: 0.008 + Math.random() * 0.012 });
    }

    function frame(now) {
        ctx.clearRect(0, 0, w, h);

        for (const n of nodes) {
            if (n === dragged) { n.vx = 0; n.vy = 0; }
            else {
                n.vx += (n.hx - n.x) * 0.02;
                n.vy += (n.hy - n.y) * 0.02;
                const dx = n.x - mouse.x, dy = n.y - mouse.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < 130 * 130 && d2 > 1) {
                    const f = 900 / d2;
                    n.vx += dx * f * 0.02;
                    n.vy += dy * f * 0.02;
                }
                n.vx *= 0.9; n.vy *= 0.9;
                n.x += n.vx; n.y += n.vy;
            }
        }

        ctx.lineWidth = 1;
        for (const [ai, bi] of edges) {
            const a = nodes[ai], b = nodes[bi];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = 'rgba(120, 150, 190, 0.12)';
            ctx.stroke();
        }

        for (let i = signals.length - 1; i >= 0; i--) {
            const s = signals[i];
            s.t += s.speed;
            if (s.t >= 1) { signals.splice(i, 1); continue; }
            const a = nodes[s.e[0]], b = nodes[s.e[1]];
            const x = a.x + (b.x - a.x) * s.t;
            const y = a.y + (b.y - a.y) * s.t;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, 7);
            grad.addColorStop(0, 'rgba(45, 212, 191, 0.9)');
            grad.addColorStop(1, 'rgba(45, 212, 191, 0)');
            ctx.beginPath();
            ctx.arc(x, y, 7, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }

        for (const n of nodes) {
            const pulse = 0.6 + 0.4 * Math.sin(now * 0.0012 + n.phase);
            const isOutput = n.layer === 0 || n.layer === layerCount - 1;
            const color = isOutput ? '167, 139, 250' : '45, 212, 191';

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r + 6 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${0.06 * pulse})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${0.55 + 0.35 * pulse})`;
            ctx.fill();
        }

        if (Math.random() < 0.14) spawnSignal();
        rafId = requestAnimationFrame(frame);
    }

    function localPos(e) {
        const r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    canvas.addEventListener('pointermove', (e) => {
        const p = localPos(e);
        mouse.x = p.x; mouse.y = p.y;
        if (dragged) { dragged.x = p.x; dragged.y = p.y; }
    }, { passive: true });

    canvas.addEventListener('pointerdown', (e) => {
        const p = localPos(e);
        dragged = nodes.find((n) => Math.hypot(n.x - p.x, n.y - p.y) < 22) || null;
        if (dragged) canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointerup', () => { dragged = null; });
    canvas.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });

    window.addEventListener('resize', build, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { cancelAnimationFrame(rafId); rafId = null; }
        else if (!rafId) rafId = requestAnimationFrame(frame);
    });

    build();
    rafId = requestAnimationFrame(frame);
})();

/* ============================================================
   NASA showcase: real model output — actual NASA Kp (stepped)
   vs AI prediction (dashed). Observed line draws on scroll,
   the prediction fades in over it.
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

    // gridlines + axis labels (Kp 0–4, hours 0–200)
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

    // stepped path for the observed series
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

    if (prefersReducedMotion) return;

    // observed line draws on first view; prediction fade is CSS-driven
    line.style.strokeDasharray = '1';
    line.style.strokeDashoffset = '1';
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            io.disconnect();
            line.style.transition = 'stroke-dashoffset 2.4s cubic-bezier(0.22, 1, 0.36, 1) 0.2s';
            requestAnimationFrame(() => { line.style.strokeDashoffset = '0'; });
        }
    }, { threshold: 0.35 });
    io.observe(svg);
})();

/* ============================================================
   Staggered reveal on scroll
   ============================================================ */
(function reveals() {
    const items = document.querySelectorAll('.reveal, .stagger');
    if (!items.length) return;

    document.querySelectorAll('.bento, .timeline, .hero-content, .contact-grid, .show-stats').forEach((group) => {
        let i = 0;
        group.querySelectorAll(':scope > .stagger, :scope > .reveal').forEach((el) => {
            el.style.setProperty('--d', `${Math.min(i * 0.09, 0.6)}s`);
            i++;
        });
    });

    if (prefersReducedMotion) {
        items.forEach((el) => el.classList.add('in-view'));
        return;
    }

    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                io.unobserve(entry.target);
            }
        }
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach((el) => io.observe(el));
})();

/* ============================================================
   Card sheen follows the cursor
   ============================================================ */
document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
});

/* ============================================================
   Magnetic buttons
   ============================================================ */
if (!prefersReducedMotion) {
    document.querySelectorAll('.magnetic').forEach((el) => {
        const strength = 0.22;
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
        el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
}

/* ============================================================
   Nav chrome, hero scroll fade, counters
   ============================================================ */
(function chrome() {
    const navbar = document.getElementById('navbar');
    const bar = document.getElementById('scroll-bar');
    const toTop = document.getElementById('back-to-top');
    const toggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const heroContent = document.getElementById('hero-content');
    const sections = [...document.querySelectorAll('section[id], header[id]')];
    const linkMap = new Map(
        [...document.querySelectorAll('.nav-link')].map((a) => [a.getAttribute('href').slice(1), a])
    );

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY;
            navbar.classList.toggle('scrolled', y > 24);
            toTop.classList.toggle('visible', y > 600);

            const max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;

            // hero content recedes as you scroll away
            if (heroContent && !prefersReducedMotion && y < window.innerHeight) {
                const t = Math.min(y / (window.innerHeight * 0.85), 1);
                heroContent.style.opacity = String(1 - t * 0.9);
                heroContent.style.transform = `translateY(${t * -36}px) scale(${1 - t * 0.04})`;
            }

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

    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

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

    const counters = document.querySelectorAll('.stat-num[data-count]');
    const cio = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            cio.unobserve(entry.target);
            const el = entry.target;
            const target = parseInt(el.dataset.count, 10);
            const start = performance.now();
            const dur = 1200;
            (function tick(now) {
                const t = Math.min((now - start) / dur, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) requestAnimationFrame(tick);
            })(start);
        }
    }, { threshold: 0.6 });
    counters.forEach((el) => cio.observe(el));
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

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
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
