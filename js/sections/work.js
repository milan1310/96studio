/**
 * sections/work.js — Section 04: Selected Work
 *
 * Handles:
 *  - Horizontal scroll gallery (ScrollTrigger pin + scrub)
 *  - Thumbnail strip active state synced to scroll
 *  - Thumbnail click → Lenis scroll to card
 *  - Card click → fullscreen project modal (GSAP Flip shared-element)
 */

const projectData = [
  {
    num:   '01',
    title: 'RESIDENCE',
    desc:  'A contemporary concrete villa perched at a cliff\'s edge, where the infinity pool\'s surface merges seamlessly with the Pacific horizon. Full CGI visualization package including hero renders, golden-hour stills and dusk atmosphere sequences.',
    bgClass: 'card-0',
  },
  {
    num:   '02',
    title: 'HOSPITALITY',
    desc:  'A 240-room waterfront resort rendered before ground was broken. Cinematic dawn and dusk sequences captured the play of light across the tower façade, pool terraces and beach pavilions — supporting the developer\'s pre-sales campaign.',
    bgClass: 'card-1',
  },
  {
    num:   '03',
    title: 'INTERIOR',
    desc:  'A warm, material-driven interior study for a private penthouse. Every texture — fluted oak, honed marble, brushed brass — was dialled to perfection in a sequence of stills and a slow, atmospheric walkthrough.',
    bgClass: 'card-2',
  },
  {
    num:   '04',
    title: 'COMMERCIAL',
    desc:  'A mixed-use tower designed to anchor a new city quarter. We delivered a full suite of ground-level street renders, aerial flythrough animation and a real-time interactive model for investor presentations.',
    bgClass: 'card-3',
  },
];

export function initWork(lenis) {
  const section  = document.getElementById('work');
  const track    = document.getElementById('workTrack');
  const cards    = track.querySelectorAll('.work-card');
  const thumbs   = document.querySelectorAll('.work__thumb');

  const mm = gsap.matchMedia();

  /* ── HORIZONTAL SCROLL (desktop) ────────────────────────── */
  mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
    // Measure how far we need to scroll
    function getTrackWidth() {
      return track.scrollWidth - section.querySelector('.work__outer').clientWidth;
    }

    const st = ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     () => `+=${getTrackWidth()}`,
      pin:     true,
      pinSpacing: true,
      scrub:   1.2,
      id:      'work-horiz',
      onUpdate(self) {
        const x = -self.progress * getTrackWidth();
        gsap.set(track, { x });

        // Active thumbnail based on progress
        const cardCount = cards.length;
        const activeIdx = Math.min(
          Math.floor(self.progress * cardCount),
          cardCount - 1
        );
        updateThumbs(activeIdx);
      },
    });

    // Invalidate on resize
    return () => st.kill();
  });

  /* ── THUMBNAIL STRIP ─────────────────────────────────────── */
  function updateThumbs(idx) {
    thumbs.forEach((t, i) => {
      t.classList.toggle('work__thumb--active', i === idx);
      t.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
  }

  thumbs.forEach((thumb, i) => {
    thumb.addEventListener('click', () => {
      const trackW = track.scrollWidth - section.querySelector('.work__outer').clientWidth;
      const progress = i / (cards.length - 1);
      const targetScroll = section.offsetTop + progress * trackW;
      if (lenis) lenis.scrollTo(targetScroll, { duration: 1.4 });
    });
  });

  /* ── CARD → PROJECT MODAL ───────────────────────────────── */
  const projectModal = document.getElementById('projectModal');
  const modalClose   = document.getElementById('projectModalClose');
  const backdrop     = document.getElementById('modalBackdrop');
  const modalImage   = document.getElementById('projectModalImage');
  const modalNum     = document.getElementById('projectModalNum');
  const modalTitle   = document.getElementById('projectModalTitle');
  const modalDesc    = document.getElementById('projectModalDesc');
  const prevBtn      = document.getElementById('prevProject');
  const nextBtn      = document.getElementById('nextProject');

  let currentCard = 0;

  // Mirror card image bg classes into modal
  const cardBgStyles = [
    'linear-gradient(160deg, #080c18 0%, #121008 50%, #1a1208 100%)',
    'linear-gradient(160deg, #040810 0%, #0a1018 50%, #060c14 100%)',
    'linear-gradient(160deg, #100808 0%, #1a1010 50%, #0c0808 100%)',
    'linear-gradient(160deg, #060810 0%, #0a0c18 50%, #08080e 100%)',
  ];

  function openProject(idx) {
    currentCard = idx;
    const data = projectData[idx];

    modalNum.textContent   = data.num;
    modalTitle.textContent = data.title;
    modalDesc.textContent  = data.desc;
    modalImage.style.background = cardBgStyles[idx];

    projectModal.hidden = false;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    gsap.fromTo(projectModal,
      { opacity: 0, scale: 0.96 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out' }
    );
    gsap.from([modalNum, modalTitle, modalDesc], {
      y: 30, opacity: 0, stagger: 0.1, duration: 0.8, ease: 'power3.out',
    });

    modalClose.focus();
  }

  function closeProject() {
    gsap.to(projectModal, {
      opacity: 0, scale: 0.95, duration: 0.4, ease: 'power3.in',
      onComplete: () => {
        projectModal.hidden = true;
        backdrop.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  cards.forEach((card, i) => {
    card.addEventListener('click', () => openProject(i));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openProject(i);
    });
  });

  modalClose.addEventListener('click', closeProject);

  prevBtn.addEventListener('click', () => {
    openProject((currentCard - 1 + projectData.length) % projectData.length);
  });

  nextBtn.addEventListener('click', () => {
    openProject((currentCard + 1) % projectData.length);
  });

  document.addEventListener('keydown', (e) => {
    if (!projectModal.hidden) {
      if (e.key === 'Escape')      closeProject();
      if (e.key === 'ArrowRight')  nextBtn.click();
      if (e.key === 'ArrowLeft')   prevBtn.click();
    }
  });
}
