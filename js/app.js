/**
 * app.js — the96studio
 * Single-file app (no ES modules). All libs are globals loaded before this.
 * GSAP + ScrollTrigger + Flip + Lenis are all available as window globals.
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════
     GUARD: ensure GSAP loaded
  ══════════════════════════════════════════════════════════ */
  if (typeof gsap === 'undefined') {
    console.error('GSAP not loaded — animations disabled');
    document.getElementById('preloader').style.display = 'none';
    return;
  }

  gsap.registerPlugin(ScrollTrigger, Flip);

  /* ══════════════════════════════════════════════════════════
     PROJECT DATA
  ══════════════════════════════════════════════════════════ */
  var PROJECTS = [
    {
      num: '01', title: 'RESIDENCE', bgClass: 'wc-img-0',
      desc: 'A contemporary concrete villa perched at cliff\'s edge, where the infinity pool\'s surface merges with the horizon. Full CGI package: hero renders, golden-hour stills and dusk sequences.',
    },
    {
      num: '02', title: 'HOSPITALITY', bgClass: 'wc-img-1',
      desc: 'A 240-room waterfront resort rendered before ground broke. Cinematic dawn and dusk sequences captured light across the tower façade, pool terraces and beach pavilions.',
    },
    {
      num: '03', title: 'INTERIOR', bgClass: 'wc-img-2',
      desc: 'A warm, material-driven study for a private penthouse. Fluted oak, honed marble, brushed brass — dialled to perfection in stills and a slow, atmospheric walkthrough.',
    },
    {
      num: '04', title: 'COMMERCIAL', bgClass: 'wc-img-3',
      desc: 'A mixed-use tower anchoring a new city quarter: ground-level street renders, aerial flythrough animation and a real-time interactive model for investor presentations.',
    },
  ];

  /* ══════════════════════════════════════════════════════════
     FILM GRAIN
  ══════════════════════════════════════════════════════════ */
  function initGrain() {
    var canvas = document.getElementById('grainCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var last = 0;
    var FPS = 20;
    var interval = 1000 / FPS;

    function resize() {
      canvas.width  = Math.min(window.innerWidth, 512);
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
        d[i] = d[i+1] = d[i+2] = v;
        d[i+3] = 35;
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
     LENIS SMOOTH SCROLL
  ══════════════════════════════════════════════════════════ */
  var lenis;
  function initLenis() {
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis not available — using native scroll');
      return null;
    }
    lenis = new Lenis({
      duration: 1.4,
      easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothTouch: false,
      touchMultiplier: 2,
    });

    // Drive Lenis with GSAP ticker
    gsap.ticker.add(function(time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // Keep ScrollTrigger in sync
    lenis.on('scroll', function() { ScrollTrigger.update(); });

    return lenis;
  }

  /* ══════════════════════════════════════════════════════════
     CURSOR
  ══════════════════════════════════════════════════════════ */
  function initCursor() {
    if (window.matchMedia('(hover: none)').matches) return;
    var cursor = document.getElementById('cursor');
    var ring   = cursor.querySelector('.cursor__ring');
    var label  = cursor.querySelector('.cursor__label');
    if (!cursor) return;

    var xTo = gsap.quickTo(cursor, 'left', { duration: 0.55, ease: 'power3.out' });
    var yTo = gsap.quickTo(cursor, 'top', { duration: 0.55, ease: 'power3.out' });

    cursor.style.left = `${window.innerWidth / 2}px`;
    cursor.style.top = `${window.innerHeight / 2}px`;

    window.addEventListener('mousemove', function(e) {
      xTo(e.clientX); yTo(e.clientY);
    });

    window.addEventListener('mousedown', function() { cursor.classList.add('cursor--click'); });
    window.addEventListener('mouseup',   function() { cursor.classList.remove('cursor--click'); });

    // Hover detection
    document.querySelectorAll('a, button, .work-card, .service-panel, .chip, label').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        var lbl = el.dataset.cursorLabel || '';
        label.textContent = lbl;
        cursor.classList.add('cursor--hover');
      });
      el.addEventListener('mouseleave', function() {
        cursor.classList.remove('cursor--hover');
        label.textContent = '';
      });
    });

    // Magnetic effect
    document.querySelectorAll('[data-magnetic]').forEach(function(el) {
      el.addEventListener('mousemove', function(e) {
        var r = el.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width  / 2)) * 0.3;
        var dy = (e.clientY - (r.top  + r.height / 2)) * 0.3;
        gsap.to(el, { x: dx, y: dy, duration: 0.5, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', function() {
        gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     HEADER — hide on scroll down, show on scroll up
  ══════════════════════════════════════════════════════════ */
  function initHeader() {
    var header = document.getElementById('siteHeader');
    var last = 0;

    function onScroll() {
      var curr = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle('header--scrolled', curr > 60);
      if (curr > last && curr > 200) {
        header.classList.add('header--hidden');
      } else {
        header.classList.remove('header--hidden');
      }
      last = curr > 0 ? curr : 0;
    }

    if (lenis) {
      lenis.on('scroll', function(e) { onScroll(); });
    } else {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Nav links smooth scroll
    document.querySelectorAll('.nav__link').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        if (lenis) {
          lenis.scrollTo(target, { offset: -80, duration: 1.6 });
        } else {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    // About → reveal scroll
    var aboutBtn = document.getElementById('aboutScrollBtn');
    if (aboutBtn) {
      aboutBtn.addEventListener('click', function() {
        var reveal = document.getElementById('reveal');
        if (lenis) lenis.scrollTo(reveal, { duration: 1.8 });
        else reveal.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     SCROLL PROGRESS DOTS
  ══════════════════════════════════════════════════════════ */
  function initScrollProgress() {
    var dots     = document.querySelectorAll('.scroll-progress__dot');
    var sections = document.querySelectorAll('.section');
    var prog     = document.querySelector('.scroll-progress');
    if (prog) prog.classList.add('visible');

    function update() {
      var scroll = window.scrollY;
      var idx = 0;
      sections.forEach(function(s, i) {
        if (scroll >= s.offsetTop - s.offsetHeight * 0.4) idx = i;
      });
      dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
    }

    if (lenis) {
      lenis.on('scroll', update);
    } else {
      window.addEventListener('scroll', update, { passive: true });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        var target = sections[i];
        if (!target) return;
        if (lenis) lenis.scrollTo(target, { duration: 1.8 });
        else target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     PRELOADER
  ══════════════════════════════════════════════════════════ */
  function initPreloader(onComplete) {
    var preloader = document.getElementById('preloader');
    var fill      = document.getElementById('preloaderFill');
    var wordmark  = document.getElementById('preloaderWordmark');
    var logoMark  = wordmark ? wordmark.querySelector('.preloader__logo-mark') : null;
    var logoPaths = wordmark ? Array.from(wordmark.querySelectorAll('path, polygon')) : [];

    var tl = gsap.timeline({
      onComplete: function() {
        gsap.timeline({
          onComplete: function() {
            preloader.style.display = 'none';
            document.getElementById('siteHeader').style.opacity = '1';
            document.querySelector('.scroll-progress').classList.add('visible');
            onComplete();
          }
        })
        .to(wordmark,  { opacity: 0, y: -12, scale: 1.06, duration: 0.5, ease: 'power3.in' }, 0)
        .to(preloader, { opacity: 0, duration: 0.55, ease: 'power2.inOut' }, 0.15);
      }
    });

    tl.set(wordmark, { opacity: 1 });
    logoPaths.forEach(function(path, index) {
      var length = path.getTotalLength();
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
    tl.to(fill,     { width: '100%', duration: 1.4, ease: 'power2.inOut' }, 0);
    tl.to({},       { duration: 0.4 }); // hold
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 01 — HOME
  ══════════════════════════════════════════════════════════ */
  function initHome() {
    var section    = document.getElementById('home');
    var arcSharp   = section.querySelector('.arc__path--sharp');
    var arcGlowEl  = section.querySelector('.arc__path--glow');
    var arcBloom   = section.querySelector('.arc__bloom');
    var arcSun     = section.querySelector('.arc__sun');
    var arcSunCore = section.querySelector('.arc__sun-core');
    var lines      = section.querySelectorAll('.home__headline .line');
    var subline    = section.querySelector('.home__subline');
    var scrollCue  = section.querySelector('#scrollCue');
    var homeLabel  = section.querySelector('.home-label');
    var bgImg      = section.querySelector('.home__bg--img');
    var bgStars    = section.querySelector('.home__bg--stars');

    // Initial hidden states
    gsap.set(lines,    { y: '105%', opacity: 0 });
    gsap.set(subline,  { opacity: 0 });
    gsap.set(scrollCue,{ opacity: 0 });
    gsap.set(homeLabel,{ opacity: 0 });

    // ── Intro Timeline ──────────────────────────────────────
    var intro = gsap.timeline({ delay: 0.1 });

    // Arc draws
    intro.to([arcSharp, arcGlowEl], {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 2.0,
      ease: 'power2.inOut',
      stagger: 0.08,
    }, 0);

    // Glow/bloom
    intro.to([arcBloom], {
      opacity: 0.8,
      duration: 1.4,
      ease: 'sine.inOut',
    }, 0.6);
    intro.to([arcSun, arcSunCore], {
      opacity: 1,
      duration: 1.0,
      ease: 'sine.inOut',
    }, 1.0);

    // Headline slides up
    intro.to(lines, {
      y: '0%',
      opacity: 1,
      duration: 1.1,
      stagger: 0.13,
      ease: 'power3.out',
    }, 1.3);

    // Subline, scroll cue, label
    intro.to(subline,   { opacity: 1, duration: 0.8 }, 1.9);
    intro.to(scrollCue, { opacity: 1, duration: 0.8 }, 2.1);
    intro.to(homeLabel, { opacity: 1, duration: 0.6 }, 2.2);

    // ── Mouse Move Parallax ──────────────────────────────────
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var bsX = gsap.quickTo(bgStars, 'x', { duration: 1.4, ease: 'power3.out' });
      var bsY = gsap.quickTo(bgStars, 'y', { duration: 1.4, ease: 'power3.out' });
      var biX = gsap.quickTo(bgImg,   'x', { duration: 0.8, ease: 'power3.out' });
      var biY = gsap.quickTo(bgImg,   'y', { duration: 0.8, ease: 'power3.out' });

      section.addEventListener('mousemove', function(e) {
        var nx = (e.clientX / window.innerWidth  - 0.5) * 2;
        var ny = (e.clientY / window.innerHeight - 0.5) * 2;
        bsX(nx * -18); bsY(ny * -12);
        biX(nx * -8);  biY(ny * -5);
      });
    }

    // ── Scroll Parallax: arc rises, headline fades ───────────
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=60%',
        scrub: 1,
        id: 'home-scrub',
        onUpdate: function(self) {
          var p = self.progress;
          gsap.set('.home__arc-svg', { y: -p * 70 });
          gsap.set(bgImg, { scale: 1 + p * 0.12 });
          var fo = Math.max(0, (p - 0.4) / 0.6);
          gsap.set([section.querySelector('.home__content')], { opacity: 1 - fo * 0.9 });
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 02 — ABOUT
  ══════════════════════════════════════════════════════════ */
  function initAbout() {
    var section  = document.getElementById('about');
    var heading  = section.querySelector('.about__heading');
    var lines    = heading.querySelectorAll('.line');
    var body     = section.querySelector('.about__body');
    var divider  = section.querySelector('.about__divider');
    var footer   = section.querySelector('.about__footer');
    var clip     = section.querySelector('.about__image-clip');
    var inner    = section.querySelector('.about__image-inner');

    // Heading reveal
    gsap.set(lines, { y: '100%', opacity: 0 });
    gsap.to(lines, {
      y: '0%', opacity: 1,
      duration: 1.0, stagger: 0.13, ease: 'power3.out',
      scrollTrigger: { trigger: heading, start: 'top 80%', id: 'about-head' }
    });

    // Divider
    gsap.from(divider, {
      scaleX: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: divider, start: 'top 85%' }
    });

    // Body words scrub
    splitWords(body);
    gsap.from(body.querySelectorAll('.word'), {
      opacity: 0.1, stagger: { each: 0.04 }, ease: 'none',
      scrollTrigger: {
        trigger: body, start: 'top 75%', end: 'bottom 40%', scrub: 1.5, id: 'about-words'
      }
    });

    // Footer
    gsap.from(footer, {
      opacity: 0, y: 20, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: footer, start: 'top 90%' }
    });

    // Image clip wipe
    var mm = gsap.matchMedia();
    mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', function() {
      gsap.from(clip, {
        clipPath: 'inset(0 100% 0 0)',
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section, start: 'top 60%', end: 'top 15%', scrub: 1.2, id: 'about-clip'
        }
      });
      gsap.to(inner, {
        scale: 1.0, ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1.5, id: 'about-imgscale'
        }
      });
    });
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 03 — SERVICES
  ══════════════════════════════════════════════════════════ */
  function initServices() {
    var section = document.getElementById('services');
    var panels  = section.querySelectorAll('.service-panel');
    var playBtn = document.getElementById('playBtn');

    // Entry stagger
    gsap.from(panels, {
      y: 90, opacity: 0, duration: 1.2, stagger: 0.14, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 78%', id: 'services-entry' }
    });

    // Per-panel parallax
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var speeds = [0.14, 0.22, 0.10];
      panels.forEach(function(panel, i) {
        var bg = panel.querySelector('.service-panel__bg');
        gsap.to(bg, {
          y: function() { return -(window.innerHeight * speeds[i]); },
          ease: 'none',
          scrollTrigger: {
            trigger: section, start: 'top bottom', end: 'bottom top', scrub: 1, id: 'sp-para-' + i
          }
        });
      });
    }

    // Video modal
    var videoModal = document.getElementById('videoModal');
    var vClose     = document.getElementById('videoModalClose');
    var backdrop   = document.getElementById('modalBackdrop');

    if (playBtn) {
      playBtn.addEventListener('click', function() { openModal(videoModal); });
    }
    vClose.addEventListener('click',   function() { closeModal(videoModal); });
    backdrop.addEventListener('click', function() { closeAllModals(); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeAllModals();
    });
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 04 — WORK (Horizontal Scroll)
  ══════════════════════════════════════════════════════════ */
  function initWork() {
    var section = document.getElementById('work');
    var track   = document.getElementById('workTrack');
    var outer   = document.getElementById('workOuter');
    var cards   = track.querySelectorAll('.work-card');
    var thumbs  = document.querySelectorAll('.work__thumb');

    var mm = gsap.matchMedia();

    mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', function() {
      function getW() {
        return track.scrollWidth - outer.clientWidth;
      }

      var st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: function() { return '+=' + getW(); },
        pin: true,
        pinSpacing: true,
        scrub: 1.2,
        id: 'work-horiz',
        onUpdate: function(self) {
          var x = -(self.progress * getW());
          gsap.set(track, { x: x });
          var idx = Math.min(Math.floor(self.progress * cards.length), cards.length - 1);
          thumbs.forEach(function(t, i) { t.classList.toggle('work__thumb--active', i === idx); });
        },
      });
    });

    // Thumbnail clicks
    thumbs.forEach(function(thumb, i) {
      thumb.addEventListener('click', function() {
        if (lenis) {
          var trackW = track.scrollWidth - outer.clientWidth;
          var progress = i / (cards.length - 1);
          lenis.scrollTo(section.offsetTop + progress * trackW, { duration: 1.4 });
        }
      });
    });

    // Card → project modal
    var pModal  = document.getElementById('projectModal');
    var pClose  = document.getElementById('projectModalClose');
    var pImage  = document.getElementById('projectModalImage');
    var pNum    = document.getElementById('projectModalNum');
    var pTitle  = document.getElementById('projectModalTitle');
    var pDesc   = document.getElementById('projectModalDesc');
    var prevBtn = document.getElementById('prevProject');
    var nextBtn = document.getElementById('nextProject');
    var current = 0;

    function openProject(idx) {
      current = idx;
      var d = PROJECTS[idx];
      pNum.textContent   = d.num;
      pTitle.textContent = d.title;
      pDesc.textContent  = d.desc;
      // Mirror card background
      pImage.className = 'project-modal__image ' + d.bgClass;
      openModal(pModal);
      gsap.from([pNum, pTitle, pDesc], { y: 28, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out' });
    }

    cards.forEach(function(card, i) {
      card.addEventListener('click',   function() { openProject(i); });
      card.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') openProject(i); });
    });

    pClose.addEventListener('click', function() { closeModal(pModal); });
    prevBtn.addEventListener('click', function() { openProject((current - 1 + PROJECTS.length) % PROJECTS.length); });
    nextBtn.addEventListener('click', function() { openProject((current + 1) % PROJECTS.length); });

    document.addEventListener('keydown', function(e) {
      if (!pModal.hidden) {
        if (e.key === 'ArrowRight') nextBtn.click();
        if (e.key === 'ArrowLeft')  prevBtn.click();
      }
    });
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 05 — THE REVEAL (9∞6)
  ══════════════════════════════════════════════════════════ */
  function initReveal() {
    var section   = document.getElementById('reveal');
    var infGlow   = section.querySelector('.inf__path--glow');
    var infSharp  = section.querySelector('.inf__path--sharp');
    var infOrigin = section.querySelector('.inf__origin');
    var digit9    = document.getElementById('digit9');
    var digit6    = document.getElementById('digit6');
    var lines     = section.querySelectorAll('.reveal__headline .line');
    var subline   = section.querySelector('.reveal__subline');
    var wordmark  = section.querySelector('.reveal__wordmark');

    var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Initial states
    gsap.set(digit9,              { opacity: 0, x: -90 });
    gsap.set(digit6,              { opacity: 0, x:  90 });
    gsap.set([infGlow, infSharp], { opacity: 0, strokeDashoffset: 620 });
    gsap.set(infOrigin,           { opacity: 0 });
    gsap.set(lines,               { opacity: 0, y: 22 });
    gsap.set([subline, wordmark], { opacity: 0 });

    if (rm) {
      // Reduced motion: just show everything
      gsap.set([digit9, digit6, subline, wordmark], { opacity: 1, x: 0 });
      gsap.set(lines, { opacity: 1, y: 0 });
      gsap.set([infGlow, infSharp], { opacity: 1, strokeDashoffset: 0 });
      return;
    }

    // Pinned scrub timeline over 220% scroll
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=220%',
        pin: true,
        pinSpacing: true,
        scrub: 2,
        id: 'reveal-pin',
      }
    });

    // 1. Origin glow
    tl.to(infOrigin, { opacity: 1, scale: 3, duration: 0.14, ease: 'sine.inOut' }, 0);

    // 2. Infinity draws
    tl.to(infGlow, { strokeDashoffset: 0, opacity: 1, duration: 0.38, ease: 'power2.inOut' }, 0.10);
    tl.to(infSharp,{ strokeDashoffset: 0, opacity: 1, duration: 0.38, ease: 'power2.inOut' }, 0.14);

    // Origin fades
    tl.to(infOrigin, { opacity: 0, scale: 1, duration: 0.10 }, 0.45);

    // 3. Digits slide in
    tl.to(digit9, { opacity: 1, x: 0, duration: 0.20, ease: 'expo.out' }, 0.40);
    tl.to(digit6, { opacity: 1, x: 0, duration: 0.20, ease: 'expo.out' }, 0.46);

    // 4. Headline
    tl.to(lines, { opacity: 1, y: 0, duration: 0.12, stagger: 0.10, ease: 'power3.out' }, 0.58);

    // 5. Subline + wordmark
    tl.to(subline,  { opacity: 1, duration: 0.10, ease: 'sine.inOut' }, 0.82);
    tl.to(wordmark, { opacity: 1, duration: 0.10, ease: 'sine.inOut' }, 0.91);

    // Looping pulse
    gsap.to(infGlow, { opacity: 0.3, duration: 2.2, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: 6 });
  }

  /* ══════════════════════════════════════════════════════════
     SECTION 06 — CONTACT
  ══════════════════════════════════════════════════════════ */
  function initContact() {
    var section  = document.getElementById('contact');
    var bg       = section.querySelector('.contact__bg');
    var lines    = section.querySelectorAll('.contact__headline .line');
    var divider  = section.querySelector('.contact__divider');
    var startBtn = document.getElementById('startProjectBtn');

    // Headline
    gsap.set(lines, { y: '100%', opacity: 0 });
    gsap.to(lines, {
      y: '0%', opacity: 1, duration: 1.0, stagger: 0.12, ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 80%', id: 'contact-head' }
    });

    gsap.from(divider, {
      scaleX: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: divider, start: 'top 85%' }
    });

    // Ken Burns
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.to(bg, {
        scale: 1.1, x: -25, ease: 'none',
        scrollTrigger: {
          trigger: section, start: 'top bottom', end: 'bottom top', scrub: 2, id: 'contact-kb'
        }
      });
    }

    // Panel
    var panel      = document.getElementById('contactPanel');
    var panelClose = document.getElementById('contactPanelClose');
    var backdrop   = document.getElementById('modalBackdrop');

    startBtn.addEventListener('click', function() {
      panel.hidden = false;
      backdrop.classList.add('active');
      document.body.style.overflow = 'hidden';
      gsap.fromTo(panel, { x: '100%' }, { x: '0%', duration: 0.7, ease: 'power3.out' });
      gsap.from(panel.querySelectorAll('.form-field, .form-chips, .btn-pill--submit'), {
        opacity: 0, y: 18, stagger: 0.07, duration: 0.6, delay: 0.3, ease: 'power3.out'
      });
      panelClose.focus();
    });

    panelClose.addEventListener('click', function() { closePanel(); });

    function closePanel() {
      gsap.to(panel, {
        x: '100%', duration: 0.6, ease: 'power3.in',
        onComplete: function() {
          panel.hidden = true;
          backdrop.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }

    // Esc to close panel
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });

    // Form
    var form    = document.getElementById('projectForm');
    var success = document.getElementById('formSuccess');

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var valid = true;

      var name  = document.getElementById('fieldName');
      var nameE = name.closest('.form-field').querySelector('.form-field__error');
      if (!name.value.trim()) { nameE.textContent = 'Please enter your name.'; valid = false; }
      else nameE.textContent = '';

      var email  = document.getElementById('fieldEmail');
      var emailE = email.closest('.form-field').querySelector('.form-field__error');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
        emailE.textContent = 'Please enter a valid email.'; valid = false;
      } else emailE.textContent = '';

      if (!valid) return;

      var sub = form.querySelector('.btn-pill--submit');
      sub.querySelector('span').textContent = 'SENDING…';
      sub.disabled = true;

      /* TODO: replace with real endpoint — e.g. Formspree, Netlify, EmailJS */
      setTimeout(function() {
        form.querySelectorAll('.form-field, .form-chips').forEach(function(el) { el.style.opacity = '0'; });
        sub.style.display = 'none';
        success.hidden = false;
        gsap.from(success, { opacity: 0, scale: 0.9, duration: 0.5, ease: 'power3.out' });
      }, 1200);
    });
  }

  /* ══════════════════════════════════════════════════════════
     MODAL HELPERS
  ══════════════════════════════════════════════════════════ */
  function openModal(modal) {
    modal.hidden = false;
    document.getElementById('modalBackdrop').classList.add('active');
    document.body.style.overflow = 'hidden';
    gsap.fromTo(modal, { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' });
    var first = modal.querySelector('button, [href], input, [tabindex]');
    if (first) first.focus();
  }

  function closeModal(modal) {
    gsap.to(modal, {
      opacity: 0, scale: 0.96, duration: 0.4, ease: 'power3.in',
      onComplete: function() {
        modal.hidden = true;
        var hasOpen = !document.getElementById('videoModal').hidden ||
                      !document.getElementById('projectModal').hidden ||
                      !document.getElementById('contactPanel').hidden;
        if (!hasOpen) {
          document.getElementById('modalBackdrop').classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  }

  function closeAllModals() {
    ['videoModal','projectModal'].forEach(function(id) {
      var m = document.getElementById(id);
      if (m && !m.hidden) closeModal(m);
    });
    var p = document.getElementById('contactPanel');
    if (p && !p.hidden) {
      gsap.to(p, {
        x: '100%', duration: 0.6, ease: 'power3.in',
        onComplete: function() {
          p.hidden = true;
          document.getElementById('modalBackdrop').classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /* ══════════════════════════════════════════════════════════
     UTIL: split text into <span class="word">
  ══════════════════════════════════════════════════════════ */
  function splitWords(container) {
    container.querySelectorAll('p').forEach(function(p) {
      var words = p.textContent.split(/\s+/).filter(Boolean);
      p.innerHTML = words.map(function(w) { return '<span class="word">' + w + '</span>'; }).join(' ');
    });
  }

  /* ══════════════════════════════════════════════════════════
     BOOTSTRAP
  ══════════════════════════════════════════════════════════ */
  function boot() {
    initGrain();

    lenis = initLenis();

    initCursor();
    initHeader();
    initScrollProgress();

    initPreloader(function() {
      try { initHome(); }     catch(e) { console.error('home:', e); }
      try { initAbout(); }    catch(e) { console.error('about:', e); }
      try { initServices(); } catch(e) { console.error('services:', e); }
      try { initWork(); }     catch(e) { console.error('work:', e); }
      try { initReveal(); }   catch(e) { console.error('reveal:', e); }
      try { initContact(); }  catch(e) { console.error('contact:', e); }

      ScrollTrigger.refresh();
    });

    var rt;
    window.addEventListener('resize', function() {
      clearTimeout(rt);
      rt = setTimeout(function() { ScrollTrigger.refresh(); }, 250);
    });
  }

  // Run immediately (scripts loaded at body end, DOM is ready)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
