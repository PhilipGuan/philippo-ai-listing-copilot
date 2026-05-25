# Philippo AI Listing Copilot — v0.0.2-alpha.1

This document snapshots the first working multimodal pipeline where uploaded images are understood by a Qwen-VL model and merged into the listing generation context.

## What’s New vs v0.0.1

- Adds Vision Agent using DashScope multimodal generation (`qwen-vl-*`)
- Adds Context Merge Layer (seller input > vision understanding > fallback)
- Adds `vision_context` in the API response/listing result
- Keeps debug traces (`_debug.calls[]`) with requestId per LLM call

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
- You should see `agent="vision"` with a `requestId`, `endpoint` pointing to `multimodal-generation`, and `model=qwen-vl-*`
- Subsequent `product/keyword/seo` calls should also have their own requestId

