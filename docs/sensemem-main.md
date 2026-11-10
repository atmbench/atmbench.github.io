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
  caption field. The [preprocessing details and enriched inputs](#visual-description-inputs-and-provenance)
  are documented below.
- **Store:** the run reuses the source archive and its canonical embeddings
  and rebuilds the search index. Index-building time is left unreported in
  the leaderboard.

## Visual-description inputs and provenance

### Description generation

The additional descriptions were generated with **DeepSeek V4.1 Flash** through
Prism, using the request model `deepseek-v4.1-flash` and upstream model identifier
`deepseek-v4-1-flash-261017`.

Images were processed individually; each video was supplied as **32 ordered
frames**. Generation used temperature **0**, seed **0**, a **32,768-token** output
limit, **thinking disabled**, and strict **JSON Schema** output. The image pixel
limit was 4,194,304, with one source per ingestion batch and concurrency 16.

The [full prompt](https://github.com/SenseMem/SenseMem/blob/aadbe36f9566d985d9f78b3fe5dfd9f0fc9a00e0/src/mindbridge/models/openai_sdk.py#L320-L369)
requests detailed observations under `Shown`, `Text`, `Counts`, `Place`, `When`,
`Events`, and `Tags`. It preserves exact OCR, names, numbers, quantities, spatial
relationships, and video event order, returning one description per source item.

Description requests used only **original source media and capture metadata**.
Benchmark questions, reference answers, and gold evidence IDs were **not supplied
to description generation**.

### Caption fusion and evaluated inputs

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
All non-caption fields remain unchanged. In particular,
`model_used: vllm:Qwen/Qwen3-VL-2B-Instruct` identifies the **released SGM
annotation stage**, not the model that produced the additional descriptions.

The evaluated run reused these descriptions. Its example configuration consumes
the enriched corpus rather than generating descriptions during evaluation.

The [fixed input archive](https://github.com/thomas-yanxin/atmbench.github.io/releases/download/sensemem-main-enriched-inputs-2026-11-10/sensemem-atm-main-enriched-inputs.zip)
contains the two enriched image/video JSON files under
`atm-bench/data/processed_memory/`, matching the hashes recorded in the original
submission. The [input manifest](sensemem/main/enriched-inputs.json) records their
checksums, sizes, counts, and generation settings. Use them with the remaining
released inputs at dataset revision `78e826dc07e97466b2f54443831ef9a83ab8b27c`.

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
