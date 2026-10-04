import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(root, 'leaderboard.html'), 'utf8');
const hardSrc = readFileSync(path.join(root, 'static/js/atm_hard_rows.js'), 'utf8');

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
function close(actual, expected, message, tolerance = 1e-10) {
  assert(typeof actual === 'number' && Number.isFinite(actual), `${message}: not finite`);
  assert(Math.abs(actual - expected) <= tolerance, `${message}: ${actual} != ${expected}`);
}
function row(track, harness) {
  const found = track.rows.find(r => r.harness === harness);
  assert(found, `${track.id}: missing ${harness}`);
  return found;
}
function numeric(track, key) {
  return track.rows.filter(r => typeof r[key] === 'number' && Number.isFinite(r[key]) && !(r.noBest || []).includes(key));
}
function validateSplit(name, split, expectedQuestions) {
  assert(split && typeof split === 'object', `${name}: split missing`);
  assert(split.questions === expectedQuestions, `${name}: expected ${expectedQuestions} questions, got ${split.questions}`);
  assert(Array.isArray(split.scores), `${name}: scores must be an array`);
  assert(split.scores.length === expectedQuestions, `${name}: expected ${expectedQuestions} scores, got ${split.scores.length}`);
  assert(split.per_type && typeof split.per_type === 'object', `${name}: per_type summary missing`);

  const byType = new Map();
  let total = 0;
  split.scores.forEach((entry, index) => {
    assert(entry && typeof entry === 'object', `${name}: score ${index} is not an object`);
    assert(typeof entry.qtype === 'string' && entry.qtype.length > 0, `${name}: score ${index} has no qtype`);
    assert(typeof entry.score === 'number' && Number.isFinite(entry.score), `${name}: score ${index} is not finite`);
    assert(entry.score >= 0 && entry.score <= 1, `${name}: score ${index} outside [0, 1]`);
    total += entry.score;
    const bucket = byType.get(entry.qtype) || { count: 0, total: 0 };
    bucket.count++;
    bucket.total += entry.score;
    byType.set(entry.qtype, bucket);
  });

  close(split.qs_percent, (total / expectedQuestions) * 100, `${name}: overall QS`);
  const summaryTypes = Object.keys(split.per_type).sort();
  const scoreTypes = [...byType.keys()].sort();
  assert(JSON.stringify(summaryTypes) === JSON.stringify(scoreTypes), `${name}: per_type keys do not match scores`);
  for (const type of scoreTypes) {
    const expected = byType.get(type);
    const summary = split.per_type[type];
    assert(summary.questions === expected.count, `${name}/${type}: question count mismatch`);
    close(summary.qs_percent, (expected.total / expected.count) * 100, `${name}/${type}: QS`);
  }
  return { questions: expectedQuestions, mean: split.qs_percent, by_type: Object.fromEntries(byType) };
}

const mainMemexa = row(main, 'Memexa v2');
const hardMemexa = row(hard, 'Memexa v2');
const recall = row(main, 'RE-call');
close(mainMemexa.qs, 76.68, 'Main Memexa QS', 1e-9);
close(hardMemexa.qs, 63.57, 'Hard Memexa QS', 1e-9);
assert(mainMemexa.answer_model === 'DeepSeek V4.1', `Main answer model ${mainMemexa.answer_model}`);
assert(hardMemexa.model === 'DeepSeek V4.1', `Hard answer model ${hardMemexa.model}`);
assert(mainMemexa.notes?.answer_model === '\u25c7', 'Main Memexa input disclosure marker missing');
assert(hardMemexa.notes?.model === '\u25c7', 'Hard Memexa input disclosure marker missing');
assert(recall.recall === 90.10, `RE-call Recall@10 must be 90.10, got ${recall.recall}`);
assert(!(recall.noBest || []).includes('recall'), 'RE-call Recall must be eligible after the metric correction');
assert(html.includes('DS-v4.1') && html.includes('source-grounded cards'), 'Memexa v2 input disclosure missing');
assert(html.includes('atmbench-memexa-v2-20261002') && html.includes('docs/memexa-v2-rejudge.json'), 'frozen evidence links missing');
assert(typeof html.match(/\bnotes\s*:/g)?.length === 'number', 'footnote metadata missing from rendered rows');
assert(html.includes('DeepSeek-V4-flash judge') && html.includes('community-run'), 'legacy judge/attribution disclosure missing');

const mainLegacy = main.rows.filter(r => r.harness === 'Memexa');
assert(mainLegacy.length === 2 && mainLegacy.every(r => r.notes?.qs === '*'), 'Main legacy judge footnotes missing');
const hardLegacy = hard.rows.filter(r => ['Memexa', 'A-Mem', 'MemPalace', 'HippoRAG2'].includes(r.harness) && String(r.model || '').includes('DeepSeek-V4-flash'));
assert(hardLegacy.length === 4 && hardLegacy.every(r => r.notes?.qs === '*'), 'Hard legacy judge footnotes missing');

assert(!/\\u2016|‖/.test(html), 'obsolete third-party annotation marker remains');
assert(!html.includes('<strong>◇</strong>'), 'raw diamond glyph should use the HTML entity in static markup');
assert(!main.columns.some(c => c.key === 'total_tokens' || c.key === 'cost_usd'), 'Main cost columns should stay out until comparable submissions exist');
for (const c of hard.columns.filter(c => ['total_tokens', 'cost_usd'].includes(c.key))) assert(c.minBestComparable >= 2, `${c.key} lacks comparable-row threshold`);
assert(numeric(hard, 'total_tokens').length >= 2 && numeric(hard, 'cost_usd').length >= 2, 'Hard cost coverage unexpectedly sparse');
for (const track of [main, hard]) for (const r of track.rows) for (const key of ['qs', 'recall']) if (typeof r[key] === 'number') assert(Number.isFinite(r[key]) && r[key] >= 0 && r[key] <= 100, `${track.id}/${r.harness} ${key} out of range`);

const evidencePath = path.join(root, 'docs', 'memexa-v2-rejudge.json');
assert(existsSync(evidencePath), 'rescored evidence missing');
const summary = JSON.parse(readFileSync(evidencePath, 'utf8'));
assert(summary.schema_version === 1, `unsupported evidence schema ${summary.schema_version}`);
assert(summary.judge_model === 'gpt-5-mini', `judge model must be gpt-5-mini, got ${summary.judge_model}`);
assert(summary.status === 'complete', `judge status must be complete, got ${summary.status}`);
assert(Number.isInteger(summary.judge_calls) && summary.judge_calls > 0, 'judge_calls must be a positive integer');
const mainEvidence = validateSplit('Main evidence', summary.splits?.main, 1013);
const hardEvidence = validateSplit('Hard evidence', summary.splits?.hard, 31);
close(summary.splits.main.qs_percent, 76.68170920885629, 'summary Main QS');
close(summary.splits.hard.qs_percent, 63.56886840757808, 'summary Hard QS');

console.log(JSON.stringify({
  ok: true,
  main_rows: main.rows.length,
  hard_rows: hard.rows.length,
  evidence_questions: mainEvidence.questions + hardEvidence.questions,
  judge_model: summary.judge_model,
  rejudged_qs: { main: mainMemexa.qs, hard: hardMemexa.qs },
  official_recall: recall.recall,
  legacy_disclosures: { main: mainLegacy.length, hard: hardLegacy.length }
}, null, 2));
