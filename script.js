/* ============================================================
   ESUBU TECH — script.js
   Handles: division switching, mobile menu, smooth scroll,
            active nav links, scroll animations, demo form
   ============================================================ */

// ── State ─────────────────────────────────────────────────────
let currentDivision = 'academy';

// ── DOM references ────────────────────────────────────────────
const header          = document.getElementById('main-header');
const hamburger       = document.getElementById('hamburger');
const mobileMenu      = document.getElementById('mobile-menu');
const pillAcademy     = document.getElementById('pill-academy');
const pillTech        = document.getElementById('pill-tech');
const academyDivision = document.getElementById('academy-division');
const techDivision    = document.getElementById('tech-division');

// Nav link groups
const academyNavItems = document.querySelectorAll('.academy-nav');
const techNavItems    = document.querySelectorAll('.tech-nav');
const mAcademyNavItems = document.querySelectorAll('.m-academy-nav');
const mTechNavItems    = document.querySelectorAll('.m-tech-nav');

// Mobile division pills
const mobPills = document.querySelectorAll('.mob-div-pill');

// ── Division Switcher ─────────────────────────────────────────
function switchDivision(division) {
  currentDivision = division;

  // Show/hide divisions
  if (division === 'academy') {
    academyDivision.classList.remove('hidden');
    techDivision.classList.add('hidden');

    // Pills
    pillAcademy.classList.add('active');
    pillTech.classList.remove('active');

    // Nav links
    academyNavItems.forEach(el => el.classList.remove('hidden'));
    techNavItems.forEach(el => el.classList.add('hidden'));
    mAcademyNavItems.forEach(el => el.classList.remove('hidden'));
    mTechNavItems.forEach(el => el.classList.add('hidden'));

    // Header stays green (default)
    header.style.background = '';

    // Mobile pills
    mobPills.forEach(p => {
      p.classList.toggle('active', p.dataset.division === 'academy');
    });

    // Scroll to academy home
    const target = document.getElementById('academy-home');
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }

  } else {
    academyDivision.classList.add('hidden');
    techDivision.classList.remove('hidden');

    // Pills
    pillTech.classList.add('active');
    pillAcademy.classList.remove('active');

    // Nav links
    techNavItems.forEach(el => el.classList.remove('hidden'));
    academyNavItems.forEach(el => el.classList.add('hidden'));
    mTechNavItems.forEach(el => el.classList.remove('hidden'));
    mAcademyNavItems.forEach(el => el.classList.add('hidden'));

    // Header turns red for tech division
    header.style.background = 'linear-gradient(90deg, #b71c1c, #c62828)';

    // Mobile pills
    mobPills.forEach(p => {
      p.classList.toggle('active', p.dataset.division === 'tech');
    });

    // Scroll to tech home
    const target = document.getElementById('tech-home');
    if (target) {
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    }
  }

  // Reinitialise scroll animations for newly visible elements
  initFadeIn();

  // Close mobile menu if open
  closeMobile();
}

// ── Division pill click listeners ─────────────────────────────
document.querySelectorAll('.div-pill').forEach(pill => {
  pill.addEventListener('click', function(e) {
    e.preventDefault();
    switchDivision(this.dataset.division);
  });
});

mobPills.forEach(pill => {
  pill.addEventListener('click', function() {
    switchDivision(this.dataset.division);
  });
});

// ── Mobile Menu ───────────────────────────────────────────────
hamburger.addEventListener('click', function() {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

function closeMobile() {
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', false);
}

// Close mobile menu when a nav link is clicked
document.querySelectorAll('.mobile-nav-links a').forEach(link => {
  link.addEventListener('click', closeMobile);
});

// ── Smooth Scroll for all hash links ─────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const hash = this.getAttribute('href');
    if (hash === '#') return;

    // Handle division switches via footer/header links
    const techSections = ['#tech-home', '#erp-products', '#tech-why-us', '#tech-contact'];
    const acaSections  = ['#academy-home', '#about', '#programs', '#contact'];

    if (techSections.includes(hash) && currentDivision !== 'tech') {
      e.preventDefault();
      switchDivision('tech');
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return;
    }

    if (acaSections.includes(hash) && currentDivision !== 'academy') {
      e.preventDefault();
      switchDivision('academy');
      setTimeout(() => {
        const target = document.querySelector(hash);
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return;
    }

    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── Active Nav Highlight on Scroll ───────────────────────────
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY  = window.scrollY + 100;

  sections.forEach(section => {
    const sectionTop    = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId     = section.getAttribute('id');

    if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.remove('active-link');
        if (a.getAttribute('href') === '#' + sectionId) {
          a.classList.add('active-link');
        }
      });
    }
  });
}

// ── Fade-In Scroll Animations ─────────────────────────────────
function initFadeIn() {
  const fadeEls = document.querySelectorAll(
    '.feature-card, .program-card, .erp-card, .why-card, ' +
    '.step-item, .contact-card, .detail-item, ' +
    '.about-section h2, .programs-section h2, .tech-section-title, ' +
    '.section-badge, .tech-section-badge'
  );

  fadeEls.forEach((el, i) => {
    el.classList.add('fade-in');
    // Stagger delay based on position in row
    el.style.transitionDelay = (i % 6) * 0.07 + 's';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  fadeEls.forEach(el => observer.observe(el));
}

// ── Header shadow on scroll ───────────────────────────────────
function handleHeaderScroll() {
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
  } else {
    header.style.boxShadow = '0 2px 16px rgba(46,125,50,0.25)';
  }
}

// ── Demo Form ─────────────────────────────────────────────────
function submitDemo(e) {
  e.preventDefault();

  const org   = document.getElementById('org-name').value;
  const type  = document.getElementById('org-type').value;
  const name  = document.getElementById('contact-name').value;
  const phone = document.getElementById('contact-phone').value;
  const email = document.getElementById('contact-email').value;
  const msg   = document.getElementById('message').value;

  // Build WhatsApp message
  const waText = encodeURIComponent(
    `*ERP Demo Request — Esubu Tech Solutions*\n\n` +
    `🏢 Organisation: ${org}\n` +
    `📂 Type: ${type}\n` +
    `👤 Contact: ${name}\n` +
    `📞 Phone: ${phone}\n` +
    `📧 Email: ${email}\n` +
    `💬 Message: ${msg || 'N/A'}`
  );

  // Open WhatsApp with the message
  window.open(`https://wa.me/254720811346?text=${waText}`, '_blank');

  // Show toast
  showToast('✅ Demo request sent via WhatsApp!');

  // Reset form
  document.getElementById('demo-form').reset();
}

// ── Toast Notification ────────────────────────────────────────
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4000);
}

// ── Event Listeners ───────────────────────────────────────────
window.addEventListener('scroll', () => {
  updateActiveLink();
  handleHeaderScroll();
}, { passive: true });

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  updateActiveLink();
  handleHeaderScroll();

  // Check URL hash on load
  const hash = window.location.hash;
  const techHashes = ['#tech-home', '#erp-products', '#tech-why-us', '#tech-contact'];
  if (techHashes.includes(hash)) {
    switchDivision('tech');
  }
});
