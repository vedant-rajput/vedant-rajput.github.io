/**
 * Vedant Rajput — Portfolio
 * Three.js hero: a 3D neural network floating in space.
 * Glowing layered nodes, low-opacity synapses, signal pulses travelling
 * between layers. Mouse moves the camera, drag spins the network,
 * scrolling pulls you gently away from it.
 */

import * as THREE from 'three';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.getElementById('net-canvas');

if (canvas && !prefersReducedMotion) init();

function init() {
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch {
        return; // no WebGL → the aurora + particles still carry the hero
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
    camera.position.z = 30;

    const TEAL = new THREE.Color('#2dd4bf');
    const VIOLET = new THREE.Color('#a78bfa');

    /* ---------- glow sprite texture ---------- */
    function glowTexture() {
        const c = document.createElement('canvas');
        c.width = c.height = 64;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 64, 64);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
    }
    const sprite = glowTexture();

    /* ---------- the network ---------- */
    const net = new THREE.Group();
    scene.add(net);

    const LAYERS = [4, 6, 7, 6, 3];
    const SPAN_X = 20, SPAN_Y = 13, SPAN_Z = 7;
    const nodes = [];

    LAYERS.forEach((count, li) => {
        const x = -SPAN_X / 2 + (SPAN_X * li) / (LAYERS.length - 1);
        for (let ni = 0; ni < count; ni++) {
            const y = count === 1 ? 0 : -SPAN_Y / 2 + (SPAN_Y * ni) / (count - 1);
            nodes.push({
                base: new THREE.Vector3(
                    x + (Math.random() - 0.5) * 1.6,
                    y + (Math.random() - 0.5) * 1.6,
                    (Math.random() - 0.5) * SPAN_Z
                ),
                layer: li,
                phase: Math.random() * Math.PI * 2,
            });
        }
    });

    // node points (position + color buffers, sizes pulse in the loop via material)
    const nodeGeo = new THREE.BufferGeometry();
    const nodePos = new Float32Array(nodes.length * 3);
    const nodeCol = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
        n.base.toArray(nodePos, i * 3);
        const isEdgeLayer = n.layer === 0 || n.layer === LAYERS.length - 1;
        (isEdgeLayer ? VIOLET : TEAL).toArray(nodeCol, i * 3);
    });
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePos, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeCol, 3));
    const nodeMat = new THREE.PointsMaterial({
        size: 1.45, map: sprite, vertexColors: true, transparent: true,
        opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    net.add(new THREE.Points(nodeGeo, nodeMat));

    // synapses between adjacent layers
    const edges = [];
    {
        let offset = 0;
        for (let li = 0; li < LAYERS.length - 1; li++) {
            const a0 = offset, a1 = offset + LAYERS[li];
            const b0 = a1, b1 = a1 + LAYERS[li + 1];
            for (let a = a0; a < a1; a++) {
                for (let b = b0; b < b1; b++) {
                    if (Math.random() < 0.62) edges.push([a, b]);
                }
            }
            offset += LAYERS[li];
        }
    }
    const edgeGeo = new THREE.BufferGeometry();
    const edgePos = new Float32Array(edges.length * 6);
    const edgeMat = new THREE.LineBasicMaterial({
        color: 0x7896be, transparent: true, opacity: 0.14, depthWrite: false,
    });
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
    net.add(new THREE.LineSegments(edgeGeo, edgeMat));

    // signal pulses travelling along random synapses
    const PULSES = 22;
    const pulses = Array.from({ length: PULSES }, () => ({
        edge: (Math.random() * edges.length) | 0,
        t: Math.random(),
        speed: 0.004 + Math.random() * 0.008,
    }));
    const pulseGeo = new THREE.BufferGeometry();
    const pulsePos = new Float32Array(PULSES * 3);
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
    const pulseMat = new THREE.PointsMaterial({
        size: 2.2, map: sprite, color: TEAL, transparent: true,
        opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true,
    });
    net.add(new THREE.Points(pulseGeo, pulseMat));

    // ambient stardust for depth
    const DUST = 260;
    const dustGeo = new THREE.BufferGeometry();
    const dustPos = new Float32Array(DUST * 3);
    for (let i = 0; i < DUST; i++) {
        dustPos[i * 3] = (Math.random() - 0.5) * 110;
        dustPos[i * 3 + 1] = (Math.random() - 0.5) * 70;
        dustPos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 10;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
        size: 0.5, map: sprite, color: 0x9ab, transparent: true,
        opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(dustGeo, dustMat));

    /* ---------- interaction ---------- */
    const pointer = { x: 0, y: 0 };           // -1..1 parallax target
    const spin = { y: 0, x: 0, vy: 0.0016 };  // drag rotation + inertia
    let dragging = false, lastPX = 0, lastPY = 0;

    canvas.addEventListener('pointermove', (e) => {
        const r = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        pointer.y = ((e.clientY - r.top) / r.height) * 2 - 1;
        if (dragging) {
            spin.vy = (e.clientX - lastPX) * 0.00045;
            spin.x += (e.clientY - lastPY) * 0.002;
            spin.x = Math.max(-0.7, Math.min(0.7, spin.x));
            lastPX = e.clientX; lastPY = e.clientY;
        }
    }, { passive: true });

    canvas.addEventListener('pointerdown', (e) => {
        dragging = true;
        lastPX = e.clientX; lastPY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointerup', () => { dragging = false; });
    canvas.addEventListener('pointerleave', () => { pointer.x = 0; pointer.y = 0; });

    /* ---------- layout ---------- */
    let netX = 0;
    function resize() {
        const r = canvas.parentElement.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
        // network sits right of the copy on wide screens, centred + distant on small
        const wide = r.width > 900;
        netX = wide ? 8.5 : 0;
        camera.position.z = wide ? 30 : 44;
        nodeMat.size = wide ? 1.45 : 1.05;
        pulseMat.size = wide ? 2.2 : 1.6;
    }
    window.addEventListener('resize', resize, { passive: true });
    resize();

    /* ---------- loop ---------- */
    let rafId = null;

    function frame(now) {
        const t = now * 0.001;

        // node breathing (positions drift on tiny lissajous orbits)
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            nodePos[i * 3] = n.base.x + Math.sin(t * 0.6 + n.phase) * 0.5;
            nodePos[i * 3 + 1] = n.base.y + Math.cos(t * 0.5 + n.phase * 1.3) * 0.5;
            nodePos[i * 3 + 2] = n.base.z + Math.sin(t * 0.4 + n.phase * 0.7) * 0.5;
        }
        nodeGeo.attributes.position.needsUpdate = true;

        // synapses follow their nodes
        for (let i = 0; i < edges.length; i++) {
            const [a, b] = edges[i];
            edgePos[i * 6] = nodePos[a * 3];
            edgePos[i * 6 + 1] = nodePos[a * 3 + 1];
            edgePos[i * 6 + 2] = nodePos[a * 3 + 2];
            edgePos[i * 6 + 3] = nodePos[b * 3];
            edgePos[i * 6 + 4] = nodePos[b * 3 + 1];
            edgePos[i * 6 + 5] = nodePos[b * 3 + 2];
        }
        edgeGeo.attributes.position.needsUpdate = true;

        // pulses run along synapses
        for (let i = 0; i < PULSES; i++) {
            const p = pulses[i];
            p.t += p.speed;
            if (p.t >= 1) { p.t = 0; p.edge = (Math.random() * edges.length) | 0; }
            const [a, b] = edges[p.edge];
            pulsePos[i * 3] = nodePos[a * 3] + (nodePos[b * 3] - nodePos[a * 3]) * p.t;
            pulsePos[i * 3 + 1] = nodePos[a * 3 + 1] + (nodePos[b * 3 + 1] - nodePos[a * 3 + 1]) * p.t;
            pulsePos[i * 3 + 2] = nodePos[a * 3 + 2] + (nodePos[b * 3 + 2] - nodePos[a * 3 + 2]) * p.t;
        }
        pulseGeo.attributes.position.needsUpdate = true;

        // spin: gentle auto-rotation + drag inertia
        if (!dragging) spin.vy += (0.0016 - spin.vy) * 0.02;
        spin.y += spin.vy;
        net.rotation.y = spin.y;
        net.rotation.x += (spin.x - net.rotation.x) * 0.08;
        net.position.x += (netX - net.position.x) * 0.05;
        net.position.y = Math.sin(t * 0.35) * 0.6;

        // camera parallax toward the pointer; scroll pulls the rig up & away
        const scroll = Math.min(window.scrollY / window.innerHeight, 1.2);
        camera.position.x += (pointer.x * 2.4 - camera.position.x) * 0.04;
        camera.position.y += (-pointer.y * 1.6 + scroll * 7 - camera.position.y) * 0.05;
        camera.lookAt(0, scroll * 5, 0);

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(frame);
    }

    /* ---------- lifecycle: only render while the hero is visible ---------- */
    function start() { if (!rafId) rafId = requestAnimationFrame(frame); }
    function stop() { cancelAnimationFrame(rafId); rafId = null; }

    new IntersectionObserver((entries) => {
        entries.forEach((e) => (e.isIntersecting && !document.hidden ? start() : stop()));
    }).observe(canvas);

    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

    start();
}
