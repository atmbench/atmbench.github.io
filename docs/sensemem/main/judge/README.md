# SenseMem Main judge records

These records support the unchanged **79.627109% QS** reported in the
[run report](../../../sensemem-main.md). The 514 open-ended questions score
**78.599222%**: 404 correct and 110 incorrect.

| File | Contents |
| --- | --- |
| [atm_gpt-5-mini.json](atm_gpt-5-mini.json) | All 1,013 questions, predictions, question types, scoring methods, and scores; open-ended rows include the original judgments. |
| [atm_gpt-5-mini_summary.json](atm_gpt-5-mini_summary.json) | Overall and per-type ATM score summaries. |
| [llm_judge_gpt-5-mini.json](llm_judge_gpt-5-mini.json) | All 514 open-ended verdicts, explanations, and raw judge response texts. |
| [llm_judge_gpt-5-mini_summary.json](llm_judge_gpt-5-mini_summary.json) | Summary of the 514 open-ended judgments. |
| [provenance.json](provenance.json) | Original run identity, source hashes, export procedure, and file checksums. |

## Origin and export

The original Main18 run stored each judgment in SenseMem's `samples.jsonl`,
alongside its question ID, question, reference answer, prediction, and score.
Its `judge_response` field contains a JSON array with one original model
response string. That string is preserved verbatim here as `raw_response`;
`accuracy` and `explanation` are parsed from it. The original judge was
`gpt-5-mini` with minimal reasoning effort. All 514 original judgments were
fresh, successful calls.

These files were exported on **2026-11-23**. They are an offline replay and
export of the original SDK records, not a retained original
`evaluate_qa.py --output-dir`. No answers or judgments were regenerated.

The export used the official evaluator at
[`ef4e5dff1a47`](https://github.com/JingbiaoMei/ATM-Bench/blob/ef4e5dff1a47ec71213a06e359f02753defa8fb1/memqa/utils/evaluator/evaluate_qa.py):

1. Check the pinned benchmark question file and original sample file hashes,
   and match all 1,013 predictions and scores to the submitted files.
2. Export all 514 original response texts and their parsed verdicts and
   explanations into the evaluator's LLM cache format.
3. Run the official `run_atm` function with that cache. It recomputes the 499
   number/list scores and reuses all 514 open-ended judgments.
4. Run the official `run_llm_judge` function on the 514 open-ended questions,
   using the same cache, to produce their summary. Model-client construction
   was blocked during export, so a cache miss would fail rather than issue a
   new request.

The original SDK trims surrounding whitespace from validated question and
reference-answer strings. The export preserves those original inputs:
64 questions and 46 reference answers have surrounding whitespace removed
relative to the pinned release. All retained questions and reference answers
match the pinned release after that whitespace trimming.

The manifest records SHA-256 checksums for the source records, pinned evaluator
files, predictions, questions, and the four exported result files. The
original full SDK logs and configuration remain local; this directory contains
the question and judge records needed to inspect the reported scores.

## Verification

Run from the repository root:

```bash
node tools/verify_leaderboard.mjs
```

The verifier checks artifact hashes, exact question coverage, prediction and
score agreement, raw-response verdicts and explanations, and both summaries.
