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
  { type: 'Agent',  harness: 'OpenClaw 🦞', model: 'Kimi K2.5',           qs: 25.40, recall: null, total_tokens: 9.63,  cost_usd:  2.37 },

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
