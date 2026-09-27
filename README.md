# Jeet / Vishu — Ideas, cooked with care

A complete portfolio with a persistent, scroll-reactive Three.js book as its background. The book opens, turns printed pages, and moves through a warm studio while the full website stays in front: introduction, creative approach, selected projects, process note, and contact.

## Preview

Open `index.html` directly, or serve this directory over HTTP:

```sh
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Interactions

- Scroll the full portfolio; the book and camera follow the story with responsive, damped motion.
- Move the pointer for gentle camera parallax.
- Use the top navigation or mobile menu to jump between chapters.
- Select any project cover to open its live site.
- Hold the process note to fold it; Space or Enter works when focused.
- Switch the studio between light and dark themes.
- Call or message Jeet at **+91 96928 12765**.
- Reduced-motion settings keep the scene still at rest and preserve the full readable website. If WebGL is unavailable, the site remains usable without the canvas.

## Work

- [New Radha Swami](https://newradhaswami.pages.dev/)
- [India Gym](https://indiagym.vercel.app/)
- [Croxy](https://croxy.pages.dev/)
- [WhatsApp](https://wa.me/919692812765) · [Call](tel:+919692812765)

## Implementation

The page uses `app.bundle.js`, a classic script bundle that also works from a local `file://` preview. To rebuild it after editing source, run `npm install` and `npm run build` in this folder. The source modules live in `src/book/` and `src/content/`; Three.js 0.186.1 and its MIT license are included under `vendor/`. Original cover and page artwork is drawn in `src/content/PageArtwork.js`.
