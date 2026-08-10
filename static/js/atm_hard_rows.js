/* ATM-Bench-Hard leaderboard rows — the single copy, shared by leaderboard.html
   (which spends it as the Hard track's `rows`) and index.html (which hands it
   to PricePerfFull for the cost-vs-score chart).

   It lives out here for one reason: the full scatter plots these rows rather
   than keeping a dataset of its own, so both pages have to read the same array
   or the chart and the table drift apart. Everything else on the site stays
   inline per the usual convention.

   Contributor flow is unchanged — append one line to the array below. Field
   reference and per-type conventions are in AGENTS.md; the renderer, columns
   and footnote markers still live in leaderboard.html.

   Row order here is cosmetic (grouped by system family for editing); the table
   sorts itself by the primary column at render time. */

var ATM_HARD_ROWS = [
  // --- Oracle (paper Table 4, Hard column — one row per answer model, harness "-") ---
  { type: 'Oracle', harness: '-', model: 'Qwen3-VL-2B-Instruct', qs: 34.10, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Qwen3-VL-8B-Instruct', qs: 40.14, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Gemini 2.5 Flash',     qs: 55.60, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Gemini 2.5 Pro',       qs: 64.30, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Claude Sonnet 4.5',    qs: 61.90, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Claude Opus 4.5',      qs: 62.70, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'GPT-5',                qs: 66.05, recall: null, total_tokens: null },
  // GPT-5.2 / GPT-5.4 / GPT-5 all raw oracle, 31q hard, reasoning=medium (ATMBench repo) — added 2026-06-06
  { type: 'Oracle', harness: '-', model: 'GPT-5.2',              qs: 50.41, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'GPT-5.4',              qs: 65.19, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'GPT-5.5',              qs: 71.49, recall: null, total_tokens: null },
  // Gemini 3.x raw oracle, 31q hard (gpt-5-mini judge) — added 2026-06-06
  { type: 'Oracle', harness: '-', model: 'Gemini 3 Flash',       qs: 60.10, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Gemini 3 Pro',         qs: 52.10, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Gemini 3.1 Pro',       qs: 55.40, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Gemini 3.1 Flash Lite', qs: 45.70, recall: null, total_tokens: null },
  // open-weight answerer oracle, 31q hard — RAW for multimodal, SGM for text-only MiMo V2.5 Pro — added 2026-06-06
  { type: 'Oracle', harness: '-', model: 'MiniMax M3',           qs: 61.80, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'MiMo V2.5',            qs: 52.10, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'MiMo V2.5 Pro',        qs: 32.70, recall: null, total_tokens: null },
  { type: 'Oracle', harness: '-', model: 'Qwen3.6-27B',          qs: 62.30, recall: null, total_tokens: null },

  // --- Agent (project README; no recall reported by the harness) ---
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 5 (medium)',   qs: 51.37, recall: null, total_tokens: 3.18,  cost_usd:  5.84, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 5 (high)',     qs: 53.36, recall: null, total_tokens: 3.54,  cost_usd:  7.29, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 5 (xhigh)',    qs: 58.37, recall: null, total_tokens: 6.09,  cost_usd: 12.33, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 5 (max)',      qs: 55.96, recall: null, total_tokens: 8.87,  cost_usd: 17.22, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Fable 5 (low)',     qs: 46.77, recall: null, total_tokens: 1.95,  cost_usd:  7.93, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Fable 5 (medium)',  qs: 51.69, recall: null, total_tokens: 2.24,  cost_usd: 10.13, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Fable 5 (high)',    qs: 52.55, recall: null, total_tokens: 2.55,  cost_usd: 11.95, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Fable 5 (xhigh)',   qs: 56.42, recall: null, total_tokens: 2.90,  cost_usd: 15.06, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 4.7 (max)',     qs: 46.60, recall: null, total_tokens: 6.93,  cost_usd:  9.58, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 4.8',           qs: 41.63, recall: null, total_tokens: 4.42,  cost_usd:  7.49, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 4.7 (xhigh)',   qs: 39.50, recall: null, total_tokens: 5.03,  cost_usd:  7.70, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 4.6',           qs: 33.80, recall: null, total_tokens: 4.93,  cost_usd:  8.01, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Claude Opus 4.7 (w/o SGM)', qs: 23.10, recall: null, total_tokens: 16.95, cost_usd: 19.84, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Sol (low)',          qs: 41.68, recall: null, total_tokens: 5.06,  cost_usd:  9.53, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Sol (medium)',       qs: 58.76, recall: null, total_tokens: 7.52,  cost_usd: 12.52, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Sol (high)',         qs: 51.54, recall: null, total_tokens: 10.19, cost_usd: 14.79, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Sol (xhigh)',        qs: 43.98, recall: null, total_tokens: 11.49, cost_usd: 17.79, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Sol (max)',          qs: 48.30, recall: null, total_tokens: 17.60, cost_usd: 23.90, link: 'https://github.com/openai/codex' },
  // Luna/Terra costs re-computed at OpenAI's reduced rates (Tokdash v2.0.11, verified
  // 2026-07-31). Tokens and QS are unchanged from the original submission.
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Luna (low)',         qs: 31.57, recall: null, total_tokens: 7.02,  cost_usd:  0.45, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Luna (medium)',      qs: 34.92, recall: null, total_tokens: 8.34,  cost_usd:  0.53, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Luna (high)',        qs: 41.70, recall: null, total_tokens: 13.96, cost_usd:  0.78, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Luna (xhigh)',       qs: 42.39, recall: null, total_tokens: 18.82, cost_usd:  1.01, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Luna (max)',         qs: 28.25, recall: null, total_tokens: 28.82, cost_usd:  1.44, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Terra (low)',        qs: 43.46, recall: null, total_tokens: 6.16,  cost_usd:  4.08, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Terra (medium)',     qs: 28.22, recall: null, total_tokens: 6.71,  cost_usd:  4.32, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Terra (high)',       qs: 38.61, recall: null, total_tokens: 7.83,  cost_usd:  5.01, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Terra (xhigh)',      qs: 40.95, recall: null, total_tokens: 9.36,  cost_usd:  5.96, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.6 Terra (max)',        qs: 44.47, recall: null, total_tokens: 17.21, cost_usd:  9.92, link: 'https://github.com/openai/codex', notes: { cost_usd: '¶' } },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.5 (xhigh)',     qs: 48.08, recall: null, total_tokens: 22.89, cost_usd: 39.74, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.5 (medium)',    qs: 41.40, recall: null, total_tokens: 16.14, cost_usd: 27.17, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.2',             qs: 39.70, recall: null, total_tokens: 15.46, cost_usd: null,  link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.4',             qs: 29.60, recall: null, total_tokens: 14.29, cost_usd:  9.33, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Codex',       model: 'GPT-5.2 (w/o SGM)',   qs: 16.30, recall: null, total_tokens: 22.23, cost_usd:  9.22, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Kimi Code',   model: 'Kimi K3-256k (low)',         qs: 48.48, recall: null, total_tokens: 5.39,  cost_usd:  3.68, link: 'https://github.com/MoonshotAI/kimi-code' },
  { type: 'Agent',  harness: 'Kimi Code',   model: 'Kimi K3-256k (high)',        qs: 52.53, recall: null, total_tokens: 7.94,  cost_usd:  5.54, link: 'https://github.com/MoonshotAI/kimi-code' },
  { type: 'Agent',  harness: 'Kimi Code',   model: 'Kimi K3-256k (max)',         qs: 48.47, recall: null, total_tokens: 7.97,  cost_usd:  5.83, link: 'https://github.com/MoonshotAI/kimi-code' },
  { type: 'Agent',  harness: 'Kimi Code',   model: 'Kimi K3 (max)',              qs: 51.35, recall: null, total_tokens: 6.34,  cost_usd:  4.90, link: 'https://github.com/MoonshotAI/kimi-code' },
  { type: 'Agent',  harness: 'Kimi Code',   model: 'Kimi K2.7',                  qs: 49.10, recall: null, total_tokens: 14.12, cost_usd:  3.53, link: 'https://github.com/MoonshotAI/kimi-code' },
  { type: 'Agent',  harness: 'Pi',          model: 'GLM-5.1',             qs: 38.80, recall: null, total_tokens: 8.17,  cost_usd:  4.33, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'Kimi K2.5',           qs: 37.80, recall: null, total_tokens: 9.92,  cost_usd:  2.67, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'MiMo V2.5',           qs: 36.10, recall: null, total_tokens: 18.23, cost_usd:  2.06, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'MiMo V2.5 (w/o SGM)', qs: 18.60, recall: null, total_tokens: 60.46, cost_usd:  5.74, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'MiniMax M3',                qs: 43.23, recall: null, total_tokens: 15.60, cost_usd:  3.39, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'Qwen3.6-27B',               qs: 38.53, recall: null, total_tokens: 7.15,  cost_usd:  2.45, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'Qwen3.6-27B (w/o SGM)',     qs: 16.59, recall: null, total_tokens: 20.84, cost_usd:  6.29, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'MiMo V2.5 Pro',             qs: 31.95, recall: null, total_tokens: 14.57, cost_usd:  4.98, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'MiMo V2.5 Pro (w/o SGM)',   qs: 14.63, recall: null, total_tokens: 49.95, cost_usd: 13.97, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'GLM-5',               qs: 27.00, recall: null, total_tokens: 16.89, cost_usd: 14.92, link: 'https://github.com/sst/opencode' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'Qwen3.5-397B-A17B',   qs: 24.50, recall: null, total_tokens: 12.06, cost_usd:  4.93, link: 'https://github.com/sst/opencode' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'Kimi K2.5',           qs: 30.30, recall: null, total_tokens: 8.46,  cost_usd:  1.81, link: 'https://github.com/sst/opencode' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'Kimi K2.5 (w/o SGM)', qs:  6.50, recall: null, total_tokens: 21.40, cost_usd:  6.40, link: 'https://github.com/sst/opencode' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'MiniMax M2.5',        qs: 22.90, recall: null, total_tokens: 14.5,  cost_usd:  4.43, link: 'https://github.com/sst/opencode' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'MiniMax M2.7',        qs: 27.80, recall: null, total_tokens: 13.48, cost_usd:  1.36, link: 'https://github.com/sst/opencode' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'MiniMax M3',                 qs: 47.31, recall: null, total_tokens: 16.30, cost_usd:  2.83, link: 'https://github.com/sst/opencode' },
  // gpt-5-mini judge (like every other Agent row) — this is the answer model, not the judge
  { type: 'Agent',  harness: 'OpenCode',    model: 'DeepSeek V4 Flash (0731)',   qs: 38.28, recall: null, total_tokens: 12.54, cost_usd:  0.26, link: 'https://github.com/sst/opencode', notes: { cost_usd: '§' } },
  // --- DeepSeek's own metered API, same weights as the OpenCode row above —
  //     added 2026-08-06/07. Codex goes over the Responses API (which DeepSeek
  //     shipped shortly before), Claude Code the Anthropic-compatible path, Pi
  //     the OpenAI-compatible one. Separate endpoints and serving stacks, so
  //     these are distinct runs rather than repeats.
  //     All four ran at DeepSeek's server default reasoning effort.
  //     They span 4.6 QS points while tokens span 7x: the harness barely moves
  //     the score and dominates the bill — Codex spends 1.29M tokens a question
  //     against Pi's 185K to buy +4.6.
  //     Costs are list-price recomputations from the token counters, not the
  //     figure Claude Code reports for itself — see the Volcano Engine note.
  //     Claude Code answered 27 of 31 and still scores over 31, as the board's
  //     convention requires, so 39.57 is a floor and not an estimate.
  { type: 'Agent',  harness: 'Codex',       model: 'DeepSeek V4 Flash (0731)',   qs: 41.53, recall: null, total_tokens: 39.87, cost_usd:  0.46, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Claude Code', model: 'DeepSeek V4 Flash (0731)',   qs: 39.57, recall: null, total_tokens:  7.89, cost_usd:  0.18, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Pi',          model: 'DeepSeek V4 Flash (0731)',   qs: 36.94, recall: null, total_tokens:  5.74, cost_usd:  0.13, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'OpenClaw 🦞', model: 'Kimi K2.5',           qs: 25.40, recall: null, total_tokens: 9.63,  cost_usd:  2.37 },

  // --- Volcano Engine coding plan, four harnesses across three models
  //     (SGM, gpt-5-mini judge) — added 2026-08-06, Codex 2026-08-07.
  //     Cross-harness reading: Codex leads GLM-5.2, Claude Code leads the rest.
  //     GLM-5.2 is the widest harness spread on the board for one model
  //     (23.4 to 49.4) — the same weights on the same endpoint.
  //     Omitted deliberately: OpenCode GLM-5.2 (8 of 30 answers were truncation
  //     artefacts, not answers) and Pi LongCat (23 of 31 died on an exhausted
  //     account, leaving 8 real answers).
  //     Three runs are short of 31 questions and score over 31 regardless, as
  //     the board's convention requires: Doubao is 29/31 on Claude Code and
  //     30/31 on OpenCode, LongCat 30/31. Their scores are floors, not
  //     estimates.
  //     Costs are list-price recomputations from the token counters, as every
  //     other row is. NOT the figure each runner reports for itself: Claude Code
  //     prices its own runs at Anthropic rates because the endpoint is
  //     Anthropic-compatible, which overstates these three roughly 4x
  //     ($12.52 rather than $3.29 for GLM-5.2).
  { type: 'Agent',  harness: 'Codex',       model: 'GLM-5.2',               qs: 49.43, recall: null, total_tokens:  9.62, cost_usd:  5.25, link: 'https://github.com/openai/codex' },
  { type: 'Agent',  harness: 'Claude Code', model: 'GLM-5.2',               qs: 47.69, recall: null, total_tokens:  4.96, cost_usd:  3.29, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Kimi K2.7 Code',        qs: 47.04, recall: null, total_tokens: 10.66, cost_usd:  3.00, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Claude Code', model: 'Doubao Seed 2.1 Turbo', qs: 46.22, recall: null, total_tokens:  9.29, cost_usd:  1.63, link: 'https://github.com/anthropics/claude-code' },
  { type: 'Agent',  harness: 'Pi',          model: 'GLM-5.2',               qs: 45.08, recall: null, total_tokens:  5.04, cost_usd:  3.02, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'Kimi K2.7 Code',        qs: 39.22, recall: null, total_tokens: 17.09, cost_usd:  4.44, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'Pi',          model: 'Doubao Seed 2.1 Turbo', qs: 36.83, recall: null, total_tokens:  4.91, cost_usd:  0.97, link: 'https://github.com/earendil-works/pi' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'Kimi K2.7 Code',        qs: 37.78, recall: null, total_tokens: 32.88, cost_usd:  6.81, link: 'https://github.com/sst/opencode' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'Doubao Seed 2.1 Turbo', qs: 37.69, recall: null, total_tokens:  9.77, cost_usd:  1.69, link: 'https://github.com/sst/opencode' },
  { type: 'Agent',  harness: 'OpenCode',    model: 'LongCat 2.0',           qs: 28.22, recall: null, total_tokens: 31.17, cost_usd:  0.72, link: 'https://github.com/sst/opencode' },

  // --- Antigravity (Google's `agy` CLI, run under Harbor), SGM, gpt-5-mini
  //     judge — added 2026-08-06. Effort is baked into the model id, so each
  //     row is its own model string rather than a tier suffix on one ladder.
  //     The 3.5 Flash ladder completed 2026-08-10 when `low` finished; all
  //     three tiers are 31/31.
  //     Note these cost an order of magnitude more than the Volcano rows above:
  //     the Antigravity path re-reads a large cached context every turn, which
  //     shows up as 20-120M total tokens per 31-question run.
  //     THE 3.5 FLASH LADDER IS BACKWARDS IN COST. Score falls monotonically
  //     from high to low, but low costs twice what high does and medium costs
  //     most of all. Cache reads carry the bill — 79.9M of low's 93.8M tokens
  //     against 44.2M of high's 49.5M — so the cheaper reasoning tier plans
  //     retrieval worse and re-reads the same context more often. Generation is
  //     never the expense: output is 0.66M tokens on low.
  //     `low`'s 31 trials come from two attempts (11 on 2026-08-04 at $1.59/q,
  //     20 re-run on 2026-08-10 at $1.02/q after the first attempt lost 19
  //     trials to quota exhaustion). Each trial is counted once, so the total is
  //     a real 31-trial figure, but it blends two runs at different unit costs.
  { type: 'Agent',  harness: 'Antigravity', model: 'Gemini 3.5 Flash (high)',   qs: 55.84, recall: null, total_tokens:  49.53, cost_usd: 19.09, link: 'https://antigravity.google' },
  { type: 'Agent',  harness: 'Antigravity', model: 'Gemini 3.5 Flash (medium)', qs: 54.43, recall: null, total_tokens: 121.96, cost_usd: 50.18, link: 'https://antigravity.google' },
  { type: 'Agent',  harness: 'Antigravity', model: 'Gemini 3.5 Flash (low)',    qs: 50.37, recall: null, total_tokens:  93.77, cost_usd: 37.82, link: 'https://antigravity.google' },
  { type: 'Agent',  harness: 'Antigravity', model: 'Gemini 3.6 Flash (medium)', qs: 48.15, recall: null, total_tokens:  54.30, cost_usd: 19.96, link: 'https://antigravity.google' },
  { type: 'Agent',  harness: 'Antigravity', model: 'Gemini 3.6 Flash (high)',   qs: 44.73, recall: null, total_tokens:  56.57, cost_usd: 21.02, link: 'https://antigravity.google' },
  { type: 'Agent',  harness: 'Antigravity', model: 'Gemini 3.1 Pro (high)',     qs: 43.65, recall: null, total_tokens:  54.73, cost_usd: 28.14, link: 'https://antigravity.google' },
  { type: 'Agent',  harness: 'Antigravity', model: 'Gemini 3.6 Flash (low)',    qs: 42.77, recall: null, total_tokens:  27.44, cost_usd: 13.59, link: 'https://antigravity.google' },
  { type: 'Agent',  harness: 'Antigravity', model: 'Gemini 3.1 Pro (low)',      qs: 40.26, recall: null, total_tokens:  21.29, cost_usd: 13.41, link: 'https://antigravity.google' },

  // --- Memory (one row per system; values from latest project README) ---
  { type: 'Memory', harness: 'A-Mem',     model: 'Qwen3-VL-8B-Instruct', qs:  9.90, recall: 31.70, total_tokens: null, link: 'https://github.com/WujiangXu/A-mem' },
  { type: 'Memory', harness: 'Mem0',      model: 'Qwen3-VL-8B-Instruct', qs:  9.20, recall: 23.70, total_tokens: null, link: 'https://github.com/mem0ai/mem0' },
  { type: 'Memory', harness: 'MemoryOS',  model: 'Qwen3-VL-8B-Instruct', qs: 13.70, recall: 32.70, total_tokens: null, link: 'https://github.com/BAI-LAB/MemoryOS' },
  { type: 'Memory', harness: 'MemPalace', model: 'Qwen3-VL-8B-Instruct', qs:  9.70, recall: 28.30, total_tokens: null, link: 'https://github.com/MemPalace/mempalace' },
  { type: 'Memory', harness: 'SimpleMem', model: 'Qwen3-VL-8B-Instruct', qs:  3.20, recall:  7.00, total_tokens: null, link: 'https://github.com/aiming-lab/SimpleMem' },

  // --- Memexa (community PR) + same-LLM (DeepSeek-V4-flash) re-runs of baselines. QS* = flash judge (not gpt-5-mini); see legend ---
  { type: 'Memory', harness: 'Memexa',    model: 'DeepSeek-V4-flash (mem+ans) · Qwen3.6-27B captions', qs: 47.85, recall: 44.67, total_tokens: 34.30, cost_usd: 3.84, link: 'https://github.com/labazhou2024/memexa', notes: { qs: '*', recall: '†', total_tokens: '‡', cost_usd: '‡' } },
  { type: 'Memory', harness: 'A-Mem',     model: 'DeepSeek-V4-flash (mem+ans)', qs: 16.71, recall: 38.52, total_tokens: null, link: 'https://github.com/WujiangXu/A-mem', notes: { qs: '*' } },
  { type: 'Memory', harness: 'MemPalace', model: 'DeepSeek-V4-flash (mem+ans)', qs: 13.64, recall: 28.87, total_tokens: null, link: 'https://github.com/MemPalace/mempalace', notes: { qs: '*' } },

  // --- RAG (one row per system) ---
  { type: 'RAG', harness: 'HippoRAG2', model: 'Qwen3-VL-8B-Instruct', qs:  9.40, recall: 31.90, total_tokens: null, link: 'https://github.com/OSU-NLP-Group/HippoRAG' },
  { type: 'RAG', harness: 'ATM-RAG',   model: 'Qwen3-VL-8B-Instruct', qs: 13.80, recall: 30.40, total_tokens: null, link: 'https://github.com/JingbiaoMei/ATM-Bench' },
  { type: 'RAG', harness: 'HippoRAG2', model: 'DeepSeek-V4-flash (mem+ans)', qs: 12.27, recall: 32.16, total_tokens: null, link: 'https://github.com/OSU-NLP-Group/HippoRAG', notes: { qs: '*' } }
];
