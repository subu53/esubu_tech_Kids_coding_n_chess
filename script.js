/* ============================================================
   ESUBU TECH — script.js  (3-division version)
   ============================================================ */

let currentDivision = 'academy';

const header          = document.getElementById('main-header');
const hamburger       = document.getElementById('hamburger');
const mobileMenu      = document.getElementById('mobile-menu');
const pillAcademy     = document.getElementById('pill-academy');
const pillTech        = document.getElementById('pill-tech');
const pillData        = document.getElementById('pill-data');
const academyDivision = document.getElementById('academy-division');
const techDivision    = document.getElementById('tech-division');
const dataDivision    = document.getElementById('data-division');

const academyNavItems  = document.querySelectorAll('.academy-nav');
const techNavItems     = document.querySelectorAll('.tech-nav');
const dataNavItems     = document.querySelectorAll('.data-nav');
const mAcademyNavItems = document.querySelectorAll('.m-academy-nav');
const mTechNavItems    = document.querySelectorAll('.m-tech-nav');
const mDataNavItems    = document.querySelectorAll('.m-data-nav');
const mobPills         = document.querySelectorAll('.mob-div-pill');

const headerColours = {
  academy: '',
  tech:    'linear-gradient(90deg, #b71c1c, #c62828)',
  data:    'linear-gradient(135deg, #1b5e20 0%, #7b1a1a 50%, #b71c1c 100%)'
};

function switchDivision(division) {
  currentDivision = division;

  academyDivision.classList.toggle('hidden', division !== 'academy');
  techDivision.classList.toggle('hidden',    division !== 'tech');
  dataDivision.classList.toggle('hidden',    division !== 'data');

  pillAcademy.classList.toggle('active', division === 'academy');
  pillTech.classList.toggle('active',    division === 'tech');
  if (pillData) pillData.classList.toggle('active', division === 'data');

  academyNavItems.forEach(el => el.classList.toggle('hidden', division !== 'academy'));
  techNavItems.forEach(el    => el.classList.toggle('hidden', division !== 'tech'));
  dataNavItems.forEach(el    => el.classList.toggle('hidden', division !== 'data'));

  mAcademyNavItems.forEach(el => el.classList.toggle('hidden', division !== 'academy'));
  mTechNavItems.forEach(el    => el.classList.toggle('hidden', division !== 'tech'));
  mDataNavItems.forEach(el    => el.classList.toggle('hidden', division !== 'data'));

  mobPills.forEach(p => p.classList.toggle('active', p.dataset.division === division));

  header.style.background = headerColours[division] || '';

  const targetMap = { academy: '#academy-home', tech: '#tech-home', data: '#data-home' };
  const target = document.querySelector(targetMap[division]);
  if (target) {
    setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  }

  initFadeIn();
  closeMobile();
}

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

document.querySelectorAll('.mobile-nav-links a').forEach(link => {
  link.addEventListener('click', closeMobile);
});

const techSections = ['#tech-home','#erp-products','#tech-why-us','#tech-contact'];
const acaSections  = ['#academy-home','#about','#programs','#contact'];
const dataSections = ['#data-home','#data-services','#data-process','#data-contact'];

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const hash = this.getAttribute('href');
    if (hash === '#') return;

    let targetDivision = null;
    if (techSections.includes(hash) && currentDivision !== 'tech')    targetDivision = 'tech';
    if (acaSections.includes(hash)  && currentDivision !== 'academy') targetDivision = 'academy';
    if (dataSections.includes(hash) && currentDivision !== 'data')    targetDivision = 'data';

    if (targetDivision) {
      e.preventDefault();
      switchDivision(targetDivision);
      setTimeout(() => {
        const t = document.querySelector(hash);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return;
    }

    const t = document.querySelector(hash);
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

function updateActiveLink() {
  const scrollY = window.scrollY + 100;
  document.querySelectorAll('section[id]').forEach(section => {
    if (scrollY >= section.offsetTop && scrollY < section.offsetTop + section.offsetHeight) {
      document.querySelectorAll('.nav-links a').forEach(a => {
        a.classList.toggle('active-link', a.getAttribute('href') === '#' + section.id);
      });
    }
  });
}

function initFadeIn() {
  const fadeEls = document.querySelectorAll(
    '.feature-card, .program-card, .erp-card, .why-card, .step-item, ' +
    '.contact-card, .detail-item, .data-card, .data-step, .tool-pill, ' +
    '.section-badge, .tech-section-badge, .data-section-badge'
  );
  fadeEls.forEach((el, i) => {
    el.classList.add('fade-in');
    el.style.transitionDelay = (i % 6) * 0.07 + 's';
  });
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  fadeEls.forEach(el => observer.observe(el));
}

function handleHeaderScroll() {
  header.style.boxShadow = window.scrollY > 10
    ? '0 4px 20px rgba(0,0,0,0.2)'
    : '0 2px 16px rgba(46,125,50,0.25)';
}

function submitDemo(e) {
  e.preventDefault();
  const org   = document.getElementById('org-name').value;
  const type  = document.getElementById('org-type').value;
  const name  = document.getElementById('contact-name').value;
  const phone = document.getElementById('contact-phone').value;
  const email = document.getElementById('contact-email').value;
  const msg   = document.getElementById('message').value;
  const waText = encodeURIComponent(
    `*ERP Demo Request — Esubu Tech Solutions*\n\n` +
    `🏢 Organisation: ${org}\n📂 Type: ${type}\n👤 Contact: ${name}\n` +
    `📞 Phone: ${phone}\n📧 Email: ${email}\n💬 Message: ${msg || 'N/A'}`
  );
  window.open(`https://wa.me/254720811346?text=${waText}`, '_blank');
  showToast('✅ Demo request sent via WhatsApp!');
  document.getElementById('demo-form').reset();
}

function submitDataForm(e) {
  e.preventDefault();
  const org     = document.getElementById('d-org').value;
  const service = document.getElementById('d-service').value;
  const name    = document.getElementById('d-name').value;
  const phone   = document.getElementById('d-phone').value;
  const email   = document.getElementById('d-email').value;
  const msg     = document.getElementById('d-message').value;
  const waText = encodeURIComponent(
    `*Data Science Project Brief — Esubu Tech*\n\n` +
    `🏢 Organisation: ${org}\n📊 Service: ${service}\n👤 Contact: ${name}\n` +
    `📞 Phone: ${phone}\n📧 Email: ${email}\n💬 Challenge: ${msg || 'N/A'}`
  );
  window.open(`https://wa.me/254720811346?text=${waText}`, '_blank');
  showToast('✅ Project brief sent via WhatsApp!');
  document.getElementById('data-form').reset();
}

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

window.addEventListener('scroll', () => {
  updateActiveLink();
  handleHeaderScroll();
}, { passive: true });

document.addEventListener('DOMContentLoaded', () => {
  initFadeIn();
  updateActiveLink();
  handleHeaderScroll();
  const hash = window.location.hash;
  if (techSections.includes(hash))      switchDivision('tech');
  else if (dataSections.includes(hash)) switchDivision('data');
});
