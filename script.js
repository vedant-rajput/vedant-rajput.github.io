/**
 * Vedant Rajput Portfolio - JavaScript
 * Animations: Canvas particles, custom cursor, hero spotlight, text scramble,
 * typewriter, tilt, magnetic, ripple, tag wave, timeline draw, section glitch,
 * parallax, scroll effects, theme, contact form.
 */

// ========================================
// DOM ELEMENTS
// ========================================
const navbar = document.getElementById('navbar');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const navLinks = document.getElementById('nav-links');
const themeToggle = document.getElementById('theme-toggle');
const themePopup = document.getElementById('theme-popup');
const popupMessage = document.getElementById('popup-message');
const popupYes = document.getElementById('popup-yes');
const popupNo = document.getElementById('popup-no');
const backToTop = document.getElementById('back-to-top');
const scrollProgress = document.querySelector('.scroll-progress');
const scrollProgressBar = document.querySelector('.scroll-progress-bar');
const contactForm = document.getElementById('contactForm');

// ========================================
// CANVAS PARTICLE SYSTEM
// ========================================
const canvas = document.getElementById('data-canvas');
const ctx = canvas.getContext('2d');
let particlesArray = [];
let animationId = null;

function getAccentColor() {
    const style = getComputedStyle(document.documentElement);
    return style.getPropertyValue('--particle-color').trim();
}

function parseColor(color) {
    if (color.startsWith('#')) {
        let hex = color.replace('#', '');
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        const bigint = parseInt(hex, 16);
        return { r: (bigint >> 16) & 255, g: (bigint >> 8) & 255, b: bigint & 255 };
    }
    return { r: 20, g: 184, b: 166 };
}

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.directionX = (Math.random() * 0.6) - 0.3;
        this.directionY = (Math.random() * 0.6) - 0.3;
        this.size = Math.random() * 2.5 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.3;
    }

    draw() {
        const color = parseColor(getAccentColor());
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${this.opacity})`;
        ctx.fill();
    }

    update() {
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

function initParticles() {
    particlesArray = [];
    const numberOfParticles = Math.min((canvas.height * canvas.width) / 10000, 100);
    for (let i = 0; i < numberOfParticles; i++) particlesArray.push(new Particle());
}

function connectParticles() {
    const color = parseColor(getAccentColor());
    const maxDistance = 120;
    const maxConnections = 3;

    for (let a = 0; a < particlesArray.length; a++) {
        let connections = 0;
        for (let b = a + 1; b < particlesArray.length; b++) {
            if (connections >= maxConnections) break;
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < maxDistance) {
                const opacity = (1 - distance / maxDistance) * 0.3;
                ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
                connections++;
            }
        }
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particlesArray.forEach(p => p.update());
    connectParticles();
    animationId = requestAnimationFrame(animateParticles);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

function initCanvas() {
    if (!canvas) return;
    resizeCanvas();
    initParticles();
    animateParticles();
}

// ========================================
// CUSTOM CURSOR  (step 1)
// ========================================
function initCustomCursor() {
    if (window.matchMedia('(hover: none)').matches) return;

    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        dot.style.left = mouseX + 'px';
        dot.style.top  = mouseY + 'px';
    });

    function animateRing() {
        ringX += (mouseX - ringX) * 0.12;
        ringY += (mouseY - ringY) * 0.12;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactives = document.querySelectorAll(
        'a, button, [data-tilt], .tech-logo-wrapper, .nav-link, input, textarea, label, .tag'
    );
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => {
            dot.classList.add('cursor-hover');
            ring.classList.add('cursor-hover');
        });
        el.addEventListener('mouseleave', () => {
            dot.classList.remove('cursor-hover');
            ring.classList.remove('cursor-hover');
        });
    });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
        dot.style.opacity = '1';
        ring.style.opacity = '0.55';
    });
}

// ========================================
// TYPEWRITER EFFECT
// ========================================
const typewriterElement = document.getElementById('typewriter');
const typewriterTexts = ['Data Scientist', 'ML Engineer', 'Data Analyst', 'Problem Solver'];
let typewriterIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typewriterDelay = 100;

function typeWriter() {
    if (!typewriterElement) return;
    const currentText = typewriterTexts[typewriterIndex];

    if (isDeleting) {
        typewriterElement.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
        typewriterDelay = 50;
    } else {
        typewriterElement.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
        typewriterDelay = 100;
    }

    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        typewriterDelay = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        typewriterIndex = (typewriterIndex + 1) % typewriterTexts.length;
        typewriterDelay = 500;
    }

    setTimeout(typeWriter, typewriterDelay);
}

// ========================================
// HERO SPOTLIGHT  (step 4)
// ========================================
function initHeroSpotlight() {
    const hero = document.getElementById('hero');
    const spotlight = document.getElementById('hero-spotlight');
    if (!hero || !spotlight) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        spotlight.style.left = (e.clientX - rect.left) + 'px';
        spotlight.style.top  = (e.clientY - rect.top)  + 'px';
        spotlight.style.opacity = '1';
    });

    hero.addEventListener('mouseleave', () => {
        spotlight.style.opacity = '0';
    });
}

// ========================================
// TEXT SCRAMBLE ON NAME HOVER  (step 5)
// ========================================
function initTextScramble() {
    const heroTitle = document.getElementById('hero-title');
    if (!heroTitle) return;

    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    let isAnimating = false;

    heroTitle.style.cursor = 'default';

    heroTitle.addEventListener('mouseenter', () => {
        if (isAnimating) return;
        isAnimating = true;

        const charSpans = [...heroTitle.querySelectorAll('.char:not(.space)')];
        const originals = charSpans.map(s => s.textContent);
        let iteration = 0;

        const interval = setInterval(() => {
            charSpans.forEach((span, i) => {
                if (i < iteration) {
                    span.textContent = originals[i];
                    span.style.color = '';
                } else {
                    span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
                    span.style.color = 'var(--accent-color)';
                }
            });

            iteration += 0.4;

            if (iteration > charSpans.length) {
                clearInterval(interval);
                charSpans.forEach((span, i) => {
                    span.textContent = originals[i];
                    span.style.color = '';
                });
                isAnimating = false;
            }
        }, 40);
    });
}

// ========================================
// NAVIGATION
// ========================================
function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

function toggleMobileMenu() {
    mobileMenuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

function closeMobileMenu() {
    mobileMenuToggle.classList.remove('active');
    navLinks.classList.remove('active');
    document.body.style.overflow = '';
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) link.classList.add('active');
            });
        }
    });
}

// ========================================
// SCROLL PROGRESS
// ========================================
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    scrollProgressBar.style.width = `${scrollPercent}%`;
    if (scrollTop > 100) {
        scrollProgress.classList.add('visible');
    } else {
        scrollProgress.classList.remove('visible');
    }
}

// ========================================
// BACK TO TOP
// ========================================
function handleBackToTop() {
    if (window.scrollY > 500) {
        backToTop.classList.add('visible');
    } else {
        backToTop.classList.remove('visible');
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========================================
// THEME TOGGLE
// ========================================
function setTheme(isLight) {
    const html = document.documentElement;
    const icon = themeToggle.querySelector('i');

    if (isLight) {
        html.setAttribute('data-theme', 'light');
        icon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    } else {
        html.removeAttribute('data-theme');
        icon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    setTheme(!html.hasAttribute('data-theme'));
}

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        setTheme(true);
    } else {
        setTheme(false);
    }
}

function showThemePopup() {
    setTimeout(() => {
        const systemIsLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        const html = document.documentElement;
        const currentThemeIsLight = html.hasAttribute('data-theme');
        let shouldPrompt = false;
        let targetThemeIsLight = false;

        if (systemIsLight && !currentThemeIsLight) {
            popupMessage.innerHTML = `Hey! Looks like your system theme is <strong>Light</strong>.<br>Would you like to switch to <strong>Light Theme</strong>?`;
            shouldPrompt = true;
            targetThemeIsLight = true;
        } else if (!systemIsLight && currentThemeIsLight) {
            popupMessage.innerHTML = `Hey! Looks like your system theme is <strong>Dark</strong>.<br>Would you like to switch to <strong>Dark Theme</strong>?`;
            shouldPrompt = true;
            targetThemeIsLight = false;
        }

        if (shouldPrompt) {
            themePopup.classList.add('active');
            popupYes.onclick = () => { setTheme(targetThemeIsLight); themePopup.classList.remove('active'); };
            popupNo.onclick  = () => { themePopup.classList.remove('active'); };
        }
    }, 2000);
}

// ========================================
// INTERSECTION OBSERVERS
// ========================================
const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Section headers — with glitch flicker on title entrance (step 9)
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const tag   = entry.target.querySelector('.section-tag');
            const title = entry.target.querySelector('.section-title');
            if (tag) tag.classList.add('visible');
            if (title) {
                setTimeout(() => {
                    title.classList.add('visible');
                    title.classList.add('glitch-entrance');
                    setTimeout(() => title.classList.remove('glitch-entrance'), 450);
                }, 100);
            }
            sectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), index * 150);
            timelineObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

// Timeline line draw (step 6)
const timelineDrawObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('draw-line'), 250);
            timelineDrawObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Project cards — staggered fade-up entrance
const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add('visible'), index * 120);
            projectObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.08 });

const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            bar.style.width = bar.getAttribute('data-width');
            progressObserver.unobserve(bar);
        }
    });
}, { threshold: 0.5 });

// Counter with easeOutQuart (step 2)
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const startTime = performance.now();

    const update = (now) => {
        const elapsed  = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = 1 - Math.pow(1 - progress, 4); // easeOutQuart
        element.querySelector('.stat-number').textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
    };

    requestAnimationFrame(update);
}

// Skills tags wave stagger (step 7)
const tagWaveObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const tags = entry.target.querySelectorAll('.tag');
            tags.forEach((tag, i) => {
                setTimeout(() => tag.classList.add('tag-visible'), i * 28);
            });
            tagWaveObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.25 });

// ========================================
// TILT EFFECT
// ========================================
function initTiltEffect() {
    document.querySelectorAll('[data-tilt]').forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const rotateX = ((e.clientY - rect.top)  - rect.height / 2) / 100;
            const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 100;
            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01,1.01,1.01)`;
        });
        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1,1,1)';
        });
    });
}

// ========================================
// MAGNETIC BUTTON EFFECT
// ========================================
function initMagneticButtons() {
    document.querySelectorAll('.magnetic-btn').forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width  / 2;
            const y = e.clientY - rect.top  - rect.height / 2;
            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
        });
    });
}

// ========================================
// RIPPLE EFFECT ON BUTTONS  (step 8)
// ========================================
function initRippleEffect() {
    document.querySelectorAll('.btn-primary, .btn-secondary, .btn-submit').forEach(btn => {
        btn.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width  = ripple.style.height = size + 'px';
            ripple.style.left   = (e.clientX - rect.left - size / 2) + 'px';
            ripple.style.top    = (e.clientY - rect.top  - size / 2) + 'px';

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 650);
        });
    });
}

// ========================================
// CONTACT FORM
// ========================================
async function handleContactForm(e) {
    e.preventDefault();
    const btn = e.target.querySelector('.btn-submit');
    const originalContent = btn.innerHTML;

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await response.json();

        if (result.success) {
            btn.classList.add('success');
            btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            e.target.reset();
            setTimeout(() => { btn.classList.remove('success'); btn.innerHTML = originalContent; btn.disabled = false; }, 3000);
        } else {
            throw new Error(result.message || 'Something went wrong');
        }
    } catch (error) {
        btn.classList.add('error');
        btn.innerHTML = '<i class="fas fa-times"></i> Failed to Send';
        setTimeout(() => { btn.classList.remove('error'); btn.innerHTML = originalContent; btn.disabled = false; }, 3000);
    }
}

// ========================================
// PARALLAX  — gentler multipliers (step 3)
// ========================================
function initParallax() {
    const heroContent = document.querySelector('.hero-content');
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight && heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
            heroContent.style.opacity   = 1 - (scrolled / window.innerHeight) * 0.4;
        }
    });
}

// ========================================
// SMOOTH SCROLL
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
                closeMobileMenu();
            }
        });
    });
}

// ========================================
// HIGHLIGHT TEXT ANIMATION
// ========================================
function initHighlightAnimation() {
    const highlight = document.getElementById('highlight-text');
    if (!highlight) return;

    const words = ['Actionable Intelligence', 'Business Insights', 'Data Solutions', 'Strategic Decisions'];
    let wordIndex = 0, charIdx = 0, isDel = false, delay = 100;

    highlight.style.opacity = '1';
    highlight.style.borderRight = '2px solid var(--accent-color)';
    highlight.style.paddingRight = '2px';
    highlight.textContent = '';

    function typeWord() {
        const word = words[wordIndex];
        if (isDel) { highlight.textContent = word.substring(0, charIdx - 1); charIdx--; delay = 50; }
        else       { highlight.textContent = word.substring(0, charIdx + 1); charIdx++; delay = 100; }

        if (!isDel && charIdx === word.length) { isDel = true; delay = 2000; }
        else if (isDel && charIdx === 0)       { isDel = false; wordIndex = (wordIndex + 1) % words.length; delay = 500; }

        setTimeout(typeWord, delay);
    }

    setInterval(() => {
        highlight.style.borderRightColor = highlight.style.borderRightColor === 'transparent'
            ? 'var(--accent-color)' : 'transparent';
    }, 500);

    setTimeout(typeWord, 1000);
}

// ========================================
// DYNAMIC COUNTERS
// ========================================
function updateDynamicCounters() {
    document.querySelectorAll('.stat-item').forEach(item => {
        const label = item.querySelector('.stat-label')?.textContent.trim().toLowerCase() || '';
        if (label.includes('certifications')) {
            item.setAttribute('data-count', document.querySelectorAll('.cert-list li').length);
        } else if (label.includes('projects')) {
            item.setAttribute('data-count', document.querySelectorAll('.project-card').length);
        } else if (label.includes('skills')) {
            item.setAttribute('data-count', document.querySelectorAll('.tech-logo-wrapper').length);
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================
function init() {
    updateDynamicCounters();

    initCanvas();
    initCustomCursor();
    typeWriter();
    initTheme();
    showThemePopup();
    initParallax();
    initHeroSpotlight();
    initTextScramble();
    initSmoothScroll();
    initTiltEffect();
    initMagneticButtons();
    initHighlightAnimation();
    initRippleEffect();

    // Intersection Observers
    document.querySelectorAll('.fade-in-up').forEach(el => fadeInObserver.observe(el));
    document.querySelectorAll('section').forEach(s => sectionObserver.observe(s));
    document.querySelectorAll('.timeline-item').forEach(item => timelineObserver.observe(item));
    document.querySelectorAll('.timeline').forEach(t => timelineDrawObserver.observe(t));
    document.querySelectorAll('.project-card').forEach(card => projectObserver.observe(card));
    document.querySelectorAll('.lang-progress-bar').forEach(bar => progressObserver.observe(bar));
    document.querySelectorAll('.stat-item').forEach(stat => counterObserver.observe(stat));
    document.querySelectorAll('.skill-card').forEach(card => tagWaveObserver.observe(card));

    // Event listeners
    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        updateScrollProgress();
        handleBackToTop();
        updateActiveNavLink();
    });

    window.addEventListener('resize', resizeCanvas);

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    themeToggle.addEventListener('click', toggleTheme);
    backToTop.addEventListener('click', scrollToTop);
    contactForm.addEventListener('submit', handleContactForm);

    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)) closeMobileMenu();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) closeMobileMenu();
    });
}

document.addEventListener('DOMContentLoaded', init);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (animationId) cancelAnimationFrame(animationId); }
    else animateParticles();
});
