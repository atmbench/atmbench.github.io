# SenseMem on ATM-Bench Main

SenseMem achieves **79.63% QS** and **90.45% Recall@10** across all **1,013 questions**
in ATM-Bench Main, using **DeepSeek V4.1 Flash** as the answer model.

| Question type | Questions | QS (%) |
| --- | ---: | ---: |
| Number | 360 | 81.388889 |
| List recall | 139 | 78.865194 |
| Open-ended | 514 | 78.599222 |
| **Overall** | **1,013** | **79.627109** |

The [score summary](sensemem-main.json) contains every question's score,
retrieval recall, and top-10 source IDs. The
[predictions](sensemem/main/predictions.json) contain the corresponding
question IDs and answer strings. Both files describe the same complete run.

## System and inputs

- **Code:** [SenseMem](https://github.com/SenseMem/SenseMem), evaluated at
  [ddb85e7e](https://github.com/SenseMem/SenseMem/commit/ddb85e7e67fa86a41e34e2b763d783e51426704c),
  integrated into the main development branch in
  [2d262b69](https://github.com/SenseMem/SenseMem/commit/2d262b69a064ebb270184b1f2e063f88c6d8043b).
- **Answer model:** `deepseek-v4.1-flash`, with thinking enabled, maximum
  reasoning effort, temperature 0, seed 0, concise answers, strict evidence
  grounding, and native evidence operations.
- **Embedding:** `tencent/WeMM-Embedding-9B`, 4,096 dimensions.
- **Reranking:** `Qwen3-VL-Rerank-8B`, with 40 media candidates and media
  weight 0.5.
- **Retrieval:** hybrid search, 100 ranked source candidates, up to 20 reader sources,
  and a 64,000-character evidence budget.
- **Archive:** 11,034 source records and 4,292 original image/video assets.
  Inputs include emails, raw images and videos, released structured source
  annotations, and additional precomputed visual descriptions fused into the
  caption field. The [exact enriched visual inputs](#visual-description-inputs-and-provenance)
  are available with their recorded hashes; the added-description generator's
  original model, recipe and input-access boundary are not established.
- **Store:** the run reuses the source archive and its canonical embeddings
  and rebuilds the search index. Index-building time is left unreported in
  the leaderboard.

## Visual-description inputs and provenance

The retained enriched inputs used by this run are available as a
[fixed Release asset](https://github.com/thomas-yanxin/atmbench.github.io/releases/download/sensemem-main-enriched-inputs-2026-11-10/sensemem-atm-main-enriched-inputs.zip).
The [input manifest](sensemem/main/enriched-inputs.json) pins the Release and
asset IDs, ZIP checksum, file sizes and record counts. Both uncompressed file
hashes match the hashes already recorded in the original submission, before
this provenance update:

- `image_batch_results.json` (3,759 records):
  `57bb89d2eb1eeb13cb62e0888edc6d74ac8e63c4dd5826b6e0ba2111050d241f`
- `video_batch_results.json` (533 records):
  `7fe916356a3db5a60b87a110ba8eabc6cebca3cd5c855d0e6073f3d72ba0cb3b`

The ZIP SHA-256 is
`5dbb81caadf3d05d1c1cc1a5237efd4c21785c5352d9b07f0ae10564cf772933`.
It contains only these two files, under `atm-bench/data/processed_memory/`.
Use them with the remaining released inputs at dataset revision
`78e826dc07e97466b2f54443831ef9a83ab8b27c`. No description, answer or judgment
was regenerated for this release.

### Caption fusion and reconstruction

Against the pinned released annotations, **only `caption` differs**. Each of
the 3,742 enriched image captions and 528 enriched video captions preserves the
exact original caption and appends a description using this template:

```text
[Released SGM caption]
<original caption>

[MindBridge visual description of the same source item]
<additional description>
```

The other 17 image captions and 5 video captions retain the released value.
The surviving records do not establish why no description was appended to
those 22 items. All non-caption fields remain unchanged. In particular,
`model_used: vllm:Qwen/Qwen3-VL-2B-Instruct` identifies the **released SGM
annotation stage**, not the model that produced the additional descriptions.

Before the measured run, the enriched JSON was reconstructed after an older
fused-input directory was lost. Reconstruction recovered each caption from
the authoritative source store by source ID and the fixed SGM text boundaries,
then replaced only `caption` in the released record. It made no model calls.
The reconstructed SDK source text after normalization, metadata, timestamps,
original asset bytes and canonical embeddings were checked against the retained
store. The submitted run consumed these reconstructed inputs and recorded the
file hashes above; this release preserves those bytes.

### Generation records and data access

The original added-description model and immutable model revision, exact
prompts, sampling settings and repair history cannot be established from the
retained generation records. `source_description_model: null` means **unknown
for these additions**, not that there was no description stage. This is a
historical provenance-record limitation. The example evaluation configuration
consumes an already enriched corpus; it does not regenerate these descriptions.

The information boundaries that can be established are:

- **Original added-description generation:** its access to benchmark questions,
  reference answers and gold evidence IDs is **unknown**. The retained materials
  do not establish that this stage was question-blind or label-blind.
- **Caption reconstruction:** released source annotations and caption text
  recovered by source ID from the authoritative source store. Reconstruction
  selects source records and does not use question, reference-answer or
  gold-evidence fields to construct captions.
- **Runtime ingestion:** source records, original media, source IDs and
  timestamps. Questions, reference answers and gold evidence IDs are separate
  evaluation inputs; references and gold IDs serve scoring and retrieval
  diagnostics.

The source-only reconstruction and runtime ingestion boundaries do not certify
the earlier generation boundary. The released enriched inputs make the
evaluated content inspectable without claiming an independently reproducible
description-generation recipe.

## Evaluation

QS uses the official ATM-Bench scorer at
[`ef4e5dff1a47`](https://github.com/JingbiaoMei/ATM-Bench/tree/ef4e5dff1a47ec71213a06e359f02753defa8fb1):
deterministic normalization for number questions, list Jaccard scoring for
list questions, and `gpt-5-mini` with minimal reasoning effort for open-ended
questions.

Recall@10 averages each question's gold-source coverage among the first
10 distinct source IDs in SenseMem's ranked retrieval list. Recall@1, @5,
and @10 are **65.827692%**, **86.529286%**, and **90.452530%**, respectively.

All 1,013 answers and 514 open-ended judgments were generated in this run.
It completed with zero answer or ingestion failures. The public score summary
records the dataset revision, input hashes, code revision, model settings,
and prediction-file SHA-256.

## Verification

The submission was checked against the complete question set. All 499
deterministic number/list scores were recalculated, and retrieval recall
was recomputed from the ranked original source IDs. The evaluated code
matches the recorded hashes of 189 source and dependency files.

Run the site's checks with:

```bash
node tools/verify_leaderboard.mjs
```
