# ATM-Bench Project Page (skeleton)

This folder is a GitHub Pages–style static site for the ATM-Bench paper.

## Local preview

```bash
cd atmbench.github.io
python -m http.server 8000
```

Then open `http://localhost:8000`.

## What to edit first

- `index.html`: update title/authors, paper/code/data URLs, and the BibTeX.
- `paper/atmbench.pdf`: replace the placeholder PDF with the real paper PDF.
- `static/images/`: add a teaser figure and enable the `og:image` / `twitter:image` meta tags.

## GitHub Pages deployment (recommended)

Two common setups:

1) **Org/user page**: create repo `<ORG>.github.io` and push this folder contents to `main`.
2) **Project page**: create repo (e.g., `ATMBench`) and serve from `/docs` (or `gh-pages` branch).

