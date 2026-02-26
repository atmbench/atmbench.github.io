# ATM-Bench open-source release checklist (draft)

This is a practical checklist to go from the current working/dev repo to a clean public release (code + data + project page).

## 0) Decide public identities

- [ ] Decide GitHub **org/user** name (e.g., `atmbench`, `atm-bench`, or an existing lab/org).
- [ ] Decide canonical naming:
  - Paper/benchmark name: `ATM-Bench`
  - Code repo: `ATMBench`
  - Project page repo: `atmbench/atmbench.github.io` (preferred)
  - HF dataset repo: `atmbench/atm-bench` (or similar)

## 1) GitHub org setup

- [ ] Create org, set avatar + description.
- [ ] Add maintainers, enable 2FA requirement if appropriate.
- [ ] Decide default branch (`main`) and issue/PR templates policy.

## 2) Code repo (public) hardening

Context:
- Working/dev repo: `/mnt/h/Developing/Research/PersonalAssistant/PersonalMemoryQA`
- Planned open-source repo: `/mnt/h/Developing/Research/PersonalAssistant/ATMBench`

Checklist:
- [ ] Ensure **no personal data** is committed (images/videos/emails/derived artifacts).
- [ ] Ensure **no secrets** are committed:
  - Prefer env vars (`OPENAI_API_KEY`, `VLLM_API_KEY`, etc.)
  - Prefer local key dir `.api_keys/` (gitignored) for new code
- [ ] Add/confirm:
  - [ ] `LICENSE` (code)
  - [ ] `README.md` with exact run commands
  - [ ] `CITATION.cff` (and/or `CITATION.bib`)
  - [ ] `requirements.txt` or `pyproject.toml` + lock strategy (decide)
  - [ ] Minimal reproducible scripts under `scripts/`
- [ ] Make repo runnable from root with root-relative paths.
- [ ] Add a small “smoke test” script that runs without GPU / without API calls (when possible).
- [ ] Add a release tag (e.g., `v1.0.0`) when ready.

## 3) Data release (Hugging Face)

- [ ] Decide dataset license (may differ from code license).
- [ ] Verify privacy statement and redaction/anonymization is sufficient.
- [ ] Create HF dataset repo + dataset card:
  - [ ] Task definition
  - [ ] Data schema (fields)
  - [ ] Splits (train/val/test + any “hard” set)
  - [ ] Intended use + limitations + ethics
- [ ] Upload data artifacts + checksums.
- [ ] Provide a small `load_dataset(...)` example and baseline scripts that run on the released format.

## 4) Project page (this repo)

- [ ] Update placeholders in `index.html`:
  - [ ] `https://atmbench.github.io/`
  - [ ] arXiv / venue URL
  - [ ] GitHub repo URL (`https://github.com/atmbench/ATMBench`)
  - [ ] HF dataset URL (`https://huggingface.co/datasets/atmbench/atm-bench`)
  - [ ] Authors + affiliations
  - [ ] Final BibTeX
- [ ] Replace `paper/atmbench.pdf` with the final PDF.
- [ ] Add teaser figure under `static/images/` and enable `og:image`.
- [ ] Deploy via GitHub Pages.

## 5) “Day-of-release” sanity checks

- [ ] Clone the public repos into a fresh directory and run the README commands end-to-end.
- [ ] Confirm the project page loads with correct links (paper/code/data).
- [ ] Confirm HF dataset loads and basic stats match the paper.
