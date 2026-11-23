/**
 * gallery.js — the96studio Gallery Page
 *
 * Handles:
 *  - Film grain canvas
 *  - Lenis smooth scroll
 *  - Custom cursor + magnetic buttons
 *  - Header hide/show on scroll
 *  - Hero intro animation
 *  - Interlude label reveal
 *  - Bento cell entry (stagger from bottom)
 *  - Per-cell parallax (translateY on .gal-cell__img via ScrollTrigger scrub)
 *  - Lightbox (open/close, prev/next, keyboard nav)
 *  - Scroll-progress dots
 */

(function () {
  'use strict';

  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded');
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  /* ══════════════════════════════════════════════════════════
     IMAGE MANIFEST (order matches DOM)
  ══════════════════════════════════════════════════════════ */
  var IMAGES = [
    { src: 'assets/img/gallery/IMG_0144.PNG', tag: 'INTERIOR' },
    { src: 'assets/img/gallery/IMG_0146.PNG', tag: 'RESIDENCE' },
    { src: 'assets/img/gallery/IMG_0147.PNG', tag: 'HOSPITALITY' },
    { src: 'assets/img/gallery/IMG_0145.PNG', tag: 'DETAIL' },
    { src: 'assets/img/gallery/IMG_0149.PNG', tag: 'ATMOSPHERE' },
    { src: 'assets/img/gallery/IMG_0150.PNG', tag: 'COMMERCIAL' },
    { src: 'assets/img/gallery/IMG_0148.PNG', tag: 'INTERIOR' },
    { src: 'assets/img/gallery/IMG_0151.PNG', tag: 'DETAIL' },
    { src: 'assets/img/gallery/IMG_0152.PNG', tag: 'RESIDENCE' },
    { src: 'assets/img/gallery/IMG_0153.PNG', tag: 'ATMOSPHERE' },
    { src: 'assets/img/gallery/IMG_0154.PNG', tag: 'HOSPITALITY' },
    { src: 'assets/img/gallery/IMG_0155.PNG', tag: 'DETAIL' },
    { src: 'assets/img/gallery/IMG_0157.PNG', tag: 'INTERIOR' },
    { src: 'assets/img/gallery/IMG_0156.PNG', tag: 'RESIDENCE' },
    { src: 'assets/img/gallery/IMG_0158.PNG', tag: 'ATMOSPHERE' },
    { src: 'assets/img/gallery/IMG_0160.PNG', tag: 'INTERIOR' },
    { src: 'assets/img/gallery/IMG_0159.PNG', tag: 'RESIDENCE' },
    { src: 'assets/img/gallery/IMG_0161.PNG', tag: 'COMMERCIAL' },
    { src: 'assets/img/gallery/IMG_0162.PNG', tag: 'DETAIL' },
    { src: 'assets/img/gallery/IMG_0163.PNG', tag: 'ATMOSPHERE' },
  ];

  /* ══════════════════════════════════════════════════════════
     FILM GRAIN
  ══════════════════════════════════════════════════════════ */
  function initGrain() {
    var canvas = document.getElementById('grainCanvas');
    if (!canvas) return;
    var ctx  = canvas.getContext('2d');
    var last = 0;
    var interval = 1000 / 20; // 20 fps

    function resize() {
      canvas.width  = Math.min(window.innerWidth,  512);
      canvas.height = Math.min(window.innerHeight, 512);
    }
    function draw(ts) {
      requestAnimationFrame(draw);
      if (ts - last < interval) return;
      last = ts;
      var w = canvas.width, h = canvas.height;
      var img = ctx.createImageData(w, h);
      var d = img.data;
      for (var i = 0; i < d.length; i += 4) {
        var v = (Math.random() * 255) | 0;
        d[i] = d[i+1] = d[i+2] = v; d[i+3] = 32;
      }
      ctx.putImageData(img, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      requestAnimationFrame(draw);
    }
  }

  /* ══════════════════════════════════════════════════════════
     LENIS
  ══════════════════════════════════════════════════════════ */
  var lenis = null;
  function initLenis() {
    if (typeof Lenis === 'undefined') return null;
    lenis = new Lenis({
      duration: 1.4,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothTouch: false,
    });
    gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', function() { ScrollTrigger.update(); });
    return lenis;
  }

  /* ══════════════════════════════════════════════════════════
     CUSTOM CURSOR
  ══════════════════════════════════════════════════════════ */
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;
    var cursor = document.getElementById('cursor');
    var label  = cursor ? cursor.querySelector('.cursor__label') : null;
    if (!cursor) return;

    var xTo = gsap.quickTo(cursor, 'x', { duration: 0.55, ease: 'power3.out' });
    var yTo = gsap.quickTo(cursor, 'y', { duration: 0.55, ease: 'power3.out' });

    window.addEventListener('mousemove', function(e) { xTo(e.clientX); yTo(e.clientY); });
    window.addEventListener('mousedown', function() { cursor.classList.add('cursor--click'); });
    window.addEventListener('mouseup',   function() { cursor.classList.remove('cursor--click'); });

    document.querySelectorAll('a, button, .gal-cell, .chip, label').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        label.textContent = el.dataset.cursorLabel || '';
        cursor.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', function() {
        cursor.classList.remove('cursor--hover');
        label.textContent = '';
      });
    });

    document.querySelectorAll('[data-magnetic]').forEach(function(el) {
      el.addEventListener('mousemove', function(e) {
        var r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - (r.left + r.width  / 2)) * 0.3,
          y: (e.clientY - (r.top  + r.height / 2)) * 0.3,
          duration: 0.5, ease: 'power3.out'
        });
      });
      el.addEventListener('mouseleave', function() {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     HEADER — hide on scroll down
  ══════════════════════════════════════════════════════════ */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    var last   = 0;
    function update() {
      var curr = window.scrollY;
      header.classList.toggle('header--scrolled', curr > 60);
      if (curr > last && curr > 200) header.classList.add('header--hidden');
      else header.classList.remove('header--hidden');
      last = curr > 0 ? curr : 0;
    }
    if (lenis) lenis.on('scroll', update);
    else window.addEventListener('scroll', update, { passive: true });
  }

  /* ══════════════════════════════════════════════════════════
     SCROLL PROGRESS DOTS
  ══════════════════════════════════════════════════════════ */
  function initScrollDots() {
    var dots     = document.querySelectorAll('.scroll-progress__dot[data-gal-section]');
    var sections = {
      'hero':   document.getElementById('gal-hero'),
      'grid-a': document.getElementById('grid-a'),
      'grid-b': document.getElementById('grid-b'),
      'grid-c': document.getElementById('grid-c'),
      'grid-d': document.getElementById('grid-d'),
    };

    function update() {
      var scroll = window.scrollY + window.innerHeight * 0.3;
      var active = 'hero';
      Object.keys(sections).forEach(function(key) {
        var el = sections[key];
        if (el && scroll >= el.offsetTop) active = key;
      });
      dots.forEach(function(d) {
        d.classList.toggle('active', d.dataset.galSection === active);
      });
    }

    if (lenis) lenis.on('scroll', update);
    else window.addEventListener('scroll', update, { passive: true });

    dots.forEach(function(dot) {
      var key = dot.dataset.galSection;
      dot.addEventListener('click', function() {
        var target = sections[key];
        if (!target) return;
        if (lenis) lenis.scrollTo(target, { duration: 1.6 });
        else target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     HERO INTRO ANIMATION
  ══════════════════════════════════════════════════════════ */
  function initHero() {
    var label   = document.querySelector('.gal-hero__label');
    var lines   = document.querySelectorAll('.gal-hero__headline .line');
    var sub     = document.querySelector('.gal-hero__sub');
    var count   = document.querySelector('.gal-hero__count');
    var hint    = document.querySelector('.gal-hero__scroll-hint');
    var heroBg  = document.querySelector('.gal-hero__bg');

    // Initial state
    gsap.set(lines, { y: '105%', opacity: 0 });

    var tl = gsap.timeline({ delay: 0.2 });
    tl.to(label,  { opacity: 1, duration: 0.6, ease: 'power3.out' }, 0);
    tl.to(lines,  { y: '0%', opacity: 1, duration: 1.0, stagger: 0.12, ease: 'power3.out' }, 0.3);
    tl.to(sub,    { opacity: 1, duration: 0.8, ease: 'power3.out' }, 0.9);
    tl.to(count,  { opacity: 1, duration: 0.7, ease: 'power3.out' }, 1.1);
    tl.to(hint,   { opacity: 1, duration: 0.6, ease: 'power3.out' }, 1.3);

    // Hero bg slow parallax on scroll
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && heroBg) {
      ScrollTrigger.create({
        trigger: document.querySelector('.gal-hero'),
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
        id: 'hero-parallax',
        onUpdate: function(self) {
          gsap.set(heroBg, { y: self.progress * 80 });
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     INTERLUDE REVEALS
  ══════════════════════════════════════════════════════════ */
  function initInterludes() {
    document.querySelectorAll('.gal-interlude').forEach(function(el) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: function() {
          gsap.to(el, { opacity: 1, duration: 0.8, ease: 'power3.out' });
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     BENTO CELL ENTRY + PARALLAX
  ══════════════════════════════════════════════════════════ */
  function initCells() {
    var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var cells = document.querySelectorAll('.gal-cell');

    cells.forEach(function(cell, i) {
      var img = cell.querySelector('.gal-cell__img');

      /* ── Entry animation (stagger within each grid) ── */
      ScrollTrigger.create({
        trigger: cell,
        start: 'top 88%',
        once: true,
        id: 'cell-entry-' + i,
        onEnter: function() {
          gsap.to(cell, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            delay: (i % 5) * 0.07, // stagger within visual row
          });
        }
      });

      /* ── Per-cell parallax on the image ── */
      if (!rm && img) {
        // Each image moves at a slightly different rate based on index
        // Alternating: even cells scroll up, odd cells scroll down
        var direction = (i % 2 === 0) ? -1 : 1;
        var amount    = 25 + (i % 4) * 8; // 25–49px travel

        ScrollTrigger.create({
          trigger: cell,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2 + (i % 3) * 0.3, // slight variation in scrub smoothness
          id: 'cell-para-' + i,
          onUpdate: function(self) {
            var shift = (self.progress - 0.5) * amount * 2 * direction;
            gsap.set(img, { y: shift + 'px' });
          }
        });
      }

      /* ── Cell click → lightbox ── */
      var idx = parseInt(cell.dataset.index, 10) - 1;
      cell.addEventListener('click', function() { openLightbox(idx); });
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('role', 'button');
      cell.setAttribute('aria-label', 'View image ' + (idx + 1));
      cell.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') openLightbox(idx);
      });
    });

    /* Footer CTA reveal */
    var cta = document.querySelector('.gal-footer-cta__headline');
    var btn = document.querySelector('.gal-footer-cta__btn');
    if (cta) {
      ScrollTrigger.create({
        trigger: cta,
        start: 'top 80%',
        once: true,
        onEnter: function() {
          gsap.to(cta, { opacity: 1, y: 0, duration: 1.0, ease: 'power3.out' });
          gsap.to(btn, { opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' });
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     LIGHTBOX
  ══════════════════════════════════════════════════════════ */
  var currentIdx = 0;

  function openLightbox(idx) {
    currentIdx = idx;
    var lb       = document.getElementById('galLightbox');
    var backdrop = document.getElementById('galLbBackdrop');
    var img      = document.getElementById('galLbImg');
    var counter  = document.getElementById('galLbCounter');
    var tag      = document.getElementById('galLbTag');

    var d = IMAGES[idx];
    img.src = d.src;
    img.alt = d.tag + ' — image ' + (idx + 1);
    counter.textContent = pad(idx + 1) + ' / ' + pad(IMAGES.length);
    tag.textContent = d.tag;

    lb.hidden = false;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    gsap.fromTo(lb,  { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power3.out' });
    gsap.fromTo(img, { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power3.out' });

    document.getElementById('galLightboxClose').focus();
  }

  function closeLightbox() {
    var lb       = document.getElementById('galLightbox');
    var backdrop = document.getElementById('galLbBackdrop');
    gsap.to(lb, {
      opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: function() {
        lb.hidden = true;
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  function navigate(dir) {
    currentIdx = (currentIdx + dir + IMAGES.length) % IMAGES.length;
    var img     = document.getElementById('galLbImg');
    var counter = document.getElementById('galLbCounter');
    var tag     = document.getElementById('galLbTag');
    var d       = IMAGES[currentIdx];

    gsap.to(img, { opacity: 0, x: dir * -30, duration: 0.25, ease: 'power3.in', onComplete: function() {
      img.src = d.src;
      img.alt = d.tag + ' — image ' + (currentIdx + 1);
      counter.textContent = pad(currentIdx + 1) + ' / ' + pad(IMAGES.length);
      tag.textContent = d.tag;
      gsap.fromTo(img, { opacity: 0, x: dir * 30 }, { opacity: 1, x: 0, duration: 0.35, ease: 'power3.out' });
    }});
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function initLightbox() {
    document.getElementById('galLightboxClose').addEventListener('click', closeLightbox);
    document.getElementById('galLbPrev').addEventListener('click', function() { navigate(-1); });
    document.getElementById('galLbNext').addEventListener('click', function() { navigate(1); });
    document.getElementById('galLbBackdrop').addEventListener('click', closeLightbox);

    document.addEventListener('keydown', function(e) {
      var lb = document.getElementById('galLightbox');
      if (lb.hidden) return;
      if (e.key === 'Escape')      closeLightbox();
      if (e.key === 'ArrowLeft')   navigate(-1);
      if (e.key === 'ArrowRight')  navigate(1);
    });

    // Touch swipe support on lightbox
    var startX = 0;
    var stage  = document.querySelector('.gal-lightbox__stage');
    if (stage) {
      stage.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
      stage.addEventListener('touchend',   function(e) {
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
      }, { passive: true });
    }
  }

  /* ══════════════════════════════════════════════════════════
     BOOT
  ══════════════════════════════════════════════════════════ */
  function boot() {
    initGrain();
    initLenis();
    initCursor();
    initHeader();
    initScrollDots();
    initHero();
    initInterludes();
    initCells();
    initLightbox();

    // Refresh ST after all images load
    window.addEventListener('load', function() {
      ScrollTrigger.refresh();
    });

    var rt;
    window.addEventListener('resize', function() {
      clearTimeout(rt);
      rt = setTimeout(function() { ScrollTrigger.refresh(); }, 250);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
