/**
 * cursor.js — Custom magnetic ring cursor with label support
 */

export function initCursor() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('cursor');
  const ring   = cursor.querySelector('.cursor__ring');
  const label  = cursor.querySelector('.cursor__label');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  // Animate position properties so the CSS centering transform remains intact.
  const xTo = gsap.quickTo(cursor, 'left', { duration: 0.6, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'top', { duration: 0.6, ease: 'power3.out' });

  cursor.style.left = `${mouseX}px`;
  cursor.style.top = `${mouseY}px`;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    xTo(mouseX);
    yTo(mouseY);
  });

  // Click flash
  window.addEventListener('mousedown', () => cursor.classList.add('cursor--click'));
  window.addEventListener('mouseup',   () => cursor.classList.remove('cursor--click'));

  // Hover states — scan all interactive elements
  function bindHovers() {
    const hoverEls = document.querySelectorAll(
      'a, button, [data-cursor-label], .work-card, .service-panel, .chip, label'
    );

    hoverEls.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        const lbl = el.dataset.cursorLabel || '';
        label.textContent = lbl;
        cursor.classList.add('cursor--hover');
      });

      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--hover');
        label.textContent = '';
      });
    });

    // Work cards get "VIEW"
    document.querySelectorAll('.work-card').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        label.textContent = 'VIEW';
        cursor.classList.add('cursor--hover');
      });
    });
  }

  bindHovers();

  // Magnetic effect — elements with data-magnetic
  const magneticEls = document.querySelectorAll('[data-magnetic]');

  magneticEls.forEach((el) => {
    const strength = parseFloat(el.dataset.magneticStrength) || 0.35;

    el.addEventListener('mousemove', (e) => {
      const rect   = el.getBoundingClientRect();
      const cx     = rect.left + rect.width / 2;
      const cy     = rect.top + rect.height / 2;
      const dx     = (e.clientX - cx) * strength;
      const dy     = (e.clientY - cy) * strength;

      gsap.to(el, {
        x: dx, y: dy,
        duration: 0.5,
        ease: 'power3.out'
      });
    });

    el.addEventListener('mouseleave', () => {
      gsap.to(el, {
        x: 0, y: 0,
        duration: 0.7,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}
