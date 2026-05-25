import type { AgentContext } from "@/lib/agents/types"
import type { SeoWeakness } from "@/types/listing"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

type Output = { weakness: SeoWeakness[] }

export async function seoWeaknessAnalysisAgent(ctx: AgentContext): Promise<AgentContext> {
  if (!ctx.result || !ctx.evaluation || !ctx.keywords) return ctx

  const input = {
    listing: ctx.result,
    evaluation: ctx.evaluation,
    keyword_context: ctx.keywords,
    keyword_coverage: ctx.seoOpportunity ?? null,
    image_context: ctx.vision ?? null
  }

  try {
    const res = await dashscopeJsonWithMeta<Output>(
      [
        {
          role: "system",
          content:
            'You are an Amazon SEO optimization expert. Analyze WHY SEO is low. Return JSON only: {"weakness":[{"type":"primary_keyword|feature_coverage|customer_intent|usage_scenario|search_intent","severity":"critical|high|medium|low","reason":""}]}.'
        },
        { role: "user", content: JSON.stringify(input) }
      ],
      { temperature: 0.2, retries: 0 }
    )

    ctx.debug?.calls.push({ agent: "seo_weakness", status: "ok", ...res.meta })

    const weakness = Array.isArray(res.value?.weakness) ? res.value.weakness : []
    const normalized: SeoWeakness[] = weakness
      .map((w) => ({
        type: w?.type,
        severity: w?.severity,
        reason: typeof w?.reason === "string" ? w.reason.trim() : ""
      }))
      .filter((w) => typeof w.type === "string" && typeof w.severity === "string" && w.reason.length > 0)
      .slice(0, 12)

    const seoEngine = {
      weakness: normalized,
      search_intent: ctx.seoEngine?.search_intent ?? [],
      feature_expand: ctx.seoEngine?.feature_expand ?? [],
      customer: ctx.seoEngine?.customer ?? [],
      opportunity: ctx.seoEngine?.opportunity ?? [],
      continue: ctx.seoEngine?.continue,
      reason: ctx.seoEngine?.reason
    }

    return { ...ctx, seoEngine }
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "seo_weakness",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    throw err
  }
}
