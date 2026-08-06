<div align="center">

# ATM-Bench — Project Page & Live Leaderboard

Static site for **ATM-Bench: According to Me — Long-Term Personalized Referential Memory QA**.

[![Project Page](https://img.shields.io/badge/🌐_Live-atmbench.github.io-1f6feb.svg)](https://atmbench.github.io/)
[![Live Leaderboard](https://img.shields.io/badge/🏆_Leaderboard-Live-orange.svg)](https://atmbench.github.io/leaderboard.html)
[![arXiv](https://img.shields.io/badge/arXiv-2603.01990-b31b1b.svg)](https://arxiv.org/abs/2603.01990)
[![Code](https://img.shields.io/badge/💻_Code-ATM--Bench-181717.svg)](https://github.com/JingbiaoMei/ATM-Bench)
[![Dataset](https://img.shields.io/badge/🤗_Dataset-ATM--Bench-FFD21E.svg)](https://huggingface.co/datasets/Jingbiao/ATM-Bench)

</div>

This repository hosts the **landing page** and the **community leaderboard** for ATM-Bench
(Mei, Chen, Yang, Hou, Li, Byrne — University of Cambridge). It is a hand-written static
site — **no build step, no dependencies, no generator**. Every page is self-contained and
can be opened directly as a file.

> The **benchmark code, harness, and canonical results** live in the companion repo
> [`JingbiaoMei/ATM-Bench`](https://github.com/JingbiaoMei/ATM-Bench). That repo's README is
> the source of truth for scores; this site visualizes them.

## Pages

| Page | What it is |
|------|------------|
| [`index.html`](index.html) | Paper landing page — hero + demo video, the four "memory puzzle" cards, benchmark comparison, method figure, and BibTeX. Bilingual (EN / 中文). |
| [`leaderboard.html`](leaderboard.html) | Live leaderboard with three tabs (**ATM-Bench**, **ATM-Bench-Hard**, **NIAH-100**), sortable columns, and system-type filters. |

## Repository structure

```
atmbench.github.io/
├── index.html             # landing page (Academic Project Page / Nerfies template)
├── leaderboard.html       # leaderboard — inline CSS + data + vanilla JS, no build
├── .nojekyll              # serve files as-is (skip Jekyll processing)
├── paper/                 # drop the camera-ready PDF here, link it from index.html
└── static/
    ├── css/               # Bulma, Font Awesome, Academicons + page-local index.css
    ├── js/                # Bulma carousel/slider + index.js
    ├── images/            # teaser (ATM-Bench-Demo.png), method (ATM-Method.png), favicon
    ├── videos/            # demo videos (EN / CN)
    └── pdfs/              # supplementary PDFs
```

## Local preview

No toolchain required — just serve the folder:

```bash
cd atmbench.github.io
python3 -m http.server 8765
# open http://localhost:8765/  and  http://localhost:8765/leaderboard.html
```

Opening the `file://` URL also works; only Google Fonts and Analytics fail silently under
`file://` and neither affects layout.

## Editing the site

- **Text / authors / links / BibTeX** → `index.html`.
- **Teaser image & social preview** → `static/images/`, wired through the `og:image` /
  `twitter:image` meta tags.
- **Paper PDF** → place it in `paper/` and update the link in `index.html`.
- **Styling** → reuse the CSS custom properties in the `:root` block (warm beige page with
  `rust / blue / green / gold / plum` accents). Add new tokens only when a genuinely new
  color is needed.
- **Bilingual copy** → the site is EN/中文. Any user-visible string uses a `data-i18n`
  (or `data-i18n-html`) attribute and a matching key in the `translations` object; add both
  languages when you add text. Browser language is auto-detected on load.

## Updating the leaderboard

All leaderboard data is a plain JavaScript array (`TRACKS`) near the bottom of
`leaderboard.html` — adding a result is a **one-line append** to the relevant `rows` list.

Each row's `type` is one of `Oracle`, `Agent`, `Memory`, `RAG`, `NIAH`, which drives its
color pill. The first four also appear as filter chips on the ATM-Bench / ATM-Bench-Hard
boards; the NIAH board has no filter chips.

```js
// ATM-Bench-Hard, append to that track's rows:
{ type: 'Agent', harness: 'Claude Code', model: 'Claude Opus 4.8',
  qs: 41.60, recall: null, total_tokens: 4.42,
  link: 'https://github.com/anthropics/claude-code' },
```

Conventions:

- **Use verbatim numbers** from the source (paper table or the
  [ATM-Bench](https://github.com/JingbiaoMei/ATM-Bench) README). Unknown fields are `null`
  → the renderer prints `-` and excludes them from sorting and "best-in-column" highlights.
- **QS** (Question Score) and **Recall@10** are percentages (two decimals, e.g. `41.60`).
  **Total tokens** are stored in millions (`4.42` → `4.42M`, ATM-Bench-Hard track). **Index
  time** is in hours and exists only on the ATM-Bench (first) track.
- Set `link` to the system's canonical repo/paper to make the harness name clickable.
- The headline view filters **Oracle off** by default (it is a no-retrieval upper bound);
  click the Oracle chip to include it.

## Deployment

Served by **GitHub Pages** from the `main` branch of the org user-site repo
`atmbench/atmbench.github.io` → `https://atmbench.github.io`. Pushing to `main` publishes.
`.nojekyll` keeps Pages from running Jekyll, so the static files are served exactly as
committed.

> Note: `*.github.io` subdomains (e.g. `leaderboard.atmbench.github.io`) are **not** supported
> by GitHub Pages without a custom domain — the leaderboard lives at
> `atmbench.github.io/leaderboard.html`.

## Citation

```bibtex
@article{mei2026atm,
  title={According to Me: Long-Term Personalized Referential Memory QA},
  author={Mei, Jingbiao and Chen, Jinghong and Yang, Guangyu and Hou, Xinyu and Li, Margaret and Byrne, Bill},
  journal={arXiv preprint arXiv:2603.01990},
  year={2026},
  url={https://arxiv.org/abs/2603.01990},
  doi={10.48550/arXiv.2603.01990}
}
```

## Links

- 🌐 Project page — https://atmbench.github.io/
- 🏆 Live leaderboard — https://atmbench.github.io/leaderboard.html
- 📄 Paper — https://arxiv.org/abs/2603.01990
- 💻 Benchmark code — https://github.com/JingbiaoMei/ATM-Bench
- 🤗 Dataset — https://huggingface.co/datasets/Jingbiao/ATM-Bench

## Credits

The landing page builds on the [Academic Project Page Template](https://github.com/eliahuhorwitz/Academic-project-page-template)
(itself based on [Nerfies](https://nerfies.github.io/)), released under
[CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/).
