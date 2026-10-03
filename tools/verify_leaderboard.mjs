import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'leaderboard.html'), 'utf8');
const hardSrc = fs.readFileSync(path.join(root, 'static/js/atm_hard_rows.js'), 'utf8');

function extractArray(source, marker) {
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`missing ${marker}`);
  const open = source.indexOf('[', start);
  let depth = 0, quote = null, escaped = false, lineComment = false, blockComment = false;
  for (let i = open; i < source.length; i++) {
    const c = source[i], n = source[i + 1];
    if (lineComment) { if (c === '\n') lineComment = false; continue; }
    if (blockComment) { if (c === '*' && n === '/') { blockComment = false; i++; } continue; }
    if (quote) {
      if (escaped) { escaped = false; continue; }
      if (c === '\\') { escaped = true; continue; }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '/' && n === '/') { lineComment = true; i++; continue; }
    if (c === '/' && n === '*') { blockComment = true; i++; continue; }
    if (c === "'" || c === '"' || c === '`') { quote = c; continue; }
    if (c === '[') depth++;
    if (c === ']' && --depth === 0) return source.slice(open, i + 1);
  }
  throw new Error(`unclosed array ${marker}`);
}

const hardArray = extractArray(hardSrc, 'ATM_HARD_ROWS =');
const tracksArray = extractArray(html, 'const TRACKS =');
const ctx = { ATM_HARD_ROWS: vm.runInNewContext(hardArray) };
const tracks = vm.runInNewContext(`( ${tracksArray} )`, ctx);
const main = tracks.find(t => t.id === 'atm-bench');
const hard = tracks.find(t => t.id === 'atm-bench-hard');
if (!main || !hard) throw new Error('expected Main and Hard tracks');

function assert(condition, message) { if (!condition) throw new Error(message); }
function row(track, harness) { const found = track.rows.find(r => r.harness === harness); assert(found, `${track.id}: missing ${harness}`); return found; }
function numeric(track, key) { return track.rows.filter(r => typeof r[key] === 'number' && Number.isFinite(r[key]) && !(r.noBest || []).includes(key)); }

const mainMemexa = row(main, 'Memexa v2');
const hardMemexa = row(hard, 'Memexa v2');
const recall = row(main, 'RE-call');
assert(Math.abs(mainMemexa.qs - 76.68) < 1e-9, `Main Memexa QS ${mainMemexa.qs}`);
assert(Math.abs(hardMemexa.qs - 63.57) < 1e-9, `Hard Memexa QS ${hardMemexa.qs}`);
assert(mainMemexa.notes.qs === '◇' && hardMemexa.notes.qs === '◇', 'rejudge marker missing');
assert((recall.noBest || []).includes('recall'), 'RE-call Recall must be excluded from best highlight');
assert(recall.recall === 92.89, 'RE-call submitted value must remain visible');
assert(!/\\u2016|‖/.test(html), 'third-party annotation marker remains');
assert(!main.columns.some(c => c.key === 'total_tokens' || c.key === 'cost_usd'), 'Main cost columns should stay out until comparable submissions exist');
for (const c of hard.columns.filter(c => ['total_tokens','cost_usd'].includes(c.key))) assert(c.minBestComparable >= 2, `${c.key} lacks comparable-row threshold`);
assert(numeric(hard, 'total_tokens').length >= 2 && numeric(hard, 'cost_usd').length >= 2, 'Hard cost coverage unexpectedly sparse');
for (const track of [main, hard]) for (const r of track.rows) for (const key of ['qs','recall']) if (typeof r[key] === 'number') assert(r[key] >= 0 && r[key] <= 100, `${track.id}/${r.harness} ${key} out of range`);
assert(html.includes('gpt-5-mini') && html.includes('atmbench-memexa-v2-20261002'), 'rejudge evidence link missing');
const summary = JSON.parse(fs.readFileSync(path.join(root, 'docs', 'memexa-v2-rejudge.json'), 'utf8'));
assert(Math.abs(summary.splits.main.qs_percent - 76.68170920885629) < 1e-10, 'summary Main QS mismatch');
assert(Math.abs(summary.splits.hard.qs_percent - 63.56886840757808) < 1e-10, 'summary Hard QS mismatch');
console.log(JSON.stringify({
  ok: true,
  main_rows: main.rows.length,
  hard_rows: hard.rows.length,
  hard_cost_rows: { total_tokens: numeric(hard, 'total_tokens').length, cost_usd: numeric(hard, 'cost_usd').length },
  rejudged_qs: { main: mainMemexa.qs, hard: hardMemexa.qs },
  recall_excluded: true
}, null, 2));
