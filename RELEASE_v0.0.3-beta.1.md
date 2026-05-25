# Philippo AI Listing Copilot — v0.0.3-beta.1

This document snapshots the first v0.0.3-beta build where the product upgrades from “generator + score” into an “optimization copilot” loop:

- System generates listing + explainable evaluation (v0.0.3-alpha baseline)
- System discovers optimization opportunities (keyword + image) using local heuristics
- Frontend supports one-click Apply (writes back into Key Features input) and regeneration
- Frontend retains previous result and shows delta compare between runs
- System provides a continue decision to prevent infinite loops

## What’s New vs v0.0.3-alpha.1

- Adds closed-loop optimization output fields to response (backward compatible):
  - `image_quality` (rule-based scores + suggestions)
  - `optimization` (opportunities + keyword/image lists + continue decision)
  - keeps `seo_opportunity` (existing FR-015 output)
- Adds new local optimization agents (no new LLM calls) after generation:
  - `image_quality`, `keyword_opportunity`, `gap_discovery`, `optimization_decision`
- Adds frontend Optimization UI:
  - Optimization panel with Apply buttons for missing keywords
  - Delta compare across runs
- Makes ProductForm controlled from `app/page.tsx` (Option 1), enabling Apply to update inputs directly

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

## Verification Checklist

- API response includes:
  - `seo_opportunity` (existing)
  - `image_quality` and `optimization` (new)
- Debug trace includes new local agents:
  - `_debug.calls[].agent` contains `image_quality`, `keyword_opportunity`, `gap_discovery`, `optimization_decision`
- Frontend Apply:
  - Clicking Apply on a keyword appends the keyword into Key Features textarea (de-duplicated)
- Frontend Delta:
  - Run Generate twice and see delta compare (previous vs current) in the optimization panel

