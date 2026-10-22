/**
 * sections/reveal.js — Section 05: The Reveal (9∞6)
 *
 * Scroll-pinned, scrubbed timeline:
 *  1. Origin point glows on horizon
 *  2. Infinity path draws from dashoffset
 *  3. "9" slides in from left, "6" from right
 *  4. Headline lines appear one by one
 *  5. Subline + wordmark fade in
 *  6. Looping pulse after completion
 */

export function initReveal() {
  const section   = document.getElementById('reveal');
  const infGlow   = section.querySelector('.inf__path--glow');
  const infSharp  = section.querySelector('.inf__path--sharp');
  const infOrigin = section.querySelector('.inf__origin');
  const digit9    = document.getElementById('digit9');
  const digit6    = document.getElementById('digit6');
  const lines     = section.querySelectorAll('.reveal__headline .line');
  const subline   = section.querySelector('.reveal__subline');
  const wordmark  = section.querySelector('.reveal__wordmark');

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    /* ── PINNED SCRUB TIMELINE ──────────────────────────────── */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start:   'top top',
        end:     '+=220%',
        pin:     true,
        pinSpacing: true,
        scrub:   2,
        id:      'reveal-pin',
      }
    });

    // 0. Initial state — set BEFORE timeline tweens
    gsap.set(digit9,              { opacity: 0, x: -80 });
    gsap.set(digit6,              { opacity: 0, x:  80 });
    gsap.set([infGlow, infSharp], { opacity: 0, strokeDashoffset: 600 });
    gsap.set(infOrigin,           { opacity: 0, scale: 1 });
    gsap.set(lines,               { opacity: 0, y: 20 });
    gsap.set([subline, wordmark], { opacity: 0 });

    // 1. Origin point glows (timeline pos 0 → 0.15)
    tl.to(infOrigin, {
      opacity: 1,
      scale: 2.5,
      duration: 0.15,
      ease: 'sine.inOut',
    }, 0)

    // 2. Infinity draws (0.1 → 0.5)
    .to([infGlow, infSharp], {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 0.4,
      ease: 'power2.inOut',
      stagger: 0.04,
    }, 0.1)

    // Origin fades as loop completes
    .to(infOrigin, {
      opacity: 0,
      scale: 1,
      duration: 0.1,
    }, 0.46)

    // 3. Digits slide in (0.4 → 0.65)
    .to(digit9, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: 'expo.out',
    }, 0.4)
    .to(digit6, {
      opacity: 1,
      x: 0,
      duration: 0.2,
      ease: 'expo.out',
    }, 0.46)

    // 4. Headline lines (0.58 → 0.88)
    .to(lines, {
      opacity: 1,
      y: 0,
      duration: 0.12,
      stagger: 0.1,
      ease: 'power3.out',
    }, 0.58)

    // 5. Subline + wordmark (0.82 → 1.0)
    .to(subline,  { opacity: 1, duration: 0.1, ease: 'sine.inOut' }, 0.82)
    .to(wordmark, { opacity: 1, duration: 0.1, ease: 'sine.inOut' }, 0.91);
  });

  /* ── LOOPING PULSE (runs independently, subtle glow on infinity) ── */
  gsap.to(infGlow, {
    opacity: 0.35,
    duration: 2.0,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true,
    delay: 5,
  });

  /* ── REDUCED MOTION FALLBACK ─────────────────────────────── */
  mm.add('(prefers-reduced-motion: reduce)', () => {
    gsap.set([digit9, digit6, ...lines, subline, wordmark], {
      opacity: 1, x: 0, y: 0,
    });
    gsap.set([infGlow, infSharp], { opacity: 1, strokeDashoffset: 0 });
    gsap.set(infOrigin, { opacity: 0 });

    ScrollTrigger.create({
      trigger: section,
      start: 'top 80%',
      once: true,
      onEnter: () => gsap.to(section, { opacity: 1, duration: 0.5 }),
    });
  });
}
