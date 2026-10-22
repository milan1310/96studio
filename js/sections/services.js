/**
 * sections/services.js — Section 03: Services
 *
 * Handles:
 *  - Panel entry: rise from bottom with stagger
 *  - Per-panel image parallax at different speeds
 *  - Play button → video lightbox modal
 *  - Panel expand on hover (CSS + JS)
 */

export function initServices(lenis) {
  const section  = document.getElementById('services');
  const panels   = section.querySelectorAll('.service-panel');
  const playBtn  = document.getElementById('playBtn');

  /* ── ENTRY ANIMATION ─────────────────────────────────────── */
  gsap.from(panels, {
    y: 80,
    opacity: 0,
    duration: 1.2,
    stagger: 0.14,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
      id: 'services-entry',
    }
  });

  /* ── IMAGE PARALLAX (different speed per panel) ──────────── */
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    panels.forEach((panel, i) => {
      const bg = panel.querySelector('.service-panel__bg');
      const speeds = [0.15, 0.22, 0.12]; // Different parallax depths

      gsap.to(bg, {
        y: () => -(window.innerHeight * speeds[i]),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1,
          id: `services-parallax-${i}`,
        }
      });
    });
  }

  /* ── VIDEO LIGHTBOX ─────────────────────────────────────── */
  const videoModal  = document.getElementById('videoModal');
  const modalClose  = document.getElementById('videoModalClose');
  const backdrop    = document.getElementById('modalBackdrop');
  const modalVideo  = document.getElementById('modalVideo');
  const placeholder = videoModal.querySelector('.modal__video-placeholder');

  function openVideoModal() {
    videoModal.hidden = false;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Check if real video source exists
    if (modalVideo.querySelector('source')?.src) {
      placeholder.style.display = 'none';
      modalVideo.play().catch(() => {
        placeholder.style.display = 'flex';
      });
    }

    // Animate in
    gsap.fromTo(videoModal, 
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
    );

    // Focus trap
    modalClose.focus();
  }

  function closeVideoModal() {
    gsap.to(videoModal, {
      opacity: 0,
      scale: 0.95,
      duration: 0.4,
      ease: 'power3.in',
      onComplete: () => {
        videoModal.hidden = true;
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
        modalVideo.pause();
        modalVideo.currentTime = 0;
      }
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', openVideoModal);
  }

  modalClose.addEventListener('click', closeVideoModal);
  backdrop.addEventListener('click', closeVideoModal);

  // Keyboard: Esc closes, focus trap
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !videoModal.hidden) {
      closeVideoModal();
    }
    if (e.key === 'Tab' && !videoModal.hidden) {
      trapFocus(e, videoModal);
    }
  });
}

/** Basic focus trap for modal */
function trapFocus(e, modal) {
  const focusables = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  const first = focusables[0];
  const last  = focusables[focusables.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}
