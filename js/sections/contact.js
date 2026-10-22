/**
 * sections/contact.js — Section 06: Contact
 *
 * Handles:
 *  - Ken Burns background zoom/pan (scrubbed)
 *  - Headline char-by-char stagger reveal
 *  - "Start a Project" panel slide-in with form validation + success state
 */

export function initContact(lenis) {
  const section  = document.getElementById('contact');
  const bg       = section.querySelector('.contact__bg');
  const headline = section.querySelector('.contact__headline');
  const lines    = headline.querySelectorAll('.line');
  const startBtn = document.getElementById('startProjectBtn');

  /* ── HEADLINE LINE REVEAL ────────────────────────────────── */
  gsap.from(lines, {
    y: 60,
    opacity: 0,
    duration: 1.0,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: headline,
      start: 'top 80%',
      id: 'contact-headline',
    }
  });

  /* ── DIVIDER ─────────────────────────────────────────────── */
  gsap.from(section.querySelector('.contact__divider'), {
    scaleX: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section.querySelector('.contact__divider'),
      start: 'top 85%',
    }
  });

  /* ── KEN BURNS BACKGROUND ────────────────────────────────── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.to(bg, {
      scale: 1.12,
      x: -30,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end:   'bottom top',
        scrub: 2,
        id:    'contact-kenburnds',
      }
    });
  }

  /* ── CONTACT PANEL ───────────────────────────────────────── */
  const panel     = document.getElementById('contactPanel');
  const panelClose = document.getElementById('contactPanelClose');
  const backdrop  = document.getElementById('modalBackdrop');
  const form      = document.getElementById('projectForm');
  const success   = document.getElementById('formSuccess');

  function openPanel() {
    panel.hidden = false;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Slide in
    gsap.fromTo(panel,
      { x: '100%' },
      { x: '0%', duration: 0.7, ease: 'power3.out' }
    );

    // Animate form fields in
    gsap.from(panel.querySelectorAll('.form-field, .form-chips, .btn-pill--submit'), {
      opacity: 0,
      y: 20,
      stagger: 0.07,
      duration: 0.6,
      ease: 'power3.out',
      delay: 0.3,
    });

    panelClose.focus();
  }

  function closePanel() {
    gsap.to(panel, {
      x: '100%',
      duration: 0.6,
      ease: 'power3.in',
      onComplete: () => {
        panel.hidden = true;
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  startBtn.addEventListener('click', openPanel);
  panelClose.addEventListener('click', closePanel);

  // Backdrop click only closes panel if panel is open and modal is not
  backdrop.addEventListener('click', () => {
    if (!panel.hidden) closePanel();
  });

  // Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) closePanel();
    if (e.key === 'Tab' && !panel.hidden) {
      trapFocus(e, panel);
    }
  });

  /* ── FORM VALIDATION & SUBMIT ─────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let valid = true;

    // Name
    const nameInput  = document.getElementById('fieldName');
    const nameError  = nameInput.closest('.form-field').querySelector('.form-field__error');
    if (!nameInput.value.trim()) {
      nameError.textContent = 'Please enter your name.';
      valid = false;
    } else {
      nameError.textContent = '';
    }

    // Email
    const emailInput = document.getElementById('fieldEmail');
    const emailError = emailInput.closest('.form-field').querySelector('.form-field__error');
    const emailReg   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(emailInput.value.trim())) {
      emailError.textContent = 'Please enter a valid email.';
      valid = false;
    } else {
      emailError.textContent = '';
    }

    if (!valid) return;

    /*
     * TODO: Replace this block with your actual form submission.
     * Options:
     *   - Formspree: fetch('https://formspree.io/f/YOUR_ID', { method: 'POST', ... })
     *   - Netlify Forms: add data-netlify="true" to <form>
     *   - EmailJS: emailjs.sendForm(...)
     */

    // Simulate async submission
    const submitBtn = form.querySelector('.btn-pill--submit');
    submitBtn.textContent = 'SENDING…';
    submitBtn.disabled = true;

    await new Promise(r => setTimeout(r, 1200)); // Fake delay

    // Success state
    gsap.to(form.querySelectorAll('.form-field, .form-chips, .btn-pill--submit'), {
      opacity: 0, y: -10, stagger: 0.04, duration: 0.4, ease: 'power3.in',
      onComplete: () => {
        form.querySelectorAll('.form-field, .form-chips, .btn-pill--submit')
          .forEach(el => el.style.display = 'none');
        success.hidden = false;
        gsap.from(success, { opacity: 0, scale: 0.9, duration: 0.5, ease: 'power3.out' });
      }
    });
  });
}

function trapFocus(e, container) {
  const focusables = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
  } else {
    if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
  }
}
