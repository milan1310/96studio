/**
 * sections/about.js — Section 02: About
 *
 * Handles:
 *  - Image clip-path wipe reveal (scrubbed)
 *  - Inner image scale 1.3 → 1 (parallax)
 *  - Heading line-by-line reveal
 *  - Body text word-by-word opacity scrub (0.15 → 1)
 */

export function initAbout() {
  const section    = document.getElementById('about');
  const clipEl     = section.querySelector('.about__image-clip');
  const innerImg   = section.querySelector('.about__image-inner');
  const heading    = section.querySelector('.about__heading');
  const headLines  = heading.querySelectorAll('.line');
  const bodyEl     = section.querySelector('.about__body');
  const divider    = section.querySelector('.about__divider');
  const footerEl   = section.querySelector('.about__footer');

  const mm = gsap.matchMedia();

  // ── HEADING LINES REVEAL ────────────────────────────────────
  // Simple scroll-triggered stagger, not scrubbed
  gsap.from(headLines, {
    y: 60,
    opacity: 0,
    duration: 1.0,
    stagger: 0.14,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: heading,
      start: 'top 80%',
      id: 'about-heading',
    }
  });

  // ── DIVIDER ─────────────────────────────────────────────────
  gsap.from(divider, {
    scaleX: 0,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: divider,
      start: 'top 85%',
    }
  });

  // ── BODY TEXT WORD-BY-WORD OPACITY SCRUB ────────────────────
  // Split body text into words with spans
  splitWords(bodyEl);
  const words = bodyEl.querySelectorAll('.word');

  gsap.from(words, {
    opacity: 0.12,
    duration: 0.5,
    stagger: {
      each: 0.03,
      from: 'start',
    },
    ease: 'none',
    scrollTrigger: {
      trigger: bodyEl,
      start: 'top 75%',
      end:   'bottom 40%',
      scrub: 1.5,
      id: 'about-words',
    }
  });

  // Footer
  gsap.from(footerEl, {
    opacity: 0,
    y: 20,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: footerEl,
      start: 'top 88%',
    }
  });

  // ── IMAGE CLIP-PATH WIPE ─────────────────────────────────────
  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
    gsap.to(clipEl, {
      clipPath: 'inset(0 0% 0 0)',
      ease: 'power3.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 60%',
        end:   'top 20%',
        scrub: 1,
        id: 'about-clip',
      }
    });

    // Inner image scale parallax
    gsap.to(innerImg, {
      scale: 1.0,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end:   'bottom top',
        scrub: 1.5,
        id: 'about-imgscale',
      }
    });
  });

  mm.add('(max-width: 768px)', () => {
    // Mobile: just fade in
    gsap.from(clipEl, {
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: clipEl,
        start: 'top 85%',
      }
    });
  });
}

/**
 * Splits all text nodes inside an element into <span class="word"> per word.
 * Preserves existing block-level children.
 */
function splitWords(container) {
  container.querySelectorAll('p').forEach((p) => {
    const text = p.textContent;
    const words = text.split(/\s+/).filter(Boolean);
    p.innerHTML = words.map(w => `<span class="word" aria-hidden="false">${w}</span>`).join(' ');
  });
}
