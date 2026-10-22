/**
 * smooth-scroll.js — Lenis smooth scroll synced with GSAP ScrollTrigger
 *
 * Key integration points:
 * 1. gsap.ticker drives lenis.raf() so both run on the same clock
 * 2. lenis.on('scroll') fires ScrollTrigger.update so pinning stays accurate
 * 3. lagSmoothing disabled to prevent drift
 */

export function initLenis() {
  const lenis = new Lenis({
    duration:         1.4,
    easing:           (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo
    direction:        'vertical',
    gestureDirection: 'vertical',
    smooth:           true,
    smoothTouch:      false,
    touchMultiplier:  2,
    infinite:         false,
  });

  // Drive lenis with the GSAP ticker (shared RAF = no jitter)
  gsap.ticker.add((time) => lenis.raf(time * 1000));

  // Prevent GSAP from smoothing out lag (causes drift with Lenis)
  gsap.ticker.lagSmoothing(0);

  // Keep ScrollTrigger in sync with Lenis's virtual scroll position
  lenis.on('scroll', ScrollTrigger.update);

  // Tell ScrollTrigger to read scroll position from Lenis
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        lenis.scrollTo(value, { immediate: true });
      }
      return lenis.scroll;
    },
    getBoundingClientRect() {
      return {
        top: 0, left: 0,
        width:  window.innerWidth,
        height: window.innerHeight,
      };
    },
    pinType: document.body.style.transform ? 'transform' : 'fixed',
  });

  // After any scroll trigger resize, refresh Lenis too
  ScrollTrigger.addEventListener('refresh', () => lenis.resize());

  return lenis;
}
