/**
 * Vedant Rajput - Portfolio
 * Hero neural network (Canvas 2D). Layered nodes wired by synapses, with
 * signal pulses travelling left-to-right between layers. The whole web is
 * cursor-reactive: nearby nodes are shoved aside on a spring and light up,
 * their synapses brighten, and the field drifts with a soft parallax, so
 * moving the mouse "pokes" the network alive.
 *
 * Tech: Canvas 2D + rAF, additive glow sprites, per-node spring physics,
 *       cursor repulsion + activation, IntersectionObserver gating.
 */
(function heroNet() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.getElementById('net-canvas');
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // site palette (rgb triplets for additive glow)
    const C_TEAL = '45, 212, 191';
    const C_VIOLET = '167, 139, 250';
    const C_WHITE = '201, 212, 226';

    // pre-rendered additive glow sprite so we never pay for shadowBlur per frame
    function makeGlow(rgb) {
        const s = 64, c = document.createElement('canvas');
        c.width = c.height = s;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
        grad.addColorStop(0, `rgba(${rgb},0.95)`);
        grad.addColorStop(0.35, `rgba(${rgb},0.35)`);
        grad.addColorStop(1, `rgba(${rgb},0)`);
        g.fillStyle = grad; g.fillRect(0, 0, s, s);
        return c;
    }
    const glowTeal = makeGlow(C_TEAL);
    const glowViolet = makeGlow(C_VIOLET);
    const glowWhite = makeGlow(C_WHITE);

    const LAYERS = [3, 5, 6, 6, 5, 4];   // node counts per layer, left -> right
    let W = 0, H = 0;
    let nodes = [], edges = [], pulses = [];

    function build() {
        const r = canvas.parentElement.getBoundingClientRect();
        W = r.width; H = r.height;
        if (!W || !H) return;
        canvas.width = W * dpr; canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // layered columns of nodes inside a central band
        const mx = W * 0.10, uw = W - mx * 2;
        const my = H * 0.16, uh = H - my * 2;
        nodes = [];
        LAYERS.forEach((count, li) => {
            const x = mx + (uw * li) / (LAYERS.length - 1);
            for (let ni = 0; ni < count; ni++) {
                const y = count === 1 ? H / 2 : my + (uh * ni) / (count - 1);
                const hx = x + (Math.random() - 0.5) * uw * 0.05;
                const hy = y + (Math.random() - 0.5) * uh * 0.09;
                const edgeLayer = li === 0 || li === LAYERS.length - 1;
                nodes.push({
                    hx, hy, x: hx, y: hy, vx: 0, vy: 0, act: 0,
                    r: edgeLayer ? 2.6 : 2.0,
                    glow: edgeLayer ? glowTeal : glowWhite,
                    phase: Math.random() * Math.PI * 2,
                    sp: 0.5 + Math.random() * 0.6,
                    amp: 2 + Math.random() * 2.4,
                });
            }
        });

        // synapses between adjacent layers
        edges = [];
        let off = 0;
        for (let li = 0; li < LAYERS.length - 1; li++) {
            const a0 = off, a1 = off + LAYERS[li];
            const b0 = a1, b1 = a1 + LAYERS[li + 1];
            for (let a = a0; a < a1; a++)
                for (let b = b0; b < b1; b++)
                    if (Math.random() < 0.55) edges.push([a, b]);
            off += LAYERS[li];
        }

        // signal pulses riding random synapses (mostly teal, a few violet)
        const count = Math.max(10, Math.round(edges.length * 0.4));
        pulses = Array.from({ length: count }, () => ({
            e: (Math.random() * edges.length) | 0,
            t: Math.random(),
            sp: 0.004 + Math.random() * 0.01,
            glow: Math.random() < 0.25 ? glowViolet : glowTeal,
        }));
    }

    /* ---------- cursor ---------- */
    const ptr = { x: -9999, y: -9999, active: false };
    const par = { x: 0, y: 0 };          // eased parallax offset
    let parTX = 0, parTY = 0;            // parallax target

    window.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        const lx = e.clientX - r.left, ly = e.clientY - r.top;
        ptr.x = lx; ptr.y = ly;
        ptr.active = lx >= 0 && ly >= 0 && lx <= r.width && ly <= r.height;
        parTX = (lx / r.width - 0.5) * 16;
        parTY = (ly / r.height - 0.5) * 12;
    }, { passive: true });

    const R = 180, R2 = R * R, MAXPUSH = 34, STIFF = 0.13, DAMP = 0.80;

    /* ---------- loop ---------- */
    let rafId = null, running = false;

    function frame(now) {
        const t = now * 0.001;
        const tx = ptr.active ? parTX : 0, ty = ptr.active ? parTY : 0;
        par.x += (tx - par.x) * 0.05;
        par.y += (ty - par.y) * 0.05;

        // physics: idle drift + cursor repulsion, integrated with a springy return
        for (const n of nodes) {
            const ix = n.hx + Math.sin(t * n.sp + n.phase) * n.amp;
            const iy = n.hy + Math.cos(t * n.sp * 0.9 + n.phase) * n.amp;
            let tgx = ix, tgy = iy;
            n.act = 0;
            if (ptr.active) {
                const dx = ix - ptr.x, dy = iy - ptr.y;   // measured at rest pos = stable
                const d2 = dx * dx + dy * dy;
                if (d2 < R2) {
                    const d = Math.sqrt(d2) || 1;
                    const f = 1 - d / R;
                    n.act = f;
                    tgx = ix + (dx / d) * f * MAXPUSH;
                    tgy = iy + (dy / d) * f * MAXPUSH;
                }
            }
            n.vx += (tgx - n.x) * STIFF - n.vx * DAMP;
            n.vy += (tgy - n.y) * STIFF - n.vy * DAMP;
            n.x += n.vx; n.y += n.vy;
        }

        // render (additive)
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, W, H);
        ctx.globalCompositeOperation = 'lighter';

        // synapses (brighten where the cursor is charging the web)
        ctx.lineWidth = 1;
        for (const [a, b] of edges) {
            const na = nodes[a], nb = nodes[b];
            const act = na.act > nb.act ? na.act : nb.act;
            ctx.strokeStyle = `rgba(${C_TEAL}, ${0.12 + act * 0.34})`;
            ctx.beginPath();
            ctx.moveTo(na.x + par.x, na.y + par.y);
            ctx.lineTo(nb.x + par.x, nb.y + par.y);
            ctx.stroke();
        }

        // pulses
        if (edges.length) {
            for (const p of pulses) {
                p.t += p.sp;
                if (p.t >= 1) { p.t = Math.random() * 0.12; p.e = (Math.random() * edges.length) | 0; }
                const [a, b] = edges[p.e];
                const na = nodes[a], nb = nodes[b];
                const x = na.x + (nb.x - na.x) * p.t + par.x;
                const y = na.y + (nb.y - na.y) * p.t + par.y;
                ctx.globalAlpha = 0.9;
                ctx.drawImage(p.glow, x - 5, y - 5, 10, 10);
            }
        }

        // nodes (breathe, and flare where the cursor touches them)
        for (const n of nodes) {
            const br = 0.64 + Math.sin(t * 0.9 + n.phase) * 0.14 + n.act * 0.6;
            const size = n.r * 3.9 * (1 + n.act * 0.9);
            ctx.globalAlpha = br < 1 ? br : 1;
            ctx.drawImage(n.glow, n.x + par.x - size / 2, n.y + par.y - size / 2, size, size);
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        rafId = running ? requestAnimationFrame(frame) : null;
    }

    function start() { if (!running) { running = true; if (!rafId) rafId = requestAnimationFrame(frame); } }
    function stop() { running = false; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } }

    /* ---------- layout + lifecycle ---------- */
    let resizeT = null;
    window.addEventListener('resize', () => {
        clearTimeout(resizeT);
        resizeT = setTimeout(build, 150);
    }, { passive: true });

    build();

    new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting && !document.hidden ? start() : stop()));
    }).observe(canvas);

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    start();
})();
