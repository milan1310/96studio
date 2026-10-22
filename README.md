# the96studio — Website

A premium, cinematic, scroll-driven single-page website for **the96studio**, an architectural visualization studio. Built with vanilla HTML5, CSS3 and modern JavaScript (ES modules), GSAP 3 + ScrollTrigger, and Lenis smooth scrolling.

---

## Quick Start

```bash
# Serve locally (no build step needed)
npx serve .

# Or with Python
python3 -m http.server 8080

# Or with VS Code Live Server extension
```

Then open `http://localhost:3000` (or `:8080`).

> **Important:** The site uses ES modules (`type="module"`), so it must be served via HTTP — opening `index.html` directly as a `file://` URL will not work.

---

## Project Structure

```
/
├── index.html              # Single page — all 6 sections
├── css/
│   └── styles.css          # Full design system + section styles
├── js/
│   ├── main.js             # Entry point — loads all modules
│   ├── preloader.js        # Master preloader + film grain canvas
│   ├── smooth-scroll.js    # Lenis init + GSAP ticker sync
│   ├── cursor.js           # Custom magnetic ring cursor
│   └── sections/
│       ├── header.js       # Header hide/reveal + scroll-progress dots
│       ├── home.js         # 01 Hero: arc draw, parallax, mouse move
│       ├── about.js        # 02 About: clip-path wipe, word scrub
│       ├── services.js     # 03 Services: panels, parallax, video modal
│       ├── work.js         # 04 Work: horizontal scroll, project modal
│       ├── reveal.js       # 05 The Reveal: 9∞6 SVG draw, pin
│       └── contact.js      # 06 Contact: Ken Burns, form panel
└── assets/
    ├── img/
    │   └── PLACEHOLDER.txt # Image swap guide
    └── video/
        └── PLACEHOLDER.txt # Video swap guide
```

---

## Swapping Images

The supplied architectural renders are wired into the hero, about, services,
selected work, and contact sections from `assets/img/`. To replace them:

1. Export your images as **WebP** (preferred) or AVIF with JPEG fallback.
2. Recommended dimensions: `2400×1600px` minimum for full-bleed, `1200×1800px` for portrait panels.
3. Drop the replacement files in `assets/img/`.
4. In `css/styles.css`, update the relevant selector (for example `.home__bg--img`):

```css
.home__bg--img {
  background-image: url(../assets/img/home-stars.webp);
}
```

5. Run `ScrollTrigger.refresh()` is called automatically after `window.load`, so images will be accounted for.

---

## Adding the Showreel Video

1. Place your video as `assets/video/showreel.mp4` (H.264, 1920×1080, muted, looping).
2. The `<video>` element in `#videoModal` already has the `<source>` pointing to this path.
3. A gradient placeholder is shown until the file exists.

---

## Editing Copy

All copy lives directly in `index.html`. Search for the section comment blocks:

```html
<!-- ═══ 01. HOME / ARRIVAL ═══ -->
<!-- ═══ 02. ABOUT            ═══ -->
<!-- etc. -->
```

---

## Tweaking Animation Timing

| What | Where | Key variable |
|------|-------|-------------|
| Preloader duration | `js/preloader.js` | `duration: 1.4` in the fill tween |
| Hero arc draw speed | `js/sections/home.js` | `duration: 1.8` in `introTL` |
| Lenis scroll feel | `js/smooth-scroll.js` | `duration: 1.4` + easing function |
| Scroll pin lengths | `js/sections/home.js`, `reveal.js`, `work.js` | `end: '+=80%'` / `'+=220%'` |
| Stagger timing | each `sections/*.js` | `stagger: 0.12` values |
| Service panel expand | `css/styles.css` | `.service-panel:hover { flex: 2.2 }` |

---

## Adding a Real Form Backend

In `js/sections/contact.js`, find:

```js
// TODO: Replace this block with your actual form submission.
```

Replace the simulated delay with your preferred service:

**Formspree:**
```js
const res = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  body: JSON.stringify(Object.fromEntries(new FormData(form))),
});
if (!res.ok) throw new Error('Submission failed');
```

**Netlify Forms:** Add `data-netlify="true"` and `name="contact"` to the `<form>` element.

---

## Performance Notes

- Animate only `transform` and `opacity` (GPU-composited, no layout/paint).
- `will-change: transform` is used sparingly on actively animating elements only.
- Images are lazy-loaded via `loading="lazy"` (add to `<img>` tags when real images are used).
- Film grain runs at 24 FPS on a small canvas scaled via CSS to reduce CPU cost.
- All scroll triggers are cleaned up on resize via `ScrollTrigger.refresh()`.
- `prefers-reduced-motion` disables parallax, pinning, grain, and large transforms.

---

## Browser Support

- Chrome / Edge 90+
- Firefox 90+
- Safari 15+
- Mobile: iOS Safari 15+, Chrome Android 90+

Tested with Lighthouse — targets Performance 85+, Accessibility AA.

---

## Credits

- **GSAP 3** — GreenSock Animation Platform (cdnjs)
- **Lenis** — @studio-freight smooth scroll (jsdelivr)
- **Sora / Inter Tight** — Google Fonts
