document.addEventListener('DOMContentLoaded', () => {

  /* Year in footer */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ===================== Language switch (FR / EN) ===================== */
  const langButtons = document.querySelectorAll('.lang-btn');
  const i18nEls = document.querySelectorAll('[data-i18n]');
  const i18nAttrEls = document.querySelectorAll('[data-i18n-attr]');

  let currentLang = 'fr';

  function applyLanguage(lang) {
    const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang]) ? TRANSLATIONS[lang] : null;
    if (!dict) return;
    currentLang = lang;

    i18nEls.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    i18nAttrEls.forEach(el => {
      el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim());
        if (attr && dict[key] !== undefined) el.setAttribute(attr, dict[key]);
      });
    });

    document.documentElement.setAttribute('lang', lang);
    langButtons.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-lang') === lang));

    if (dict['meta.title']) document.title = dict['meta.title'].replace(/&amp;/g, '&');
    const metaDesc = document.getElementById('meta-desc');
    if (metaDesc && dict['meta.description']) metaDesc.setAttribute('content', dict['meta.description']);

    try { localStorage.setItem('portfolio-lang', lang); } catch (e) { /* ignore storage errors */ }
  }

  langButtons.forEach(btn => {
    btn.addEventListener('click', () => applyLanguage(btn.getAttribute('data-lang')));
  });

  let initialLang = 'en';
  try {
    const saved = localStorage.getItem('portfolio-lang');
    if (saved === 'fr' || saved === 'en') initialLang = saved;
  } catch (e) { /* ignore storage errors */ }
  applyLanguage(initialLang);

  /* Header background on scroll */
  const header = document.getElementById('site-header');
  const onScroll = () => {
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile nav toggle */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  navToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mainNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* Scroll-spy active nav link */
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.main-nav a');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  sections.forEach(sec => spyObserver.observe(sec));

  /* Reveal-on-scroll for major blocks */
  const revealTargets = document.querySelectorAll(
    '.profil-grid, .timeline, .case-card, .pub-card, .skill-block, .languages-row, .contact-grid'
  );
  revealTargets.forEach(el => el.classList.add('reveal'));
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 3) * 80}ms`;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealTargets.forEach(el => revealObserver.observe(el));

  /* Contact form validation (client-side, no backend) */
  const form = document.getElementById('contact-form');
  const successMsg = document.getElementById('form-success');

  const validators = {
    name: (v) => v.trim().length > 1,
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    subject: (v) => v.trim().length > 1,
    message: (v) => v.trim().length > 4,
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    Object.keys(validators).forEach(fieldName => {
      const input = form.elements[fieldName];
      const field = input.closest('.form-field');
      const ok = validators[fieldName](input.value);
      field.classList.toggle('invalid', !ok);
      if (!ok) valid = false;
    });

    if (!valid) {
      successMsg.classList.remove('show');
      const firstInvalid = form.querySelector('.form-field.invalid input, .form-field.invalid textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const submitBtn = form.querySelector('.btn-submit-text');
    const originalLabel = submitBtn.textContent;
    const dict = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[currentLang]) ? TRANSLATIONS[currentLang] : null;
    submitBtn.textContent = (dict && dict['form.sending']) ? dict['form.sending'] : 'Envoi en cours…';

    setTimeout(() => {
      submitBtn.textContent = originalLabel;
      successMsg.classList.add('show');
      form.reset();
      form.querySelectorAll('.form-field').forEach(f => f.classList.remove('invalid'));
    }, 700);
  });

  /* Clear invalid state as user types */
  form.querySelectorAll('input, textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.closest('.form-field').classList.remove('invalid');
    });
  });

});
