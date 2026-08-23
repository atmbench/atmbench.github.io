/* ATM-Bench-Hard harness comparison — data for static/js/harness_perf.js.

   GENERATED from PersonalMemoryQA/result_numbers/price_performance_plot/claude/
   harness_v1/chart_data.json by gen_site_rows.py in that directory. Edit there
   and regenerate; do not hand-patch, or the site and the working chart will
   disagree.

   Every point on a line is the SAME model weights, the same 31 ATM-Bench-Hard
   questions, the same SGM memory and the same gpt-5-mini judge — only the
   coding agent changes. The vertical spread of a line is therefore the harness
   effect, with the model held fixed. This is the inverse of the price-vs-
   performance chart above it, where the model varies and each vendor's own
   agent is used.

   The chart plots `cost` against `qs` and identifies the harness by marker
   SHAPE. Two fields survive from the categorical layout it replaced and are no
   longer read by harness_perf.js — keep them, since the source page in
   PersonalMemoryQA still draws that panel and the two must not diverge:
   `col` is the harness's column index, shared across every model so a column
   reads top-to-bottom as one agent, and `rel` (`costVsCheapest` upstream) is
   what that harness spent relative to the cheapest agent on the SAME model.
   `rel` still appears in the tooltip: absolute cost is not comparable between a
   $0.13 DeepSeek run and a $5.25 GLM one, but "burned 3.5x what the cheapest
   agent did on identical weights" is.

   `excluded` and `omitted` are not drawn. They are the record of runs measured
   but kept off the chart, so removals stay visible to whoever edits this next.
   Built 2026-08-23T13:06:52+01:00. Judge gpt-5-mini-2025-08-07, dataset atm-hard-20260307. */

var HARNESS_DATA = {
  harnesses: [
    { agent: 'claude_code', label: 'Claude Code', shape: 'square', native: false },
    { agent: 'codex', label: 'Codex', shape: 'circle', native: false },
    { agent: 'pi', label: 'Pi', shape: 'triangle', native: false },
    { agent: 'opencode', label: 'OpenCode', shape: 'diamond', native: false },
    { agent: 'kimi_code', label: 'Kimi For Coding', shape: 'star', native: true },
  ],
  models: [
    { key: 'm3', label: 'MiniMax-M3', spread: 27.64, points: [
      { harness: 'Claude Code', col: 0, shape: 'square', qs: 19.67, cost: 1.527, tokensPerQ: 0.142, rel: 1, gap: 27.64, answered: 30, effort: null },
      { harness: 'Codex', col: 1, shape: 'circle', qs: 40.01, cost: 4.337, tokensPerQ: 1.05, rel: 2.84, gap: 7.3, answered: 30, effort: 'medium' },
      { harness: 'Pi', col: 2, shape: 'triangle', qs: 43.23, cost: 3.394, tokensPerQ: 0.503, rel: 2.22, gap: 4.08, answered: 29, effort: null },
      { harness: 'OpenCode', col: 3, shape: 'diamond', qs: 47.31, cost: 2.834, tokensPerQ: 0.526, rel: 1.86, gap: 0, answered: 31, effort: null },
    ] },
    { key: 'doubao', label: 'Doubao Seed 2.1 Turbo', spread: 13.22, points: [
      { harness: 'Claude Code', col: 0, shape: 'square', qs: 46.22, cost: 1.628, tokensPerQ: 0.3, rel: 1.68, gap: 0, answered: 29, effort: null },
      { harness: 'Codex', col: 1, shape: 'circle', qs: 32.99, cost: 0.992, tokensPerQ: 0.142, rel: 1.02, gap: 13.22, answered: 31, effort: 'medium' },
      { harness: 'Pi', col: 2, shape: 'triangle', qs: 36.83, cost: 0.971, tokensPerQ: 0.159, rel: 1, gap: 9.39, answered: 31, effort: null },
      { harness: 'OpenCode', col: 3, shape: 'diamond', qs: 37.69, cost: 1.691, tokensPerQ: 0.315, rel: 1.74, gap: 8.53, answered: 30, effort: null },
    ] },
    { key: 'k27', label: 'Kimi K2.7 Code', spread: 13.31, points: [
      { harness: 'Claude Code', col: 0, shape: 'square', qs: 47.04, cost: 2.996, tokensPerQ: 0.344, rel: 1, gap: 2.06, answered: 31, effort: null },
      { harness: 'Codex', col: 1, shape: 'circle', qs: 35.79, cost: 4.567, tokensPerQ: 0.595, rel: 1.52, gap: 13.31, answered: 31, effort: null },
      { harness: 'Pi', col: 2, shape: 'triangle', qs: 39.22, cost: 4.444, tokensPerQ: 0.551, rel: 1.48, gap: 9.88, answered: 31, effort: null },
      { harness: 'OpenCode', col: 3, shape: 'diamond', qs: 37.78, cost: 6.81, tokensPerQ: 1.061, rel: 2.27, gap: 11.31, answered: 31, effort: null },
      { harness: 'Kimi For Coding', col: 4, shape: 'star', qs: 49.1, cost: 3.534, tokensPerQ: 0.455, rel: 1.18, gap: 0, answered: 31, effort: null },
    ] },
    { key: 'dsv4', label: 'DeepSeek V4 Flash 0731', spread: 4.59, points: [
      { harness: 'Claude Code', col: 0, shape: 'square', qs: 39.57, cost: 0.184, tokensPerQ: 0.254, rel: 1.41, gap: 1.96, answered: 27, effort: null },
      { harness: 'Codex', col: 1, shape: 'circle', qs: 41.53, cost: 0.457, tokensPerQ: 1.286, rel: 3.48, gap: 0, answered: 31, effort: 'high' },
      { harness: 'Pi', col: 2, shape: 'triangle', qs: 36.94, cost: 0.131, tokensPerQ: 0.185, rel: 1, gap: 4.59, answered: 31, effort: null },
      { harness: 'OpenCode', col: 3, shape: 'diamond', qs: 38.28, cost: 0.265, tokensPerQ: 0.404, rel: 2.02, gap: 3.26, answered: 31, effort: null },
    ] },
    { key: 'dsv4pro', label: 'DeepSeek V4 Pro 0813', spread: 10.08, points: [
      { harness: 'Claude Code', col: 0, shape: 'square', qs: 43.06, cost: 0.612, tokensPerQ: 0.22, rel: 1.4, gap: 2.86, answered: 30, effort: null },
      { harness: 'Codex', col: 1, shape: 'circle', qs: 45.32, cost: 1.125, tokensPerQ: 1.592, rel: 2.57, gap: 0.6, answered: 31, effort: 'high' },
      { harness: 'Pi', col: 2, shape: 'triangle', qs: 45.92, cost: 0.438, tokensPerQ: 0.258, rel: 1, gap: 0, answered: 31, effort: null },
      { harness: 'OpenCode', col: 3, shape: 'diamond', qs: 35.84, cost: 0.742, tokensPerQ: 0.406, rel: 1.69, gap: 10.08, answered: 31, effort: null },
    ] },
    { key: 'glm52', label: 'GLM-5.2', spread: 4.36, points: [
      { harness: 'Claude Code', col: 0, shape: 'square', qs: 47.69, cost: 3.288, tokensPerQ: 0.16, rel: 1.09, gap: 1.74, answered: 31, effort: null },
      { harness: 'Codex', col: 1, shape: 'circle', qs: 49.43, cost: 5.255, tokensPerQ: 0.31, rel: 1.74, gap: 0, answered: 31, effort: 'medium' },
      { harness: 'Pi', col: 2, shape: 'triangle', qs: 45.08, cost: 3.02, tokensPerQ: 0.163, rel: 1, gap: 4.36, answered: 31, effort: null },
    ] },
    { key: 'qwen38', label: 'Qwen3.8-27B', spread: 14.5, points: [
      { harness: 'Claude Code', col: 0, shape: 'square', qs: 35.41, cost: 2.248, tokensPerQ: 0.163, rel: 1.3, gap: 14.5, answered: 31, effort: 'xhigh' },
      { harness: 'Codex', col: 1, shape: 'circle', qs: 43.97, cost: 3.149, tokensPerQ: 0.945, rel: 1.81, gap: 5.94, answered: 31, effort: 'xhigh' },
      { harness: 'Pi', col: 2, shape: 'triangle', qs: 49.9, cost: 1.895, tokensPerQ: 0.352, rel: 1.09, gap: 0, answered: 31, effort: null },
      { harness: 'OpenCode', col: 3, shape: 'diamond', qs: 47.49, cost: 1.734, tokensPerQ: 0.332, rel: 1, gap: 2.41, answered: 31, effort: null },
    ] },
  ],
  scorecard: [
    { harness: 'Claude Code', shape: 'square', n: 7, wins: 1, median: 2.06, mean: 7.25, worst: 27.64, rel: 1.27 },
    { harness: 'Pi', shape: 'triangle', n: 7, wins: 2, median: 4.36, mean: 4.61, worst: 9.88, rel: 1.26 },
    { harness: 'OpenCode', shape: 'diamond', n: 6, wins: 1, median: 5.89, mean: 5.93, worst: 11.31, rel: 1.76, meanIfKept: 8.81, nIfKept: 7 },
    { harness: 'Codex', shape: 'circle', n: 7, wins: 2, median: 5.94, mean: 5.77, worst: 13.31, rel: 2.14 },
    { harness: 'Kimi For Coding', shape: 'star', n: 1, wins: 1, median: 0, mean: 0, worst: 0, rel: 1.18 },
  ],
  excluded: [
    { model: 'GLM-5.2', harness: 'OpenCode', qs: 23.36, cost: 3.38, why: 'GLM-5.2 on OpenCode scored 23.4%, 21.7 points below the next-worst harness on these weights and far outside the 4-13 point spread every other model shows' },
  ],
  omitted: [
    { run: 'codex/deepseek_deepseek-v4-flash-low', qs: 48.43, cost: 0.32, why: 'DeepSeek V4 Flash at Codex effort low (48.4%, $0.32)' },
    { run: 'codex/deepseek_deepseek-v4-flash-max', qs: 35.33, cost: 0.35, why: 'DeepSeek V4 Flash at Codex effort max (35.3%, $0.35)' },
    { run: 'pi/pi5-litellm_deepseek-v4-flash', qs: 24.13, cost: 3.33, why: 'DeepSeek V4 Flash through a LiteLLM proxy (24.1%, $1.05)' },
  ],
};
