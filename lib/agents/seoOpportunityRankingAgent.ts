import type { AgentContext } from "@/lib/agents/types"
import type { SeoRankedOpportunity } from "@/types/listing"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

type Output = { opportunity: SeoRankedOpportunity[] }

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

export async function seoOpportunityRankingAgent(ctx: AgentContext): Promise<AgentContext> {
  if (!ctx.result || !ctx.evaluation || !ctx.keywords) return ctx

  const input = {
    listing: ctx.result,
    evaluation: ctx.evaluation,
    keyword_context: ctx.keywords,
    missing_keywords: ctx.seoOpportunity?.missing ?? [],
    weakness: ctx.seoEngine?.weakness ?? [],
    search_intent: ctx.seoEngine?.search_intent ?? [],
    feature_expand: ctx.seoEngine?.feature_expand ?? [],
    customer: ctx.seoEngine?.customer ?? [],
    custom_attributes: ctx.input.custom_attributes ?? []
  }

  try {
    const res = await dashscopeJsonWithMeta<Output>(
      [
        {
          role: "system",
          content:
            'Rank SEO opportunities for Amazon US. Return JSON only: {"opportunity":[{"type":"primary_keyword|search_intent|feature_expand|customer_expand|long_tail_keyword","keyword":"","estimated_gain":0,"priority":1}]}. Follow weight guidance: primary_keyword(10) > search_intent(8) > feature_expand(6) > customer_expand(5) > long_tail_keyword(4). Priority starts from 1.'
        },
        { role: "user", content: JSON.stringify(input) }
      ],
      { temperature: 0.2, retries: 0 }
    )

    ctx.debug?.calls.push({ agent: "seo_rank", status: "ok", ...res.meta })

    const raw = Array.isArray(res.value?.opportunity) ? res.value.opportunity : []
    const normalized = raw
      .map((o, i) => ({
        type: o?.type,
        keyword: typeof o?.keyword === "string" ? o.keyword.trim() : "",
        estimated_gain: typeof o?.estimated_gain === "number" ? Math.round(o.estimated_gain) : 0,
        priority: typeof o?.priority === "number" ? Math.max(1, Math.round(o.priority)) : i + 1
      }))
      .filter((o) => typeof o.type === "string" && o.keyword.length > 0)
      .slice(0, 12)

    const sorted = normalized.sort((a, b) => a.priority - b.priority)
    const dedup = new Map<string, SeoRankedOpportunity>()
    for (const o of sorted) {
      const key = `${o.type}:${o.keyword.toLowerCase()}`
      if (dedup.has(key)) continue
      dedup.set(key, o as SeoRankedOpportunity)
    }

    const opportunity = Array.from(dedup.values()).slice(0, 12)

    const top = opportunity[0]
    const cont = top ? top.estimated_gain >= 3 : false
    const reason = cont ? `Top SEO opportunity estimated gain +${top.estimated_gain}` : "SEO opportunity exhausted"

    const seoEngine = {
      weakness: ctx.seoEngine?.weakness ?? [],
      search_intent: uniq(ctx.seoEngine?.search_intent ?? []),
      feature_expand: uniq(ctx.seoEngine?.feature_expand ?? []),
      customer: uniq(ctx.seoEngine?.customer ?? []),
      opportunity,
      continue: cont,
      reason
    }

    return { ...ctx, seoEngine }
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "seo_rank",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    throw err
  }
}
