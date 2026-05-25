# Philippo AI Listing Copilot — v0.0.2-beta.1

This document snapshots the first stable v0.0.2 build where:

- Uploaded images are previewed in the frontend (main preview + thumbnails)
- Uploaded images are understood by a Qwen-VL model and participate in listing generation via a context merge layer
- Debug traces can prove, per run, that vision and merge happened (requestId + merge details)

## What’s New vs v0.0.2-alpha.1

- Adds frontend image preview component (FR-012)
- Adds `_debug.calls[]` record for `agent="merge"` (with before/vision/after summaries)
- Fixes intermittent preview issues by stabilizing object URL lifecycle and allowing re-selecting the same file

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

## First-Principles Verification

- `POST /api/generate?debug=1` returns `_debug.calls[]`
- Vision proof:
  - `agent="vision"` is `ok` and includes a `requestId`
  - `endpoint` contains `multimodal-generation`
  - `model` is `qwen-vl-*`
- Merge proof:
  - `agent="merge"` exists with `details.before / details.vision / details.after`
  - `details.after.selling_points_len` should reflect merged vision features

