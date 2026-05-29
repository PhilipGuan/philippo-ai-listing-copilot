# Philippo AI Listing Copilot — v0.0.4-beta.1

This release upgrades the Product Input to be more flexible across product categories, while keeping all v0.0.4-alpha.1 generation, evaluation, SEO engine, and debug traceability behavior.

Key principles (from PRD):

- Do NOT relax SEO evaluator.
- SEO improvement must come from better information, coverage, and listing quality (not evaluator manipulation).

## What’s New vs v0.0.4-alpha.1

### 1) Product Attributes (Custom Key-Value) — real backend input

- Removes fixed input fields: Material / Brand / Color / Dimensions.
- Adds a new optional Product Attributes table (Key-Value) with CRUD.
- Attributes are sent to backend as a structured JSON field:
  - `custom_attributes: [{ key, type, value }]`
- Attributes are consumed by the pipeline (vision/product/keyword/seo/seo_engine) so they can influence listing generation and SEO opportunities.

Supported attribute types:

- `text`
- `multiline`
- `select` (templates only)

### 2) Select templates (no manual options editor)

For faster input without adding UI complexity, `select` uses templates:

- Size: S/M/L/XL
- Color: Black/White/Gray/Blue/Red
- Voltage: 110V/220V
- Wattage: 30W/60W/100W
- Capacity: Small/Medium/Large

### 3) UI efficiency improvements

- High-frequency actions are placed closer together to reduce pointer travel:
  - Quick-add chips (+ Material / + Brand / + Color / + Dimensions)
  - Template add shortcut
  - “+ Add Attribute” near the module header
- Generate button is placed in a sticky footer within Product Input for easier access on long forms.
- Debug FAB is always available (even before the first generation).

### 4) Repo hygiene

- Removes `imagesForTest/` from the public repository.

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

## First-Principles Verification (Debug)

- Use `POST /api/generate?debug=1` (frontend uses it by default) to return `_debug.calls[]`.
- Confirm real DashScope participation:
  - each LLM call includes `requestId`
  - key calls include: `vision`, `product`, `keyword`, `seo`, plus v0.0.4 SEO engine calls

