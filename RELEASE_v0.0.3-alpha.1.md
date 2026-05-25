# Philippo AI Listing Copilot — v0.0.3-alpha.1

This document snapshots the v0.0.3-alpha build that upgrades reliability and explainability on top of v0.0.2:

- FR-013 Reliability: HTTP timeout + retry for DashScope calls; normalized user-facing errors
- FR-014 Explainable evaluation: overall + dimensions + improvement list
- FR-015 Missing keyword recommendation: detects missing keywords and recommended placement (kept as `seo_opportunity`)

## What’s New vs v0.0.2-beta.1

- Adds retry/timeout wrapper for DashScope calls, and surfaces clear error messages for:
  - timeout
  - temporary service issue (429/5xx)
  - invalid model output
- Expands evaluation output into explainable structure and renders it in UI
- Adds local keyword gap detection output and shows it in UI + Copy All

## How To Run (Local)

1) Install dependencies

```bash
npm install
```

2) Create `.env.local` (do not commit secrets)

```env
DASHSCOPE_API_KEY=
DASHSCOPE_BASE_URL=https://dashscope.aliyuncs.com/api/v1
DASHSCOPE_TEXT_PATH=/services/aigc/text-generation/generation
QWEN_TEXT_MODEL=qwen-plus

DASHSCOPE_VL_PATH=/services/aigc/multimodal-generation/generation
QWEN_VL_MODEL=qwen-vl-max
QWEN_VL_FALLBACK_MODEL=qwen-vl-plus

STRICT_LLM=1
DEBUG_LLM=1
```

3) Start dev server

```bash
npm run dev
```

