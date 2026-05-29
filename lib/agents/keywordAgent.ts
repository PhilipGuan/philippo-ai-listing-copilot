import type { AgentContext, KeywordIntelligence } from "@/lib/agents/types"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

const toWords = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .split(/\s+/g)
    .map((w) => w.trim())
    .filter(Boolean)

export async function keywordAgent(ctx: AgentContext): Promise<AgentContext> {
  const base = uniq([
    ...toWords(ctx.input.product_name),
    ...toWords(ctx.input.material ?? ""),
    ...ctx.input.features.flatMap(toWords),
    ...(ctx.input.custom_attributes ?? []).flatMap((a) => toWords(`${a.key ?? ""} ${a.value ?? ""}`))
  ])

  const primary = uniq([base.slice(0, 2).join(" "), base.slice(2, 4).join(" ")].filter((v) => v.trim().length > 0))
  const secondary = uniq(base.slice(0, 8))
  const longTail = uniq(
    ctx.input.features
      .slice(0, 5)
      .map((f) => `${toWords(ctx.input.product_name).slice(0, 2).join(" ")} for ${toWords(f).slice(0, 4).join(" ")}`.trim())
      .filter(Boolean)
  )

  const fallback: KeywordIntelligence = {
    primary_keywords: primary.length ? primary : uniq([toWords(ctx.input.product_name).slice(0, 4).join(" ")]),
    secondary_keywords: secondary,
    long_tail_keywords: longTail
  }

  const strict = ctx.strict === true

  let result: KeywordIntelligence = fallback
  try {
    const res = await dashscopeJsonWithMeta<KeywordIntelligence>(
      [
        {
          role: "system",
          content:
            'Generate keyword intelligence for Amazon US. Output JSON only: {"primary_keywords":[],"secondary_keywords":[],"long_tail_keywords":[]}. Avoid subjective claims.'
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              product: ctx.product,
              marketplace: ctx.input.marketplace,
              custom_attributes: ctx.input.custom_attributes ?? []
            },
            null,
            2
          )
        }
      ],
      { temperature: 0.4, retries: 1 }
    )
    ctx.debug?.calls.push({ agent: "keyword", status: "ok", ...res.meta })
    result = res.value
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "keyword",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    if (strict) throw err
    ctx.debug?.calls.push({ agent: "keyword", status: "fallback" })
  }

  const keywords: KeywordIntelligence = {
    primary_keywords: Array.isArray(result.primary_keywords) ? uniq(result.primary_keywords).slice(0, 10) : fallback.primary_keywords,
    secondary_keywords: Array.isArray(result.secondary_keywords) ? uniq(result.secondary_keywords).slice(0, 20) : fallback.secondary_keywords,
    long_tail_keywords: Array.isArray(result.long_tail_keywords) ? uniq(result.long_tail_keywords).slice(0, 20) : fallback.long_tail_keywords
  }

  return { ...ctx, keywords }
}
