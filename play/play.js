/* ============================================================
   The playground - a multilayer perceptron trained with plain
   mini-batch SGD. Forward pass, binary cross-entropy and the
   full backward pass are written out by hand; there is no
   library underneath this, which is the entire point.

   Coordinate space: inputs live in [-1, 1] on both axes.
   Labels: 1 = class A (teal), 0 = class B (violet).
   ============================================================ */

const TEAL = [45, 212, 191];
const VIOLET = [167, 139, 250];

/* ---------- small numeric helpers ---------- */

// Box-Muller, so the presets get believable Gaussian jitter
function randn() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const sigmoid = (z) => 1 / (1 + Math.exp(-z));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function activate(z, kind) {
    return kind === 'relu' ? Math.max(0, z) : Math.tanh(z);
}
// derivative expressed in terms of the pre-activation z
function dActivate(z, kind) {
    if (kind === 'relu') return z > 0 ? 1 : 0;
    const t = Math.tanh(z);
    return 1 - t * t;
}

/* ---------- the network ---------- */

// sizes e.g. [2, 8, 8, 1] - W[l] maps sizes[l] → sizes[l+1]
function makeNet(sizes, act) {
    const W = [], b = [];
    for (let l = 0; l < sizes.length - 1; l++) {
        const fanIn = sizes[l], fanOut = sizes[l + 1];
        // He for relu, Xavier for tanh - otherwise deep nets start dead or saturated
        const scale = act === 'relu' ? Math.sqrt(2 / fanIn) : Math.sqrt(1 / fanIn);
        W.push(Array.from({ length: fanOut }, () =>
            Array.from({ length: fanIn }, () => randn() * scale)));
        b.push(new Array(fanOut).fill(0));
    }
    return { W, b, sizes, act };
}

function forward(net, input) {
    const acts = [input];
    const zs = [];
    const last = net.W.length - 1;

    for (let l = 0; l <= last; l++) {
        const prev = acts[l];
        const z = new Array(net.W[l].length);
        for (let i = 0; i < net.W[l].length; i++) {
            const row = net.W[l][i];
            let s = net.b[l][i];
            for (let j = 0; j < row.length; j++) s += row[j] * prev[j];
            z[i] = s;
        }
        zs.push(z);
        // the output neuron is always a sigmoid; hidden layers use the chosen activation
        acts.push(l === last ? z.map(sigmoid) : z.map((v) => activate(v, net.act)));
    }
    return { acts, zs };
}

const predict = (net, x, y) => forward(net, [x, y]).acts[net.W.length][0];

function zerosLike(net) {
    return {
        gW: net.W.map((layer) => layer.map((row) => new Array(row.length).fill(0))),
        gb: net.b.map((row) => new Array(row.length).fill(0)),
    };
}

// One example's contribution to the batch gradient. Returns its prediction.
function backprop(net, point, grads) {
    const { acts, zs } = forward(net, [point.x, point.y]);
    const L = net.W.length;
    const out = acts[L][0];

    // sigmoid + binary cross-entropy collapse to this on the output layer
    let delta = [out - point.label];

    for (let l = L - 1; l >= 0; l--) {
        for (let i = 0; i < net.W[l].length; i++) {
            grads.gb[l][i] += delta[i];
            const row = net.W[l][i], gRow = grads.gW[l][i], prevAct = acts[l];
            for (let j = 0; j < row.length; j++) gRow[j] += delta[i] * prevAct[j];
        }
        if (l > 0) {
            const prevDelta = new Array(net.sizes[l]).fill(0);
            for (let j = 0; j < net.sizes[l]; j++) {
                let s = 0;
                for (let i = 0; i < net.W[l].length; i++) s += net.W[l][i][j] * delta[i];
                prevDelta[j] = s * dActivate(zs[l - 1][j], net.act);
            }
            delta = prevDelta;
        }
    }
    return out;
}

const bce = (p, y) => {
    const q = clamp(p, 1e-7, 1 - 1e-7);
    return -(y * Math.log(q) + (1 - y) * Math.log(1 - q));
};

function trainEpoch(net, data, lr, batchSize = 24) {
    if (!data.length) return null;

    // shuffle in place (Fisher-Yates) so batches differ between epochs
    for (let i = data.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [data[i], data[j]] = [data[j], data[i]];
    }

    let lossSum = 0, correct = 0;

    for (let start = 0; start < data.length; start += batchSize) {
        const batch = data.slice(start, start + batchSize);
        const grads = zerosLike(net);

        for (const p of batch) {
            const out = backprop(net, p, grads);
            lossSum += bce(out, p.label);
            if ((out >= 0.5 ? 1 : 0) === p.label) correct++;
        }

        const scale = lr / batch.length;
        for (let l = 0; l < net.W.length; l++) {
            for (let i = 0; i < net.W[l].length; i++) {
                net.b[l][i] -= scale * grads.gb[l][i];
                const row = net.W[l][i], gRow = grads.gW[l][i];
                for (let j = 0; j < row.length; j++) row[j] -= scale * gRow[j];
            }
        }
    }
    return { loss: lossSum / data.length, acc: correct / data.length };
}

/* ---------- datasets ---------- */

const presets = {
    xor(n, noise) {
        const out = [];
        for (let i = 0; i < n; i++) {
            const x = Math.random() * 2 - 1, y = Math.random() * 2 - 1;
            out.push({
                x: clamp(x + randn() * noise * 0.3, -1, 1),
                y: clamp(y + randn() * noise * 0.3, -1, 1),
                label: (x > 0) === (y > 0) ? 1 : 0,
            });
        }
        return out;
    },
    circles(n, noise) {
        const out = [];
        for (let i = 0; i < n; i++) {
            const inner = i % 2 === 0;
            const r = (inner ? 0.28 : 0.75) + randn() * noise * 0.22;
            const t = Math.random() * Math.PI * 2;
            out.push({ x: clamp(r * Math.cos(t), -1, 1), y: clamp(r * Math.sin(t), -1, 1), label: inner ? 1 : 0 });
        }
        return out;
    },
    moons(n, noise) {
        const out = [];
        for (let i = 0; i < n; i++) {
            const top = i % 2 === 0;
            const t = Math.random() * Math.PI;
            const x = (top ? Math.cos(t) : 1 - Math.cos(t)) * 0.62 + (top ? -0.28 : 0.28);
            const y = (top ? Math.sin(t) : -Math.sin(t)) * 0.62 + (top ? -0.18 : 0.18);
            out.push({
                x: clamp(x + randn() * noise * 0.3, -1, 1),
                y: clamp(y + randn() * noise * 0.3, -1, 1),
                label: top ? 1 : 0,
            });
        }
        return out;
    },
    spiral(n, noise) {
        const out = [];
        const per = Math.floor(n / 2);
        for (let c = 0; c < 2; c++) {
            for (let i = 0; i < per; i++) {
                const r = (i / per) * 0.92;
                const t = (i / per) * 3.2 + c * Math.PI + randn() * noise * 0.5;
                out.push({
                    x: clamp(r * Math.cos(t), -1, 1),
                    y: clamp(r * Math.sin(t), -1, 1),
                    label: c === 0 ? 1 : 0,
                });
            }
        }
        return out;
    },
};

/* ============================================================
   Wiring
   ============================================================ */
(function playground() {
    const board = document.getElementById('board');
    if (!board) return;

    const ctx = board.getContext('2d');
    const lossCanvas = document.getElementById('loss-chart');
    const lctx = lossCanvas.getContext('2d');

    // offscreen grid that gets scaled up into the board - cheap smooth heatmap
    const GRID = 64;
    const field = document.createElement('canvas');
    field.width = field.height = GRID;
    const fctx = field.getContext('2d');
    const fieldImg = fctx.createImageData(GRID, GRID);

    const cfg = { layers: 2, units: 8, lr: 0.3, act: 'tanh', noise: 0.1 };
    let data = [];
    let net, epoch = 0, running = false, paintClass = 1;
    let lossHistory = [];

    const $ = (id) => document.getElementById(id);

    /* ---- geometry: data space [-1,1] ↔ canvas pixels ---- */
    const toPx = (v) => (v + 1) / 2 * board.width;
    const toData = (px) => (px / board.width) * 2 - 1;

    function sizes() {
        return [2, ...new Array(cfg.layers).fill(cfg.units), 1];
    }

    function paramCount(s) {
        let n = 0;
        for (let l = 0; l < s.length - 1; l++) n += s[l] * s[l + 1] + s[l + 1];
        return n;
    }

    function rebuild() {
        const s = sizes();
        net = makeNet(s, cfg.act);
        epoch = 0;
        lossHistory = [];
        $('arch-note').textContent = `${s.join(' → ')} · ${paramCount(s)} params`;
        updateMetrics(null);
        render();
    }

    /* ---- rendering ---- */
    function render() {
        // decision surface
        const px = fieldImg.data;
        for (let gy = 0; gy < GRID; gy++) {
            const y = 1 - (gy / (GRID - 1)) * 2;
            for (let gx = 0; gx < GRID; gx++) {
                const x = (gx / (GRID - 1)) * 2 - 1;
                const p = predict(net, x, y);
                // confidence away from 0.5 drives opacity, so undecided regions stay dark
                const conf = Math.abs(p - 0.5) * 2;
                const c = p >= 0.5 ? TEAL : VIOLET;
                const i = (gy * GRID + gx) * 4;
                px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2];
                px[i + 3] = Math.round(18 + conf * 92);
            }
        }
        fctx.putImageData(fieldImg, 0, 0);

        ctx.clearRect(0, 0, board.width, board.height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(field, 0, 0, board.width, board.height);

        // axes
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(board.width / 2, 0); ctx.lineTo(board.width / 2, board.height);
        ctx.moveTo(0, board.height / 2); ctx.lineTo(board.width, board.height / 2);
        ctx.stroke();

        // training points
        for (const p of data) {
            const cx = toPx(p.x), cy = board.height - toPx(p.y);
            ctx.beginPath();
            ctx.arc(cx, cy, 5.5, 0, Math.PI * 2);
            ctx.fillStyle = p.label === 1 ? 'rgb(45,212,191)' : 'rgb(167,139,250)';
            ctx.fill();
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = 'rgba(5,7,13,0.85)';
            ctx.stroke();
        }
    }

    // ln 2 - the binary cross-entropy of a model that guesses at random.
    // Anchoring the axis here means the curve always reads against "chance"
    // instead of auto-zooming into whatever noise is left after convergence.
    const CHANCE = Math.LN2;

    function renderLoss() {
        const w = lossCanvas.width, h = lossCanvas.height;
        lctx.clearRect(0, 0, w, h);
        if (lossHistory.length < 2) return;

        const max = Math.max(...lossHistory, CHANCE * 1.05);
        const n = lossHistory.length;
        const yOf = (v) => h - (v / max) * (h - 10) - 5;

        // chance baseline
        lctx.save();
        lctx.setLineDash([4, 4]);
        lctx.strokeStyle = 'rgba(255,255,255,0.16)';
        lctx.lineWidth = 1;
        lctx.beginPath();
        lctx.moveTo(0, yOf(CHANCE)); lctx.lineTo(w, yOf(CHANCE));
        lctx.stroke();
        lctx.restore();

        // label sits under the line - above it would clip on the canvas edge
        lctx.fillStyle = 'rgba(255,255,255,0.32)';
        lctx.font = '11px ui-monospace, monospace';
        lctx.fillText('chance', 6, yOf(CHANCE) + 13);

        lctx.beginPath();
        lossHistory.forEach((v, i) => {
            const x = (i / (n - 1)) * w;
            const y = yOf(v);
            i ? lctx.lineTo(x, y) : lctx.moveTo(x, y);
        });
        lctx.strokeStyle = 'rgb(45,212,191)';
        lctx.lineWidth = 2;
        lctx.lineJoin = 'round';
        lctx.stroke();

        // fill under the curve
        lctx.lineTo(w, h); lctx.lineTo(0, h); lctx.closePath();
        const grad = lctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, 'rgba(45,212,191,0.22)');
        grad.addColorStop(1, 'rgba(45,212,191,0)');
        lctx.fillStyle = grad;
        lctx.fill();
    }

    function updateMetrics(stats) {
        $('m-epoch').textContent = epoch;
        $('m-loss').textContent = stats ? stats.loss.toFixed(4) : '—';
        $('m-acc').textContent = stats ? (stats.acc * 100).toFixed(1) + '%' : '—';
    }

    /* ---- training loop ---- */
    function step() {
        const stats = trainEpoch(net, data, cfg.lr);
        if (!stats) return null;
        epoch++;
        lossHistory.push(stats.loss);
        // Decimate instead of dropping the front, so the x-axis always spans
        // the whole run - you can still see where it started 5000 epochs later.
        if (lossHistory.length > 400) lossHistory = lossHistory.filter((_, i) => i % 2 === 0);
        return stats;
    }

    let raf = null;
    function loop() {
        if (!running) return;
        // several epochs per frame - a 200-point dataset trains faster than 60fps
        let stats = null;
        for (let i = 0; i < 3; i++) stats = step() || stats;
        if (stats) { updateMetrics(stats); renderLoss(); }
        render();
        raf = requestAnimationFrame(loop);
    }

    function setRunning(on) {
        running = on && data.length > 0;
        $('btn-run').textContent = running ? 'Pause' : 'Train';
        $('btn-run').classList.toggle('is-running', running);
        if (running) loop();
        else if (raf) cancelAnimationFrame(raf);
    }

    /* ---- input: painting points ---- */
    let painting = false;
    function addPointFromEvent(e) {
        const r = board.getBoundingClientRect();
        const x = toData((e.clientX - r.left) / r.width * board.width);
        const y = -toData((e.clientY - r.top) / r.height * board.height);
        if (x < -1 || x > 1 || y < -1 || y > 1) return;
        data.push({ x, y, label: paintClass });
        $('stage-hint').textContent = `${data.length} points`;
        render();
    }

    board.addEventListener('pointerdown', (e) => {
        painting = true;
        board.setPointerCapture(e.pointerId);
        addPointFromEvent(e);
    });
    board.addEventListener('pointermove', (e) => { if (painting) addPointFromEvent(e); });
    board.addEventListener('pointerup', () => { painting = false; });
    board.addEventListener('pointercancel', () => { painting = false; });

    /* ---- controls ---- */
    $('btn-run').addEventListener('click', () => setRunning(!running));
    $('btn-step').addEventListener('click', () => {
        const stats = step();
        if (stats) { updateMetrics(stats); renderLoss(); }
        render();
    });
    $('btn-reset').addEventListener('click', () => { setRunning(false); rebuild(); });
    $('btn-clear').addEventListener('click', () => {
        setRunning(false);
        data = [];
        $('stage-hint').textContent = 'click or drag to add points';
        rebuild();
    });

    document.querySelectorAll('.preset').forEach((btn) => {
        btn.addEventListener('click', () => {
            setRunning(false);
            data = presets[btn.dataset.preset](260, cfg.noise);
            $('stage-hint').textContent = `${data.length} points`;
            rebuild();
        });
    });

    document.querySelectorAll('.cls-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            paintClass = Number(btn.dataset.class);
            document.querySelectorAll('.cls-btn').forEach((b) => b.classList.toggle('is-on', b === btn));
        });
    });

    document.querySelectorAll('.seg-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            cfg.act = btn.dataset.act;
            document.querySelectorAll('.seg-btn').forEach((b) => b.classList.toggle('is-on', b === btn));
            setRunning(false);
            rebuild();
        });
    });

    // sliders: architecture changes rebuild the net, lr and noise do not
    const sliders = [
        ['layers', 'v-layers', (v) => v, true],
        ['units', 'v-units', (v) => v, true],
        ['lr', 'v-lr', (v) => Number(v).toFixed(2), false],
        ['noise', 'v-noise', (v) => Number(v).toFixed(2), false],
    ];
    sliders.forEach(([id, label, fmt, rebuilds]) => {
        const input = $(id);
        input.addEventListener('input', () => {
            cfg[id] = Number(input.value);
            $(label).textContent = fmt(input.value);
            if (rebuilds) { setRunning(false); rebuild(); }
        });
    });

    /* ---- go ---- */
    data = presets.xor(260, cfg.noise);
    $('stage-hint').textContent = `${data.length} points`;
    rebuild();
})();
