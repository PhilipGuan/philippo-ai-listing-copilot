# Philippo AI Listing Copilot — v0.0.4-alpha.1

This document snapshots the first v0.0.4-alpha build where the product upgrades from a “listing improvement copilot” into an “AI SEO Opportunity Engine”.

Key principles (from PRD):

- Do NOT relax SEO evaluator.
- SEO improvement must come from better information, coverage, and listing quality (not evaluator manipulation).

## What’s New vs v0.0.3

- Adds LLM-driven SEO Opportunity Engine (multi-call) on top of existing generation and evaluation:
  - WHY SEO low: weakness analysis
  - WHAT missing: search intent / feature expansion / customer intent
  - WHAT to add: ranked opportunities with estimated gain
- Adds new response field (additive, backward compatible):
  - `seo_engine` (keeps existing `seo_opportunity`, `optimization`, `image_quality`, `delta`)
- Adds frontend SEO Opportunity panel with one-click Apply:
  - Apply injects a typed prefix line into Key Features (e.g. `[SEO:Search Intent] office setup`)
  - User regenerates to verify improvement via evaluation + delta
- Improves loading UX for longer multi-agent runs:
  - Shows “LLM is working — <stage>” stage indicator (no misleading 100% progress)
- Keeps strict traceability:
  - `_debug.calls[]` records each new SEO agent call with requestId and attempts

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

- `POST /api/generate?debug=1` returns `_debug.calls[]`.
- v0.0.4 SEO engine proof (multi-call):
  - `_debug.calls[].agent` includes: `seo_weakness`, `search_intent`, `feature_expand`, `customer_expand`, `seo_rank`
  - each call includes a `requestId` (and `attempts` if retried)
- Strict failure rule:
  - if any SEO engine agent fails, the entire request fails (non-200) and `_debug` shows which agent failed.

## Loop Verification (Apply → Generate Again)

1) Generate once and see `seo_engine.opportunity[]`.
2) Click Apply on a ranked opportunity.
3) Confirm a new line is injected into Key Features with a type prefix.
4) Click Generate again and compare:
   - evaluation SEO dimension score
   - delta compare (previous vs current)

