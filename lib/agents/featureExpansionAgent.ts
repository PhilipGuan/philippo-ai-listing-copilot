import type { AgentContext } from "@/lib/agents/types"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

type Output = { feature_expand: string[] }

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

export async function featureExpansionAgent(ctx: AgentContext): Promise<AgentContext> {
  if (!ctx.input.features?.length) return ctx

  const input = {
    seller_features: ctx.input.features,
    listing: ctx.result ?? null,
    weakness: ctx.seoEngine?.weakness ?? [],
    custom_attributes: ctx.input.custom_attributes ?? []
  }

  try {
    const res = await dashscopeJsonWithMeta<Output>(
      [
        {
          role: "system",
          content:
            'Discover feature expansion opportunities for Amazon listing SEO. Return JSON only: {"feature_expand":[""]}. Use short attribute phrases. Avoid duplicates.'
        },
        { role: "user", content: JSON.stringify(input) }
      ],
      { temperature: 0.3, retries: 0 }
    )

    ctx.debug?.calls.push({ agent: "feature_expand", status: "ok", ...res.meta })

    const feature_expand = Array.isArray(res.value?.feature_expand) ? uniq(res.value.feature_expand).slice(0, 12) : []
    const seoEngine = {
      weakness: ctx.seoEngine?.weakness ?? [],
      search_intent: ctx.seoEngine?.search_intent ?? [],
      feature_expand,
      customer: ctx.seoEngine?.customer ?? [],
      opportunity: ctx.seoEngine?.opportunity ?? [],
      continue: ctx.seoEngine?.continue,
      reason: ctx.seoEngine?.reason
    }

    return { ...ctx, seoEngine }
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "feature_expand",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    throw err
  }
}
