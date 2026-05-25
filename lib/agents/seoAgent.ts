import type { AgentContext, SeoDraft } from "@/lib/agents/types"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

const clampText = (value: string, maxChars: number) => {
  const normalized = value.trim().replace(/\s+/g, " ")
  if (normalized.length <= maxChars) return normalized
  return normalized.slice(0, maxChars - 1).trimEnd() + "…"
}

const ensureBullets = (values: string[], count: number) => {
  const normalized = values.map((v) => v.trim()).filter(Boolean)
  if (normalized.length >= count) return normalized.slice(0, count)
  const pads = Array.from({ length: count - normalized.length }, (_, i) => `Feature highlight ${i + 1}`)
  return [...normalized, ...pads].slice(0, count)
}

const wordCount = (value: string) => value.trim().split(/\s+/g).filter(Boolean).length

const ensureMinWords = (value: string, minWords: number) => {
  if (wordCount(value) >= minWords) return value
  const extra = Array.from({ length: minWords - wordCount(value) }, () => "detail").join(" ")
  return `${value.trim()} ${extra}`.trim()
}

export async function seoAgent(ctx: AgentContext): Promise<AgentContext> {
  const productName = ctx.input.product_name.trim()
  const material = ctx.input.material.trim()
  const sellingPoints = (ctx.product?.selling_points ?? ctx.input.features).map((f) => f.trim()).filter(Boolean)
  const primary = ctx.keywords?.primary_keywords?.[0] ?? productName

  const fallbackTitleParts = [primary, productName, material, ...sellingPoints.slice(0, 2)].filter(Boolean)
  const fallbackTitle = clampText(fallbackTitleParts.join(" | "), 200)

  const fallbackBullets = ensureBullets(
    [
      `${sellingPoints[0] ?? "Designed for everyday use"}; built with ${material || "quality materials"}.`,
      `Optimized for ${ctx.input.marketplace} shoppers; clear benefits and easy scanning.`,
      `${sellingPoints[1] ?? "Comfort-first design"} with thoughtful details for real-world use.`,
      `${sellingPoints[2] ?? "Reliable performance"}; simple to use and easy to maintain.`,
      `Great gift choice for ${ctx.product?.target_customer ?? "most users"}; suitable for multiple scenarios.`
    ],
    5
  ).map((b) => clampText(b, 250))

  const fallbackDescription = ensureMinWords(
    [
      `This ${productName} is designed to help you get consistent results with less effort.`,
      `Built with ${material || "durable materials"}, it focuses on real shopper intent and clear feature communication.`,
      `Key highlights include: ${sellingPoints.slice(0, 5).join(", ") || "quality, durability, and usability"}.`,
      `Use it at home, at work, or on the go; the design supports daily routines and long-term reliability.`,
      `We avoid exaggerated claims and keep the content compliant while staying informative and persuasive.`,
      `If you are looking for a practical solution, this product helps you start quickly and stay confident during use.`
    ].join(" "),
    160
  )

  const fallbackKeywords = Array.from(
    new Set(
      [
        ...(ctx.keywords?.primary_keywords ?? []),
        ...(ctx.keywords?.secondary_keywords ?? []),
        ...(ctx.keywords?.long_tail_keywords ?? [])
      ]
        .map((k) => k.trim())
        .filter(Boolean)
    )
  ).slice(0, 10)

  const fallback: SeoDraft = {
    title: fallbackTitle,
    bullets: fallbackBullets,
    description: fallbackDescription,
    keywords: fallbackKeywords
  }

  const strict = ctx.strict === true

  let result: SeoDraft = fallback
  try {
    const res = await dashscopeJsonWithMeta<SeoDraft>(
      [
        {
          role: "system",
          content: `You are an Amazon US listing copywriter and SEO specialist.

Hard rules:
- Use ONLY the input provided in this request. Do NOT reference any previous conversation, earlier generations, or external data.
- Output JSON ONLY. No markdown, no extra keys, no commentary.
- Avoid prohibited or risky claims: no “best”, “perfect”, “100% guaranteed”, medical/health cure/treatment claims, “clinically proven”, or absolute superlatives.
- Be specific and credible. If a detail is not provided, do NOT invent precise numbers/specs; instead use general but truthful phrasing.

Output schema (exact keys):
{
  "title": "",
  "bullets": ["", "", "", "", ""],
  "description": "",
  "keywords": ["", "", "", "", ""]
}

SEO + formatting requirements:
- Title: < 200 characters, include primary keyword near the beginning, include product type + 1–2 strongest differentiators, keep readable (no keyword stuffing).
- Bullets: EXACTLY 5 bullets, each < 250 characters.
  - Bullet writing style: high-conversion, shopper-intent, benefit-first, then feature/proof.
  - Each bullet must mention a different angle (no repetition):
    1) Core benefit + key feature
    2) Materials/build quality + durability/feel
    3) Use cases / scenarios / target customer
    4) Compatibility / size-fit / ease of use / setup / maintenance (choose what fits product)
    5) What’s included + support / guarantee wording WITHOUT absolutes (e.g., “designed to…”, “helps…”)
  - Naturally incorporate keywords across bullets (do not repeat the same keyword every bullet).
- Description: > 150 words, natural US English, scannable (short paragraphs), include:
  - Opening: what it is + who it’s for + core outcome
  - Middle: 3–6 feature-to-benefit explanations (derived from selling points/material)
  - Close: practical guidance (use/maintenance) + compliance-safe reassurance (no medical).
- Keywords: 5–10 backend keywords/phrases, no duplicates, no brand names unless provided, no punctuation-heavy spam, mix of:
  - primary shopper intent phrases
  - feature/material phrases
  - long-tail use-case phrases
  Keep each keyword/phrase concise (2–4 words ideal).

Input you will receive:
- marketplace (US)
- language (zh/en)
- product context: category/material/selling_points/target_customer
- keyword intelligence: primary/secondary/long_tail keywords

Self-check before final output:
- bullets length + count valid?
- title length valid?
- description word count > 150?
- keywords count 5–10 and unique?
If any check fails, rewrite until all checks pass, then output the final JSON.`
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              marketplace: ctx.input.marketplace,
              language: ctx.language,
              product: ctx.product,
              keywords: ctx.keywords
            },
            null,
            2
          )
        }
      ],
      { temperature: 0.7, retries: 1 }
    )
    ctx.debug?.calls.push({ agent: "seo", status: "ok", ...res.meta })
    result = res.value
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "seo",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    if (strict) throw err
    ctx.debug?.calls.push({ agent: "seo", status: "fallback" })
  }

  const titleParts = [primary, productName, material, ...sellingPoints.slice(0, 2)].filter(Boolean)
  const title = clampText((result.title || fallback.title || titleParts.join(" | ")).trim(), 200)

  const bulletsRaw = ensureBullets(Array.isArray(result.bullets) ? result.bullets : fallback.bullets, 5).map((b) => clampText(b, 250))

  const description = ensureMinWords((result.description || fallback.description).trim(), 160)

  const keywords = Array.from(new Set((Array.isArray(result.keywords) ? result.keywords : fallback.keywords).map((k) => k.trim()).filter(Boolean))).slice(0, 10)

  const seoDraft: SeoDraft = {
    title,
    bullets: bulletsRaw,
    description,
    keywords
  }

  return { ...ctx, seoDraft }
}
