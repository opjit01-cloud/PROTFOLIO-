# Jeet / Vishu — Ideas, cooked with care

A portfolio told as one continuous, scrollable 3D book. The camera travels down a shared spine while the pages turn through the story, selected work, process note, and contact chapter.

## Open the portfolio

- [New Radha Swami](https://newradhaswami.pages.dev/)
- [India Gym](https://indiagym.vercel.app/)
- [Croxy](https://croxy.pages.dev/)
- Chat on [WhatsApp](https://wa.me/919692812765) or call **+91 96928 12765**.

## Interactions

- Scroll forward or backward to move the camera through the single book and turn its pages.
- Move the pointer for subtle camera parallax; the 3D pages have a quiet idle flutter while the tab is visible.
- Hold the process note to fold it. Use Space or Enter when the note is focused.
- Switch between dark and light themes from the top navigation.
- Use the three project covers to open each live website in a new tab.

The page uses native scrolling and a small, dependency-free WebGL renderer. The story and project links are regular HTML, so they remain readable when WebGL is unavailable. Motion is reduced when the operating system requests reduced motion. The only external runtime request is Google Fonts; system font fallbacks are included.

## Run locally

Open `index.html` in a modern browser. For a local HTTP server, run one of these from the project directory:

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Files

- `index.html` — story chapters, project links, and contact actions
- `styles.css` — responsive layout, themes, and ambient motion
- `app.js` — scroll conductor, WebGL book, navigation, and paper interaction

The project artwork is original CSS illustration; it is not a screenshot of the linked websites. No third-party component package or paid ReactBits code is bundled.
