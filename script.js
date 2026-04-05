/**
 * Vedant Rajput Portfolio - Enhanced JavaScript
 * Features: Canvas particles, scroll animations, intersection observer, 
 * tilt effects, magnetic buttons, typewriter, and more
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

// Get accent color from CSS variables
function getAccentColor() {
    const style = getComputedStyle(document.documentElement);
    const color = style.getPropertyValue('--particle-color').trim();
    return color;
}

// Parse color for RGB values
function parseColor(color) {
    if (color.startsWith('#')) {
        let hex = color.replace('#', '');
        if (hex.length === 3) {
            hex = hex.split('').map(c => c + c).join('');
        }
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255
        };
    }
    // Default teal color
    return { r: 20, g: 184, b: 166 };
}

// Particle Class
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

// Initialize particles
function initParticles() {
    particlesArray = [];
    const numberOfParticles = Math.min((canvas.height * canvas.width) / 10000, 100);
    for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
    }
}

// Connect particles with lines
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

// Animation loop
function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particlesArray.forEach(particle => particle.update());
    connectParticles();

    animationId = requestAnimationFrame(animateParticles);
}

// Resize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
}

// Initialize canvas
function initCanvas() {
    if (!canvas) return;
    resizeCanvas();
    initParticles();
    animateParticles();
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
        typewriterDelay = 2000; // Pause at end
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        typewriterIndex = (typewriterIndex + 1) % typewriterTexts.length;
        typewriterDelay = 500; // Pause before typing
    }

    setTimeout(typeWriter, typewriterDelay);
}

// ========================================
// NAVIGATION
// ========================================

// Navbar scroll effect
function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// Mobile menu toggle
function toggleMobileMenu() {
    mobileMenuToggle.classList.toggle('active');
    navLinks.classList.toggle('active');
    document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}

// Close mobile menu on link click
function closeMobileMenu() {
    mobileMenuToggle.classList.remove('active');
    navLinks.classList.remove('active');
    document.body.style.overflow = '';
}

// Active nav link on scroll
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
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
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
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
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
    const isLight = html.hasAttribute('data-theme');
    setTheme(!isLight);
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

// Theme popup
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

            popupYes.onclick = () => {
                setTheme(targetThemeIsLight);
                themePopup.classList.remove('active');
            };

            popupNo.onclick = () => {
                themePopup.classList.remove('active');
            };
        }
    }, 2000);
}

// ========================================
// INTERSECTION OBSERVER - SCROLL ANIMATIONS
// ========================================
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeInObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// Section headers observer
const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const tag = entry.target.querySelector('.section-tag');
            const title = entry.target.querySelector('.section-title');
            if (tag) tag.classList.add('visible');
            if (title) setTimeout(() => title.classList.add('visible'), 100);
            sectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

// Timeline items observer
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 150);
            timelineObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

// Project cards observer
const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
            projectObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Language progress bars observer
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
            progressObserver.unobserve(bar);
        }
    });
}, { threshold: 0.5 });

// Counter animation observer
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Animate counter
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.querySelector('.stat-number').textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.querySelector('.stat-number').textContent = target;
        }
    };

    updateCounter();
}

// ========================================
// TILT EFFECT
// ========================================
function initTiltEffect() {
    const tiltElements = document.querySelectorAll('[data-tilt]');

    tiltElements.forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 100;
            const rotateY = (centerX - x) / 100;

            element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });
}

// ========================================
// MAGNETIC BUTTON EFFECT
// ========================================
function initMagneticButtons() {
    const magneticButtons = document.querySelectorAll('.magnetic-btn');

    magneticButtons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            button.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = 'translate(0, 0)';
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

    // Show loading state
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
    btn.disabled = true;

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            btn.classList.add('success');
            btn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
            e.target.reset();

            setTimeout(() => {
                btn.classList.remove('success');
                btn.innerHTML = originalContent;
                btn.disabled = false;
            }, 3000);
        } else {
            throw new Error(result.message || 'Something went wrong');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        btn.classList.add('error');
        btn.innerHTML = '<i class="fas fa-times"></i> Failed to Send';

        setTimeout(() => {
            btn.classList.remove('error');
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }, 3000);
    }
}

// ========================================
// PARALLAX EFFECT
// ========================================
function initParallax() {
    const heroContent = document.querySelector('.hero-content');

    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        if (scrolled < window.innerHeight && heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrolled / window.innerHeight) * 0.8;
        }
    });
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offset = 80;
                const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });
}

// ========================================
// HIGHLIGHT TEXT ANIMATION
// ========================================
/* function initHighlightAnimation() {
    const highlight = document.getElementById('highlight-text');
    if (!highlight) return;

    const words = ['Actionable Intelligence', 'Business Insights', 'Data Solutions', 'Strategic Decisions'];
    let index = 0;

    setInterval(() => {
        highlight.style.opacity = '0';
        setTimeout(() => {
            index = (index + 1) % words.length;
            highlight.textContent = words[index];
            highlight.style.opacity = '1';
        }, 300);
    }, 4000);
} */

// ========================================
// HIGHLIGHT TEXT ANIMATION
// ========================================
function initHighlightAnimation() {
    const highlight = document.getElementById('highlight-text');
    if (!highlight) return;

    const words = ['Actionable Intelligence', 'Business Insights', 'Data Solutions', 'Strategic Decisions'];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingDelay = 100;

    // Set initial style for cursor effect
    highlight.style.opacity = '1';
    highlight.style.borderRight = '2px solid var(--accent-color)';
    highlight.style.paddingRight = '2px';
    highlight.textContent = ''; // clear initially

    function typeWord() {
        const currentWord = words[wordIndex];

        if (isDeleting) {
            highlight.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingDelay = 50; // faster delete
        } else {
            highlight.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingDelay = 100; // normal typing
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingDelay = 2000; // Pause at the end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingDelay = 500; // Pause before typing new word
        }

        setTimeout(typeWord, typingDelay);
    }

    // Blinking cursor effect
    setInterval(() => {
        highlight.style.borderRightColor = highlight.style.borderRightColor === 'transparent'
            ? 'var(--accent-color)'
            : 'transparent';
    }, 500);

    // Initial start
    setTimeout(typeWord, 1000);
}

// ========================================
// DYNAMIC COUNTERS
// ========================================
function updateDynamicCounters() {
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        const labelElement = item.querySelector('.stat-label');
        if (!labelElement) return;
        
        const label = labelElement.textContent.trim().toLowerCase();
        
        if (label.includes('certifications')) {
            const count = document.querySelectorAll('.cert-list li').length;
            item.setAttribute('data-count', count);
        } else if (label.includes('projects')) {
            const count = document.querySelectorAll('.project-card').length;
            item.setAttribute('data-count', count);
        } else if (label.includes('skills')) {
            // Counting the tech logo wrappers for skills count
            const count = document.querySelectorAll('.tech-logo-wrapper').length;
            item.setAttribute('data-count', count);
        }
    });
}

// ========================================
// INITIALIZATION
// ========================================

function init() {
    // Update dynamic counters before observers start
    updateDynamicCounters();

    // Canvas particles
    initCanvas();

    // Typewriter effect
    typeWriter();

    // Theme
    initTheme();
    showThemePopup();

    // Parallax
    initParallax();

    // Smooth scroll
    initSmoothScroll();

    // Tilt effect
    initTiltEffect();

    // Magnetic buttons
    initMagneticButtons();

    // Highlight animation
    initHighlightAnimation();

    // Intersection Observers
    document.querySelectorAll('.fade-in-up').forEach(el => fadeInObserver.observe(el));
    document.querySelectorAll('section').forEach(section => sectionObserver.observe(section));
    document.querySelectorAll('.timeline-item').forEach(item => timelineObserver.observe(item));
    document.querySelectorAll('.project-card').forEach(card => projectObserver.observe(card));
    document.querySelectorAll('.lang-progress-bar').forEach(bar => progressObserver.observe(bar));
    document.querySelectorAll('.stat-item').forEach(stat => counterObserver.observe(stat));

    // Event listeners
    window.addEventListener('scroll', () => {
        handleNavbarScroll();
        updateScrollProgress();
        handleBackToTop();
        updateActiveNavLink();
    });

    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    themeToggle.addEventListener('click', toggleTheme);
    backToTop.addEventListener('click', scrollToTop);
    contactForm.addEventListener('submit', handleContactForm);

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !mobileMenuToggle.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
    });
}

// Run initialization when DOM is ready
document.addEventListener('DOMContentLoaded', init);

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (animationId) cancelAnimationFrame(animationId);
    } else {
        animateParticles();
    }
});
