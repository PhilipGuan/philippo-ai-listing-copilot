# Philippo AI Listing Copilot — v0.0.1

This document snapshots the first end-to-end runnable MVP that can prove DashScope LLM calls per generation via requestId-based debug traces.

## Scope

- Desktop web app (Next.js) with a single page workflow
- Upload images + input product info → generate Amazon US listing → edit + copy
- Multi-agent pipeline (language/product/keyword/seo/compliance/formatter/evaluation)
- No database, no persistence across runs

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
STRICT_LLM=1
```

3) Start dev server

```bash
npm run dev
```

## LLM Call Verification

- Frontend calls `POST /api/generate?debug=1`
- Response contains `_debug.calls[]` including requestId for each LLM-backed agent (language/product/keyword/seo)
- With `STRICT_LLM=1`, any LLM error aborts the request (no silent fallback)

## Notes / Known Issues

- `qwen3.6-flash` may not be available under certain accounts/regions; `qwen-plus` is validated working in v0.0.1
- Images are validated and uploaded but are not used for model vision understanding in v0.0.1
- `.env.local` parsing is sensitive; keep one key per line and do not wrap URLs with quotes/backticks

