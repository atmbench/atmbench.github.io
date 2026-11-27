import { readFileSync, existsSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(path.join(root, 'leaderboard.html'), 'utf8');
const hardSrc = readFileSync(path.join(root, 'static/js/atm_hard_rows.js'), 'utf8');

// Every script the pages run must at least parse. One syntax error in an inline
// <script> stops the whole block, so every table renders empty. The checks below
// evaluate only the row arrays, so they cannot see an error elsewhere in the block.
function compileOrThrow(source, label, firstLine = 1) {
  try {
    new vm.Script(source, { filename: label });
  } catch (err) {
    const line = Number((err.stack.match(new RegExp(`${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:(\\d+)`)) || [])[1] || 0);
    const where = line ? ` at line ${firstLine + line - 1}` : '';
    throw new Error(`${label}: ${err.name}: ${err.message}${where}`);
  }
}
for (const page of ['leaderboard.html', 'index.html']) {
  const source = readFileSync(path.join(root, page), 'utf8');
  const inline = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let match, count = 0;
  while ((match = inline.exec(source))) {
    count++;
    const firstLine = source.slice(0, match.index + match[0].indexOf('>') + 1).split('\n').length;
    compileOrThrow(match[1], `${page} inline script ${count}`, firstLine);
  }
}
for (const file of readdirSync(path.join(root, 'static/js'))) {
  if (file.endsWith('.js') && !file.endsWith('.min.js')) {
    compileOrThrow(readFileSync(path.join(root, 'static/js', file), 'utf8'), `static/js/${file}`);
  }
}
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
  for (const [metric, field, depth] of [['recall_at_10', 'retrieved_top10', 10], ['recall_at_50', 'retrieved_top50', 50], ['recall_at_64', 'retrieved_top64', 64]]) {
    if (typeof split[metric] !== 'number') continue;
    for (const entry of split.scores) {
      const ids = entry[field];
      assert(Array.isArray(ids) && ids.length >= depth, `${name}: ${metric} is reported but ${field} has fewer than ${depth} ids (${entry.id})`);
    }
  }
  return { questions: expectedQuestions, mean: split.qs_percent, by_type: Object.fromEntries(byType) };
}

function validateDeliveryStats(name, split) {
  const declared = ['delivered_k_min', 'delivered_k_max', 'delivered_k_median', 'delivered_k_mean'];
  if (!declared.some(key => typeof split[key] === 'number')) return;
  const delivered = split.scores.map((entry, index) => {
    assert(typeof entry.delivered_k === 'number' && Number.isFinite(entry.delivered_k), `${name}: score ${index} missing delivered_k`);
    return entry.delivered_k;
  });
  const sorted = [...delivered].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  const mean = delivered.reduce((sum, k) => sum + k, 0) / delivered.length;
  close(split.delivered_k_min, sorted[0], `${name}: delivered_k_min`);
  close(split.delivered_k_max, sorted[sorted.length - 1], `${name}: delivered_k_max`);
  close(split.delivered_k_median, median, `${name}: delivered_k_median`);
  close(split.delivered_k_mean, mean, `${name}: delivered_k_mean`, 0.005);
}

function validateJudgeUsage(name, block) {
  if (!block.judge_usage_log) return;
  const logPath = path.join(root, block.judge_usage_log);
  assert(existsSync(logPath), `${name}: judge usage log missing`);
  let prompt = 0, cached = 0, completion = 0;
  const loggedIds = new Set();
  for (const line of readFileSync(logPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    const record = JSON.parse(line);
    const usage = record.usage;
    prompt += usage.prompt_tokens;
    cached += usage.prompt_tokens_details.cached_tokens;
    completion += usage.completion_tokens;
    if (record.id) {
      assert(!loggedIds.has(record.id), `${name}: duplicate judge call for ${record.id}`);
      loggedIds.add(record.id);
    }
  }
  close(block.judge_input_tokens, prompt, `${name}: judge input tokens`);
  close(block.judge_cached_input_tokens, cached, `${name}: judge cached input tokens`);
  close(block.judge_output_tokens, completion, `${name}: judge output tokens`);
  close(block.judge_total_tokens, prompt + completion, `${name}: judge total tokens`);
  close(block.judge_cost_usd, (cached * 0.025 + (prompt - cached) * 0.25 + completion * 2.00) / 1e6, `${name}: judge cost usd`, 5e-7);
  const verdictPath = logPath.replace(/judge-requests-/, 'official-judge-verdicts-');
  assert(existsSync(verdictPath), `${name}: published verdicts missing`);
  const verdictIds = new Set();
  for (const line of readFileSync(verdictPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    verdictIds.add(JSON.parse(line).id);
  }
  for (const id of verdictIds) assert(loggedIds.has(id), `${name}: verdict ${id} has no logged judge call`);
  for (const id of loggedIds) assert(verdictIds.has(id), `${name}: judge call ${id} has no published verdict`);
  assert(block.judge_calls === loggedIds.size, `${name}: judge_calls ${block.judge_calls} != logged calls ${loggedIds.size}`);
  assert(block.judge_calls === verdictIds.size, `${name}: judge_calls ${block.judge_calls} != verdicts ${verdictIds.size}`);
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

const rmEvidencePath = path.join(root, 'docs', 'rolling-memory-zhao.json');
assert(existsSync(rmEvidencePath), 'Rolling-Memory evidence missing');
const rmSummary = JSON.parse(readFileSync(rmEvidencePath, 'utf8'));
assert(rmSummary.schema_version === 1, `unsupported Rolling-Memory evidence schema ${rmSummary.schema_version}`);
assert(rmSummary.judge_model === 'gpt-5-mini', `Rolling-Memory judge model must be gpt-5-mini, got ${rmSummary.judge_model}`);
assert(rmSummary.status === 'complete', `Rolling-Memory judge status must be complete, got ${rmSummary.status}`);
validateSplit('Rolling-Memory Main evidence', rmSummary.splits?.main, 1013);
validateSplit('Rolling-Memory Hard evidence', rmSummary.splits?.hard, 31);
validateDeliveryStats('Rolling-Memory Main evidence', rmSummary.splits.main);
validateDeliveryStats('Rolling-Memory Hard evidence', rmSummary.splits.hard);
validateJudgeUsage('Rolling-Memory Main evidence', rmSummary.protocol.main_token_usage);
validateJudgeUsage('Rolling-Memory Hard evidence', rmSummary.protocol.hard_token_usage);
close(rmSummary.splits.main.qs_percent, 73.54627932120529, 'Rolling-Memory Main QS');
close(rmSummary.splits.hard.qs_percent, 39.46304328182886, 'Rolling-Memory Hard QS');

const rmQwenEvidencePath = path.join(root, 'docs', 'rolling-memory-zhao-qwen3vl8b.json');
assert(existsSync(rmQwenEvidencePath), 'Rolling-Memory Qwen3-VL-8B evidence missing');
const rmQwenSummary = JSON.parse(readFileSync(rmQwenEvidencePath, 'utf8'));
assert(rmQwenSummary.schema_version === 1, `unsupported Rolling-Memory Qwen evidence schema ${rmQwenSummary.schema_version}`);
assert(rmQwenSummary.judge_model === 'gpt-5-mini', `Rolling-Memory Qwen judge model must be gpt-5-mini, got ${rmQwenSummary.judge_model}`);
assert(rmQwenSummary.status === 'complete', `Rolling-Memory Qwen judge status must be complete, got ${rmQwenSummary.status}`);
validateSplit('Rolling-Memory Qwen Main evidence', rmQwenSummary.splits?.main, 1013);
validateSplit('Rolling-Memory Qwen Hard evidence', rmQwenSummary.splits?.hard, 31);
validateDeliveryStats('Rolling-Memory Qwen Main evidence', rmQwenSummary.splits.main);
validateDeliveryStats('Rolling-Memory Qwen Hard evidence', rmQwenSummary.splits.hard);
validateJudgeUsage('Rolling-Memory Qwen Main evidence', rmQwenSummary.protocol.main_token_usage);
validateJudgeUsage('Rolling-Memory Qwen Hard evidence', rmQwenSummary.protocol.hard_token_usage);
close(rmQwenSummary.splits.main.qs_percent, 58.29047063499186, 'Rolling-Memory Qwen Main QS');
close(rmQwenSummary.splits.hard.qs_percent, 16.62826420890937, 'Rolling-Memory Qwen Hard QS');

const mainRMRows = main.rows.filter(r => r.harness === 'Rolling-Memory');
const hardRMRows = hard.rows.filter(r => r.harness === 'Rolling-Memory');
assert(mainRMRows.length === 2 && hardRMRows.length === 2, 'Expected two Rolling-Memory rows (DeepSeek V4.1 Flash and Qwen3-VL-8B-Instruct)');
const mainRM = mainRMRows.find(r => r.answer_model === 'DeepSeek V4.1 Flash');
const hardRM = hardRMRows.find(r => r.model === 'DeepSeek V4.1 Flash');
const mainRMQwen = mainRMRows.find(r => r.answer_model === 'Qwen3-VL-8B-Instruct');
const hardRMQwen = hardRMRows.find(r => r.model === 'Qwen3-VL-8B-Instruct');
assert(mainRM && hardRM && mainRMQwen && hardRMQwen, 'Rolling-Memory rows by answer model missing');
close(mainRM.qs, 73.55, 'Main Rolling-Memory (DeepSeek) QS', 1e-9);
close(mainRM.recall, 82.77, 'Main Rolling-Memory (DeepSeek) Recall@10', 1e-9);
close(hardRM.qs, 39.46, 'Hard Rolling-Memory (DeepSeek) QS', 1e-9);
close(hardRM.recall, 52.43, 'Hard Rolling-Memory (DeepSeek) Recall@10', 1e-9);
close(hardRM.total_tokens, 1.006764, 'Hard Rolling-Memory (DeepSeek) Total Tokens (M)', 1e-9);
close(hardRM.cost_usd, 0.040793, 'Hard Rolling-Memory (DeepSeek) Cost (USD)', 1e-9);
close(mainRMQwen.qs, 58.29, 'Main Rolling-Memory (Qwen3-VL-8B) QS', 1e-9);
close(mainRMQwen.recall, 82.77, 'Main Rolling-Memory (Qwen3-VL-8B) Recall@10', 1e-9);
close(hardRMQwen.qs, 16.63, 'Hard Rolling-Memory (Qwen3-VL-8B) QS', 1e-9);
close(hardRMQwen.recall, 52.43, 'Hard Rolling-Memory (Qwen3-VL-8B) Recall@10', 1e-9);
close(hardRMQwen.total_tokens, 0.206849, 'Hard Rolling-Memory (Qwen3-VL-8B) Total Tokens (M)', 1e-9);
close(hardRMQwen.cost_usd, 0.038053, 'Hard Rolling-Memory (Qwen3-VL-8B) Cost (USD)', 1e-9);
assert(mainRM.notes?.qs === '\u00a4' && mainRMQwen.notes?.qs === '\u00a4', 'Main Rolling-Memory footnote marker missing');
assert(hardRM.notes?.qs === '\u00a4' && hardRM.notes?.cost_usd === '\u00a4', 'Hard Rolling-Memory footnote marker missing');
assert(html.includes('Rolling-Memory rows') || html.includes('Rolling-Memory 两行说明'), 'Rolling-Memory footnote text missing');
assert(html.includes('docs/rolling-memory-zhao.json') && html.includes('docs/rolling-memory-zhao-qwen3vl8b.json'), 'Rolling-Memory evidence links missing');
const sensememRow = row(main, 'SenseMem');
const sensemem = JSON.parse(readFileSync(path.join(root, 'docs/sensemem-main.json'), 'utf8'));
const sensememMain = sensemem.splits.main;
const sensememEvidence = validateSplit('SenseMem Main', sensememMain, 1013);
const enrichedInputs = JSON.parse(readFileSync(path.join(root, 'docs', sensemem.protocol.source_description_artifact), 'utf8'));
assert(enrichedInputs.run_id === sensemem.protocol.run_id && enrichedInputs.dataset_revision === sensemem.protocol.dataset_revision, 'SenseMem enriched-input run identity mismatch');
assert(enrichedInputs.files.length === 2, 'SenseMem enriched-input manifest must contain the image and video files');
for (const file of enrichedInputs.files) {
  assert(file.sha256 === sensemem.protocol.input_sha256[file.path], `SenseMem enriched-input hash mismatch: ${file.path}`);
  assert(file.captions_with_additional_description + file.captions_unchanged_from_release === file.records, `SenseMem caption coverage mismatch: ${file.path}`);
}
assert(sensemem.protocol.judge_model === 'gpt-5-mini' && sensemem.protocol.judge_status === 'complete', 'SenseMem judge protocol mismatch');
assert(sensememRow.answer_model === sensemem.row.answer_model, 'SenseMem answer model mismatch');
assert(sensememRow.memory_model === sensemem.row.memory_model, 'SenseMem memory model mismatch');
assert(sensememRow.retriever === sensemem.row.retriever, 'SenseMem retriever mismatch');
assert(sensememRow.notes?.qs === '\u00b6', 'SenseMem input footnote missing');
assert(/data-i18n-html="legend_sensemem">\s*<strong>&#182;<\/strong>/.test(html), 'SenseMem static footnote marker mismatch');
assert((html.match(/\blegend_sensemem: '<strong>&#182;<\/strong>/g) || []).length === 2, 'SenseMem footnote must have matching English and Chinese markers');
close(sensememRow.qs, Number(sensememMain.qs_percent.toFixed(2)), 'SenseMem displayed QS');
close(sensememRow.recall, Number(sensememMain.recall_at_10.toFixed(2)), 'SenseMem displayed Recall@10');
const predictionBytes = readFileSync(path.join(root, 'docs', sensemem.protocol.predictions_json));
assert(createHash('sha256').update(predictionBytes).digest('hex') === sensemem.protocol.predictions_json_sha256, 'SenseMem predictions hash mismatch');
const predictions = JSON.parse(predictionBytes.toString('utf8'));
assert(predictions.length === sensememMain.questions, 'SenseMem prediction coverage mismatch');
const sensememIds = new Set();
for (const [index, entry] of sensememMain.scores.entries()) {
  assert(typeof entry.id === 'string' && !sensememIds.has(entry.id), `SenseMem duplicate or missing question ID at ${index}`);
  sensememIds.add(entry.id);
  assert(predictions[index].id === entry.id && typeof predictions[index].answer === 'string', `SenseMem prediction mismatch at ${index}`);
  assert(Array.isArray(entry.retrieved_top10) && entry.retrieved_top10.length <= 10 && new Set(entry.retrieved_top10).size === entry.retrieved_top10.length, `SenseMem top-10 sources invalid at ${index}`);
}
for (const cutoff of [1, 5, 10]) {
  const key = `recall_at_${cutoff}`;
  for (const entry of sensememMain.scores) assert(Number.isFinite(entry[key]) && entry[key] >= 0 && entry[key] <= 1, `SenseMem ${key} outside [0, 1]`);
  close(sensememMain[key], sensememMain.scores.reduce((total, entry) => total + entry[key], 0) / sensememMain.questions * 100, `SenseMem aggregate ${key}`);
}

const judgeManifestPath = path.join(root, 'docs', sensemem.protocol.judge_artifacts);
const judgeManifest = JSON.parse(readFileSync(judgeManifestPath, 'utf8'));
assert(judgeManifest.run_id === sensemem.protocol.run_id && judgeManifest.source_commit === sensemem.protocol.source_commit, 'SenseMem judge run identity mismatch');
assert(judgeManifest.dataset_revision === sensemem.protocol.dataset_revision && judgeManifest.questions_sha256 === sensemem.protocol.questions_sha256, 'SenseMem judge dataset mismatch');
assert(judgeManifest.predictions_json_sha256 === sensemem.protocol.predictions_json_sha256, 'SenseMem judge prediction provenance mismatch');
assert(judgeManifest.judge_model === 'gpt-5-mini' && judgeManifest.judge_reasoning_effort === 'minimal', 'SenseMem judge model mismatch');
assert(judgeManifest.official_evaluator_revision === sensemem.protocol.evaluator.revision, 'SenseMem judge evaluator revision mismatch');
assert(judgeManifest.new_judge_calls === 0 && judgeManifest.retained_judgments_reused_for_export === 514 && judgeManifest.deterministic_scores_recomputed === 499, 'SenseMem judge export procedure mismatch');
const judgeFiles = ['atm_gpt-5-mini.json', 'atm_gpt-5-mini_summary.json', 'llm_judge_gpt-5-mini.json', 'llm_judge_gpt-5-mini_summary.json'];
assert(JSON.stringify(Object.keys(judgeManifest.files).sort()) === JSON.stringify([...judgeFiles].sort()), 'SenseMem judge artifact files mismatch');
const judgeArtifacts = Object.fromEntries(judgeFiles.map(name => {
  const bytes = readFileSync(path.join(path.dirname(judgeManifestPath), name));
  assert(bytes.length === judgeManifest.files[name].bytes && createHash('sha256').update(bytes).digest('hex') === judgeManifest.files[name].sha256, `SenseMem judge artifact hash mismatch: ${name}`);
  return [name, JSON.parse(bytes.toString('utf8'))];
}));
const atmJudgments = judgeArtifacts['atm_gpt-5-mini.json'];
const llmJudgments = judgeArtifacts['llm_judge_gpt-5-mini.json'];
assert(atmJudgments.length === sensememMain.questions && llmJudgments.length === sensememMain.per_type.open_end.questions, 'SenseMem judge coverage mismatch');
const llmById = new Map(llmJudgments.map(entry => [entry.id, entry]));
assert(llmById.size === llmJudgments.length, 'SenseMem duplicate judge question ID');
for (const [index, score] of sensememMain.scores.entries()) {
  const entry = atmJudgments[index];
  assert(entry.id === score.id && entry.qtype === score.qtype, `SenseMem ATM judge question mismatch at ${index}`);
  assert(entry.prediction === predictions[index].answer, `SenseMem ATM judge prediction mismatch at ${index}`);
  assert(entry.metric === ({ number: 'em', list_recall: 'jaccard', open_end: 'llm' })[score.qtype], `SenseMem ATM scoring method mismatch at ${index}`);
  assert(typeof entry.accuracy === (score.qtype === 'list_recall' ? 'number' : 'boolean'), `SenseMem ATM verdict type mismatch at ${index}`);
  close(Number(entry.accuracy), score.score, `SenseMem ATM judge score at ${index}`);
  if (score.qtype !== 'open_end') continue;
  const judge = llmById.get(score.id);
  assert(judge, `SenseMem missing open-ended judgment: ${score.id}`);
  for (const key of ['question', 'ground_truth', 'prediction', 'qtype', 'accuracy', 'explanation', 'raw_response', 'judge_model']) assert(judge[key] === entry[key], `SenseMem open-ended ${key} mismatch: ${score.id}`);
  assert(judge.judge_model === 'gpt-5-mini' && typeof judge.explanation === 'string' && judge.explanation.trim().length > 0, `SenseMem incomplete judgment: ${score.id}`);
  const raw = JSON.parse(judge.raw_response);
  assert(typeof raw.accuracy === 'boolean' && raw.accuracy === judge.accuracy && raw.explanation === judge.explanation, `SenseMem raw judge response mismatch: ${score.id}`);
}
for (const [name, entries] of [['atm', atmJudgments], ['llm_judge', llmJudgments]]) {
  const report = judgeArtifacts[`${name}_gpt-5-mini_summary.json`];
  assert(report.count === entries.length, `SenseMem ${name} summary count mismatch`);
  const total = entries.reduce((sum, entry) => sum + Number(entry.accuracy), 0);
  close(report.correct, total, `SenseMem ${name} summary score`);
  close(report.accuracy, total / entries.length, `SenseMem ${name} summary accuracy`);
  for (const qtype of ['number', 'list_recall', 'open_end']) {
    const subset = entries.filter(entry => entry.qtype === qtype);
    const sum = subset.reduce((value, entry) => value + Number(entry.accuracy), 0);
    assert(report.by_qtype[qtype].count === subset.length, `SenseMem ${name}/${qtype} summary count mismatch`);
    close(report.by_qtype[qtype].correct, sum, `SenseMem ${name}/${qtype} summary score`);
    close(report.by_qtype[qtype].accuracy, subset.length ? sum / subset.length : 0, `SenseMem ${name}/${qtype} summary accuracy`);
  }
}

const recallVR = main.rows.find(r => r.harness === 'RE-call' && String(r.retriever).includes('GPT-6 Luna re-rank'));
assert(recallVR, 'RE-call vision re-rank row missing');
const recallVREvidence = JSON.parse(readFileSync(path.join(root, 'docs/re-call-vision-rerank.json'), 'utf8'));
const recallVRMain = recallVREvidence.splits.main;
validateSplit('RE-call vision re-rank Main evidence', recallVRMain, 1013);
close(recallVR.qs, Number(recallVRMain.qs_percent.toFixed(2)), 'RE-call vision re-rank displayed QS');
close(recallVR.recall, Number(recallVRMain.recall_at_10.toFixed(2)), 'RE-call vision re-rank displayed Recall@10');
const recallVRDir = path.join(root, 'docs/re-call/vision-rerank');
const recallVRSummary = JSON.parse(readFileSync(path.join(recallVRDir, 'official-evaluator/main/atm_openai_gpt-5-mini_summary.json'), 'utf8'));
close(recallVRMain.qs_percent, recallVRSummary.accuracy * 100, 'RE-call vision re-rank QS against the official evaluator summary', 1e-4);
const recallVRJudged = JSON.parse(readFileSync(path.join(recallVRDir, 'official-evaluator/main/atm_openai_gpt-5-mini.json'), 'utf8'));
const recallVRById = new Map(recallVRJudged.map(entry => [entry.id, entry]));
assert(recallVRById.size === 1013, 'RE-call vision re-rank official evaluator coverage mismatch');
for (const entry of recallVRMain.scores) {
  const judged = recallVRById.get(entry.id);
  assert(judged && judged.qtype === entry.qtype && Number(judged.accuracy) === entry.score, `RE-call vision re-rank score mismatch: ${entry.id}`);
}
const recallVRPredictions = readFileSync(path.join(recallVRDir, 'main-predictions.jsonl'), 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line).id);
assert(recallVRPredictions.length === 1013 && recallVRPredictions.every(id => recallVRById.has(id)) && new Set(recallVRPredictions).size === 1013, 'RE-call vision re-rank prediction coverage mismatch');
// Every open-ended verdict must be a complete judgment. A failed row is scored 0 after its retries. A
// parse-fallback row is scored by keyword search, so it counts only when the reply is whole and ends with an
// explicit verdict equal to its score; a truncated reply does not. Counted from the evaluator's own rows.
function openEndHealth(name, judged) {
  const open = judged.filter(entry => entry.qtype === 'open_end');
  const failed = open.filter(entry => entry.failed).length;
  const parsed = open.filter(entry => entry.parse_fallback);
  const unverified = parsed.filter(entry => {
    const m = String(entry.raw_response).match(/"accuracy"\s*:\s*"?(true|false)"?\s*}\s*$/);
    return !m || (m[1] === 'true') !== Boolean(entry.accuracy);
  }).length;
  assert(open.length === 514 && failed === 0 && unverified === 0,
    `${name} open-ended verdicts incomplete: ${failed} failed, ${unverified} truncated or mismatched parse fallbacks of ${open.length}`);
  return { failed, parsed: parsed.length };
}
const recallVRHealth = openEndHealth('RE-call vision re-rank', recallVRJudged);
assert(recallVREvidence.protocol.judge_failures === recallVRHealth.failed && recallVREvidence.protocol.judge_parse_fallbacks === recallVRHealth.parsed,
  'RE-call vision re-rank evidence judge counts disagree with the evaluator rows');
// The August RE-call row, re-judged the same way: its QS against its own evaluator output.
const recallAugDir = path.join(root, 'docs/re-call/august-2026');
const recallAugJudged = JSON.parse(readFileSync(path.join(recallAugDir, 'official-evaluator/main/atm_openai_gpt-5-mini.json'), 'utf8'));
openEndHealth('RE-call August', recallAugJudged);
const recallAugSummary = JSON.parse(readFileSync(path.join(recallAugDir, 'official-evaluator/main/atm_openai_gpt-5-mini_summary.json'), 'utf8'));
assert(recallAugJudged.length === 1013 && recallAugSummary.count === 1013, 'RE-call August evaluator coverage mismatch');
close(recall.qs, Number((recallAugSummary.accuracy * 100).toFixed(2)), 'RE-call August displayed QS against its evaluator summary');
assert(recallVREvidence.protocol.judge_reasoning_effort === 'minimal', 'RE-call vision re-rank judge must use reasoning effort minimal');
// The benchmark-tuned footnote: its marker on the row, the paragraph in both languages, and the held-out numbers it states.
const recallVRHeld = recallVRMain.heldout_713;
assert(recallVRHeld && recallVRHeld.questions === 713, 'RE-call vision re-rank held-out split missing');
assert(recallVR.notes?.qs === '※', 'RE-call vision re-rank footnote marker missing');
assert(/data-i18n-html="legend_recall_vr">\s*<strong>&#8251;<\/strong>/.test(html), 'RE-call vision re-rank static footnote marker mismatch');
const recallVRLegends = html.match(/legend_recall_vr: '<strong>&#8251;<\/strong>[^']*'/g) || [];
assert(recallVRLegends.length === 2, 'RE-call vision re-rank footnote must have matching English and Chinese entries');
assert(recallVRLegends[0].includes('<strong>Benchmark-tuned:</strong>') && recallVRLegends[1].includes('<strong>针对基准调优：</strong>'),
  'RE-call vision re-rank footnote must carry the benchmark-tuned label in both languages');
for (const legend of recallVRLegends) {
  assert(legend.includes(recallVRHeld.qs_percent.toFixed(2)) && legend.includes(recallVRHeld.recall_at_10.toFixed(2)),
    'RE-call vision re-rank footnote held-out numbers disagree with the evidence');
}
const recallVRStatic = (html.match(/data-i18n-html="legend_recall_vr">\s*([\s\S]*?)\s*<\/p>/) || [])[1];
assert(recallVRStatic === recallVRLegends[0].slice("legend_recall_vr: '".length, -1),
  'RE-call vision re-rank static footnote differs from its English entry');

console.log(JSON.stringify({
  ok: true,
  main_rows: main.rows.length,
  hard_rows: hard.rows.length,
  evidence_questions: mainEvidence.questions + hardEvidence.questions,
  judge_model: summary.judge_model,
  rejudged_qs: { main: mainMemexa.qs, hard: hardMemexa.qs },
  official_recall: recall.recall,
  sensemem: { questions: sensememEvidence.questions, qs: sensememRow.qs, recall_at_10: sensememRow.recall, published_judgments: llmJudgments.length },
  legacy_disclosures: { main: mainLegacy.length, hard: hardLegacy.length }
}, null, 2));
