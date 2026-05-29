import type { AgentContext } from "@/lib/agents/types"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

type Output = { customer: string[] }

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

export async function customerIntentExpansionAgent(ctx: AgentContext): Promise<AgentContext> {
  if (!ctx.vision && !ctx.input.target_audience?.trim()) return ctx

  const input = {
    vision_context: ctx.vision ?? null,
    target_audience: ctx.input.target_audience ?? "",
    weakness: ctx.seoEngine?.weakness ?? [],
    custom_attributes: ctx.input.custom_attributes ?? []
  }

  try {
    const res = await dashscopeJsonWithMeta<Output>(
      [
        {
          role: "system",
          content:
            'Discover customer segments and buyer intent for Amazon listing SEO. Return JSON only: {"customer":[""]}. Use short segments. Avoid duplicates.'
        },
        { role: "user", content: JSON.stringify(input) }
      ],
      { temperature: 0.3, retries: 0 }
    )

    ctx.debug?.calls.push({ agent: "customer_expand", status: "ok", ...res.meta })

    const customer = Array.isArray(res.value?.customer) ? uniq(res.value.customer).slice(0, 12) : []
    const seoEngine = {
      weakness: ctx.seoEngine?.weakness ?? [],
      search_intent: ctx.seoEngine?.search_intent ?? [],
      feature_expand: ctx.seoEngine?.feature_expand ?? [],
      customer,
      opportunity: ctx.seoEngine?.opportunity ?? [],
      continue: ctx.seoEngine?.continue,
      reason: ctx.seoEngine?.reason
    }

    return { ...ctx, seoEngine }
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "customer_expand",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    throw err
  }
}
