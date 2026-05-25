# Philippo AI Listing Copilot

An AI-native Amazon listing generator and iterative optimization copilot (v0.0.4-alpha.1).

It supports:

- Multimodal product understanding (image + text) via Qwen-VL
- Listing generation + explainable evaluation
- Optimization loop (Apply → Generate again → Delta compare)
- SEO Opportunity Engine (LLM-driven weakness → expansion → ranked opportunities)
- Debug trace with requestId to prove real DashScope calls

## Prerequisites

- Node.js 18+
- A DashScope API Key

## Setup

1) Install dependencies

```bash
npm install
```

2) Create `.env.local`

```bash
cp .env.example .env.local
```

Then edit `.env.local` and fill:

- `DASHSCOPE_API_KEY`
- Optionally change models and flags:
  - `QWEN_TEXT_MODEL` (default `qwen-plus`)
  - `QWEN_VL_MODEL` (default `qwen-vl-max`)
  - `STRICT_LLM=1` to disable silent fallback and fail loudly
  - `DEBUG_LLM=1` to always include `_debug` in responses

Notes:

- `.env.local` is ignored by git and should never be committed.

3) Start dev server

```bash
npm run dev
```

Open http://localhost:3000

## How to Use

1) Upload 1~5 product images (JPG/JPEG, PNG, WebP).
2) Fill product info and click **Generate**.
3) In **Optimization Opportunity** panel, click **Apply** to inject suggestions into Key Features.
4) Click **Generate** again to verify improvement (see Delta compare).

## First-Principles Verification (Debug)

Call:

- `POST /api/generate?debug=1`

Or set:

- `DEBUG_LLM=1`

Then inspect:

- `_debug.calls[]` per agent
- `requestId` for each DashScope call

## Docs

- PRD: `PRD_v0.0.4-alpha.md`
- PRD Coverage: `PRD_COVERAGE_v0.0.4-alpha.1.md`
- Release Notes: `RELEASE_v0.0.4-alpha.1.md`

