# Jeet / Vishu — The Maker’s Book

A portfolio experienced as one continuous, scroll-driven 3D book. A real-time Three.js scene follows the same volume from cover to colophon: the camera travels around the book, the hardcover opens and closes, and subdivided, printed leaves bend and turn as the reader scrolls in either direction.

## Run locally

This is a static site made of JavaScript modules and locally vendored Three.js files. Serve the `outputs` directory over HTTP instead of opening `index.html` as a `file://` URL:

```sh
cd outputs
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Experience

- Scroll forward or backward through a single 3D book and its page turns.
- Move the pointer for restrained camera parallax. Dust, lighting, and the room respond along the scroll path.
- Choose the light or dark studio palette in the masthead.
- Select the printed portfolio leaves to open the live projects.
- Use the persistent contact link at the final chapter to start a WhatsApp chat; the reading view includes a phone link.
- Reduced-motion preferences and WebGL failures switch to an accessible HTML reading view with all story text, project links, and contact details.

## Portfolio links

- [New Radha Swami](https://newradhaswami.pages.dev/)
- [India Gym](https://indiagym.vercel.app/)
- [Croxy](https://croxy.pages.dev/)
- [WhatsApp](https://wa.me/919692812765) · +91 96928 12765

## Project files

- `index.html` — document shell, navigation, contact, and accessible fallback
- `styles.css` — themes, loader, interface, responsive layout, and reduced-motion styles
- `src/main.js` — scene setup, lifecycle, rendering, and scroll orchestration
- `src/book/` — book geometry, curved page turns, camera, lighting, quality controls, and project hit targets
- `src/content/PageArtwork.js` — original canvas-generated page and cover artwork
- `vendor/` — Three.js 0.186.1 ES modules and the upstream MIT license

Three.js is vendored locally; no runtime package install is needed. The page artwork is original typographic and vector illustration, not screenshots of the linked sites. Google Fonts are an optional stylesheet request; system font fallbacks are provided.
