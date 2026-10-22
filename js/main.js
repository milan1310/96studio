/**
 * main.js — the96studio
 * Entry point. Initialises all modules after GSAP + Lenis load.
 */

// Wait for all deferred scripts to load
window.addEventListener('load', async () => {
  // Register GSAP plugins
  gsap.registerPlugin(ScrollTrigger, Flip);

  // Import modules (deduplicated)
  const { initGrain, initPreloader } = await import('./preloader.js');
  const { initLenis }                = await import('./smooth-scroll.js');
  const { initCursor }               = await import('./cursor.js');
  const { initHeader, initScrollProgress } = await import('./sections/header.js');
  const { initHome }    = await import('./sections/home.js');
  const { initAbout }   = await import('./sections/about.js');
  const { initServices }= await import('./sections/services.js');
  const { initWork }    = await import('./sections/work.js');
  const { initReveal }  = await import('./sections/reveal.js');
  const { initContact } = await import('./sections/contact.js');

  // Film grain canvas — independent animation loop
  initGrain();

  // Smooth scroll must init before ScrollTrigger is used
  const lenis = initLenis();

  // Custom cursor
  initCursor();

  // Persistent UI
  initHeader(lenis);
  initScrollProgress(lenis);

  // Preloader runs, then fires callback which boots all section animations
  initPreloader(() => {
    initHome(lenis);
    initAbout();
    initServices(lenis);
    initWork(lenis);
    initReveal();
    initContact(lenis);

    // Refresh ScrollTrigger after all sections are inited
    ScrollTrigger.refresh();
  });

  // Debounced resize → ST refresh
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
  });
});
