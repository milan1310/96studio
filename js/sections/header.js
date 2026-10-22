/**
 * sections/header.js — Persistent header (hide/reveal on scroll)
 * + vertical scroll-progress dots indicator
 */

export function initHeader(lenis) {
  const header = document.getElementById('siteHeader');
  let lastScroll = 0;
  let ticking = false;

  lenis.on('scroll', ({ scroll }) => {
    if (ticking) return;

    requestAnimationFrame(() => {
      const curr = scroll;

      // Add scrolled class once past 60px
      header.classList.toggle('header--scrolled', curr > 60);

      // Hide on scroll down, reveal on scroll up
      if (curr > lastScroll && curr > 200) {
        header.classList.add('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }

      lastScroll = curr > 0 ? curr : 0;
      ticking = false;
    });

    ticking = true;
  });

  // Nav smooth-scroll links
  document.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target && lenis) {
        lenis.scrollTo(target, { offset: -60, duration: 1.6, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      }
    });
  });
}

export function initScrollProgress(lenis) {
  const dots    = document.querySelectorAll('.scroll-progress__dot');
  const sections = document.querySelectorAll('.section');

  // Map section positions
  function updateDots(scroll) {
    let activeIdx = 0;
    sections.forEach((section, i) => {
      const top = section.offsetTop;
      const h   = section.offsetHeight;
      if (scroll >= top - h * 0.4) {
        activeIdx = i;
      }
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === activeIdx);
      dot.setAttribute('aria-selected', i === activeIdx ? 'true' : 'false');
    });
  }

  lenis.on('scroll', ({ scroll }) => updateDots(scroll));

  // Dot click — scroll to that section
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      const target = sections[i];
      if (target && lenis) {
        lenis.scrollTo(target, { offset: 0, duration: 1.8, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      }
    });
  });

  // Also handle about-section button
  const aboutBtn = document.getElementById('aboutScrollBtn');
  if (aboutBtn) {
    aboutBtn.addEventListener('click', () => {
      const reveal = document.getElementById('reveal');
      if (reveal && lenis) {
        lenis.scrollTo(reveal, { duration: 1.8 });
      }
    });
  }
}
