/**
 * sections/home.js — Section 01: Hero / Arrival
 *
 * Handles:
 *  - Intro timeline (arc draw → glow → headline → nav)
 *  - Scroll-pinned parallax (arc rise, background scale, headline drift)
 *  - Mouse-move parallax on star/mountain/pool layers
 */

export function initHome(lenis) {
  const section    = document.getElementById('home');
  const arcSharp   = section.querySelector('.arc__path--sharp');
  const arcGlow    = section.querySelector('.arc__path--glow');
  const arcBloom   = section.querySelector('.arc__bloom');
  const arcSun     = section.querySelector('.arc__sun');
  const arcSunCore = section.querySelector('.arc__sun-core');
  const headline   = section.querySelector('.home__headline');
  const subline    = section.querySelector('#heroSubline');
  const scrollCue  = section.querySelector('#scrollCue');
  const header     = document.getElementById('siteHeader');

  const bgStars     = section.querySelector('.home__bg--stars');
  const bgMountains = section.querySelector('.home__bg--mountains');
  const bgPool      = section.querySelector('.home__bg--pool');

  const lines = section.querySelectorAll('.home__headline .line');

  const mm = gsap.matchMedia();

  /* ── INTRO TIMELINE ─────────────────────────────────────── */
  // Triggered once preloader exits
  const introTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

  // 1. Arc path draws itself (stroke-dashoffset → 0)
  introTL
    .to([arcSharp, arcGlow], {
      strokeDashoffset: 0,
      duration: 1.8,
      ease: 'power2.inOut',
      stagger: 0.1,
    }, 0)

    // 2. Glow / bloom appear
    .to([arcGlow, arcBloom], {
      opacity: 1,
      duration: 1.2,
      ease: 'sine.inOut',
    }, 0.6)
    .to([arcSun, arcSunCore], {
      opacity: 1,
      duration: 1.0,
      ease: 'sine.inOut',
    }, 1.0)

    // 3. Headline lines slide up from mask
    .to(lines, {
      y: 0,
      opacity: 1,
      duration: 1.0,
      stagger: 0.12,
      ease: 'power3.out',
    }, 1.2)

    // 4. Subline and scroll cue
    .to(subline, {
      opacity: 1,
      y: 0,
      duration: 0.8,
    }, 1.7)
    .to(scrollCue, {
      opacity: 1,
      duration: 0.8,
    }, 1.9)

    // 5. Section label and header
    .to(section.querySelector('.section__label'), {
      opacity: 1,
      duration: 0.6,
    }, 2.0)
    .to(header, {
      opacity: 1,
      duration: 0.8,
    }, 2.0);

  /* ── SCROLL-PINNED PARALLAX ─────────────────────────────── */
  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {

    // Pin section while arc rises and scene builds
    ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=80%',
      pin: true,
      pinSpacing: true,
      scrub: 1,
      id: 'home-pin',
      onUpdate(self) {
        const p = self.progress;

        // Arc rises: animate the SVG path's control point via the CSS transform
        // We simulate "rising sun" by scaling and translating the arc wrapper
        gsap.set('.home__arc-svg', {
          y: -p * 60,
        });

        // Bloom grows
        gsap.set(arcBloom, { opacity: Math.min(0.5 + p * 0.5, 1) });

        // Background scales (parallax zoom)
        gsap.set([bgStars, bgMountains], {
          scale: 1 + p * 0.15,
        });

        // Headline fades and drifts up on later scroll
        const fadeStart = 0.5;
        const fadeProg  = Math.max(0, (p - fadeStart) / (1 - fadeStart));
        gsap.set([headline, subline, scrollCue], {
          opacity: 1 - fadeProg,
          y: -fadeProg * 40,
        });
      }
    });
  });

  /* ── MOUSE-MOVE PARALLAX ────────────────────────────────── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const starX  = gsap.quickTo(bgStars,     'x', { duration: 1.2, ease: 'power3.out' });
    const starY  = gsap.quickTo(bgStars,     'y', { duration: 1.2, ease: 'power3.out' });
    const mtnX   = gsap.quickTo(bgMountains, 'x', { duration: 0.9, ease: 'power3.out' });
    const mtnY   = gsap.quickTo(bgMountains, 'y', { duration: 0.9, ease: 'power3.out' });
    const poolX  = gsap.quickTo(bgPool,      'x', { duration: 0.6, ease: 'power3.out' });
    const poolY  = gsap.quickTo(bgPool,      'y', { duration: 0.6, ease: 'power3.out' });

    section.addEventListener('mousemove', (e) => {
      // Normalize to -1 … +1
      const nx = (e.clientX / window.innerWidth  - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;

      starX(nx * -14); starY(ny * -10); // stars: far, slow
      mtnX(nx * -22);  mtnY(ny * -14); // mountains: medium
      poolX(nx * -8);  poolY(ny * -5); // pool: near, fast
    });
  }
}
