/**
 * preloader.js — Master preloader + film grain canvas
 */

/** ── PRELOADER ─────────────────────────────────────────────── */
export function initPreloader(onComplete) {
  const preloader = document.getElementById('preloader');
  const fill      = document.getElementById('preloaderFill');
  const wordmark  = preloader.querySelector('.preloader__wordmark');
  const logo      = document.getElementById('preloaderWordmark');
  const logoMark  = logo?.querySelector('.preloader__logo-mark');
  const logoPaths = logo ? Array.from(logo.querySelectorAll('path, polygon')) : [];

  let progress = 0;

  // Fake progress tween (real progress would track XHR / image loads)
  // We animate from 0 → 100 over ~1.4s, then trigger exit
  const tl = gsap.timeline({
    onComplete: () => exitPreloader()
  });

  // Draw the supplied infinity mark, then fill it in
  tl.set(logo, { opacity: 1 });
  logoPaths.forEach((path, index) => {
    const length = path.getTotalLength();
    gsap.set(path, {
      fill: 'transparent',
      stroke: '#121212',
      strokeWidth: index === 0 ? 22 : 16,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      strokeDasharray: length,
      strokeDashoffset: length
    });
    tl.to(path, {
      strokeDashoffset: 0,
      duration: index === 0 ? 1.35 : 0.5,
      ease: index === 0 ? 'power2.inOut' : 'power3.out'
    }, index === 0 ? 0 : 1.05 + (index - 1) * 0.28);
  });
  tl.to(logoPaths, {
    fill: '#121212',
    strokeOpacity: 0,
    duration: 0.55,
    stagger: 0.08,
    ease: 'power2.out'
  }, 1.45);

  // Progress bar fill
  tl.to(fill, {
    width: '100%',
    duration: 1.4,
    ease: 'power2.inOut',
    onUpdate() {
      // nothing extra needed
    }
  }, 0);

  // Brief pause at 100%
  tl.to({}, { duration: 0.3 });

  function exitPreloader() {
    gsap.timeline({
      onComplete: () => {
        preloader.style.display = 'none';
        onComplete && onComplete();
      }
    })
    .to([wordmark, logo].filter(Boolean), { opacity: 0, y: -12, scale: 1.06, duration: 0.5, ease: 'power3.in' }, 0)
    .to(fill,     { opacity: 0, duration: 0.3 }, 0)
    .to(preloader, { opacity: 0, duration: 0.6, ease: 'power2.inOut' }, 0.2);
  }

  // Reveal scroll progress indicator after preloader exits
  setTimeout(() => {
    document.querySelector('.scroll-progress')?.classList.add('visible');
  }, 2200);
}

/** ── FILM GRAIN CANVAS ─────────────────────────────────────── */
export function initGrain() {
  const canvas = document.getElementById('grainCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animFrame;
  let lastTime = 0;
  const FPS = 24; // Grain refresh rate (lower = more cinematic)
  const interval = 1000 / FPS;

  function resize() {
    // Use a smaller grain texture and scale with CSS
    canvas.width  = Math.min(window.innerWidth,  512);
    canvas.height = Math.min(window.innerHeight, 512);
  }

  function drawGrain(timestamp) {
    animFrame = requestAnimationFrame(drawGrain);
    if (timestamp - lastTime < interval) return;
    lastTime = timestamp;

    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i]     = v; // R
      data[i + 1] = v; // G
      data[i + 2] = v; // B
      data[i + 3] = 38; // A (~15% opaque, CSS opacity brings it to ~5%)
    }

    ctx.putImageData(imageData, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(drawGrain);

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    cancelAnimationFrame(animFrame);
  }
}
