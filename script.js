/* ============================================================
   ESUBU TECH â€” script.js  (multi-page version)
   ============================================================ */

const header    = document.getElementById('main-header');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

/* â”€â”€ Mobile nav toggle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
if (hamburger) {
  hamburger.addEventListener('click', function () {
    const isOpen = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
  });
}

function closeMobile() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  if (hamburger) {
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', false);
  }
}

document.querySelectorAll('.mobile-nav-links a, .mob-div-pill').forEach(link => {
  link.addEventListener('click', closeMobile);
});

/* â”€â”€ Smooth scroll for in-page anchor links â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const hash = this.getAttribute('href');
    if (hash === '#') return;
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      closeMobile();
    }
  });
});

/* â”€â”€ Active nav link on scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function updateActiveLink() {
  const scrollY = window.scrollY + 120;
  document.querySelectorAll('section[id]').forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active-link', a.getAttribute('href') === '#' + section.id);
      });
    }
  });
}

/* â”€â”€ Header shadow on scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function handleHeaderScroll() {
  if (!header) return;
  header.style.boxShadow = window.scrollY > 10
    ? '0 4px 20px rgba(0,0,0,0.2)'
    : '0 2px 16px rgba(46,125,50,0.25)';
}

/* â”€â”€ Fade-in animation on scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function initFadeIn() {
  const fadeEls = document.querySelectorAll(
    '.feature-card, .program-card, .erp-card, .why-card, .step-item, ' +
    '.contact-card, .detail-item, .data-card, .data-step, .tool-pill, ' +
    '.section-badge, .tech-section-badge, .data-section-badge, ' +
    '.cs-card, .why-reason-card, .wing-card, .lp-stat-item'
  );
  fadeEls.forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = (i % 6) * 0.07 + 's';
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));
}

/* â”€â”€ Form: ERP Demo Request â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function submitDemo(e) {
  e.preventDefault();
  const org   = document.getElementById('org-name')?.value || '';
  const type  = document.getElementById('org-type')?.value || '';
  const name  = document.getElementById('contact-name')?.value || '';
  const phone = document.getElementById('contact-phone')?.value || '';
  const email = document.getElementById('contact-email')?.value || '';
  const msg   = document.getElementById('message')?.value || '';
  const waText = encodeURIComponent(
    `*ERP Demo Request â€” Esubu Tech Solutions*\n\n` +
    `ðŸ¢ Organisation: ${org}\nðŸ“‚ Type: ${type}\nðŸ‘¤ Contact: ${name}\n` +
    `ðŸ“ž Phone: ${phone}\nðŸ“§ Email: ${email}\nðŸ’¬ Message: ${msg || 'N/A'}`
  );
  window.open(`https://wa.me/254720811346?text=${waText}`, '_blank');
  showToast('âœ… Demo request sent via WhatsApp!');
  document.getElementById('demo-form')?.reset();
}

/* â”€â”€ Form: Data Science Project Brief â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function submitDataForm(e) {
  e.preventDefault();
  const org     = document.getElementById('d-org')?.value || '';
  const service = document.getElementById('d-service')?.value || '';
  const name    = document.getElementById('d-name')?.value || '';
  const phone   = document.getElementById('d-phone')?.value || '';
  const email   = document.getElementById('d-email')?.value || '';
  const msg     = document.getElementById('d-message')?.value || '';
  const waText = encodeURIComponent(
    `*Data Science Project Brief â€” Esubu Tech*\n\n` +
    `ðŸ¢ Organisation: ${org}\nðŸ“Š Service: ${service}\nðŸ‘¤ Contact: ${name}\n` +
    `ðŸ“ž Phone: ${phone}\nðŸ“§ Email: ${email}\nðŸ’¬ Challenge: ${msg || 'N/A'}`
  );
  window.open(`https://wa.me/254720811346?text=${waText}`, '_blank');
  showToast('âœ… Project brief sent via WhatsApp!');
  document.getElementById('data-form')?.reset();
}

/* â”€â”€ Form: Landing page general contact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function submitLandingContact(e) {
  e.preventDefault();
  const name  = document.getElementById('lp-name')?.value || '';
  const phone = document.getElementById('lp-phone')?.value || '';
  const interest = document.getElementById('lp-interest')?.value || '';
  const waText = encodeURIComponent(
    `*Esubu Tech â€” General Enquiry*\n\n` +
    `ðŸ‘¤ Name: ${name}\nðŸ“ž Phone: ${phone}\nðŸ” Interest: ${interest}`
  );
  window.open(`https://wa.me/254720811346?text=${waText}`, '_blank');
  showToast('âœ… Message sent via WhatsApp!');
  document.getElementById('lp-contact-form')?.reset();
}

/* â”€â”€ Toast notification â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

/* â”€â”€ Init â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
window.addEventListener('scroll', () => {
  updateActiveLink();
  handleHeaderScroll();
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  updateActiveLink();
  handleHeaderScroll();
});
