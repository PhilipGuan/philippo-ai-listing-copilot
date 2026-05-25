import type { AgentContext } from "@/lib/agents/types"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

type Output = { search_intent: string[] }

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

export async function searchIntentExpansionAgent(ctx: AgentContext): Promise<AgentContext> {
  if (!ctx.product || !ctx.keywords) return ctx

  const input = {
    product: ctx.product,
    keyword_context: ctx.keywords,
    weakness: ctx.seoEngine?.weakness ?? []
  }

  try {
    const res = await dashscopeJsonWithMeta<Output>(
      [
        {
          role: "system",
          content:
            'Expand uncovered search intent for Amazon US. Return JSON only: {"search_intent":[""]}. Use short phrases. Avoid duplicates.'
        },
        { role: "user", content: JSON.stringify(input) }
      ],
      { temperature: 0.3, retries: 0 }
    )

    ctx.debug?.calls.push({ agent: "search_intent", status: "ok", ...res.meta })

    const search_intent = Array.isArray(res.value?.search_intent) ? uniq(res.value.search_intent).slice(0, 12) : []
    const seoEngine = {
      weakness: ctx.seoEngine?.weakness ?? [],
      search_intent,
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
      agent: "search_intent",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    throw err
  }
}

