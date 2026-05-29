import type { AgentContext, ProductUnderstanding } from "@/lib/agents/types"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

const normalize = (value: string) => value.trim().replace(/\s+/g, " ")

export async function productAgent(ctx: AgentContext): Promise<AgentContext> {
  const selling_points = ctx.input.features.map(normalize).filter(Boolean).slice(0, 8)
  const materialFromAttributes =
    (ctx.input.custom_attributes ?? []).find((a) => String(a.key).trim().toLowerCase() === "material")?.value ?? ""
  const materialCandidate = normalize(ctx.input.material ?? "") || normalize(materialFromAttributes)

  const fallback: ProductUnderstanding = {
    category: "General",
    material: materialCandidate,
    selling_points: selling_points.length >= 3 ? selling_points : [...selling_points, "Durable", "Easy to use"].slice(0, 3),
    target_customer: normalize(ctx.input.target_audience ?? "General")
  }

  const strict = ctx.strict === true

  let result: ProductUnderstanding = fallback
  try {
    const res = await dashscopeJsonWithMeta<ProductUnderstanding>(
      [
        {
          role: "system",
          content:
            'Normalize seller input into product context. Output JSON only with keys: {"category":"","material":"","selling_points":[""],"target_customer":""}.'
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              product_name: ctx.input.product_name,
              material: materialCandidate,
              features: ctx.input.features,
              target_audience: ctx.input.target_audience ?? "",
              custom_attributes: ctx.input.custom_attributes ?? []
            },
            null,
            2
          )
        }
      ],
      { temperature: 0.2, retries: 1 }
    )
    ctx.debug?.calls.push({ agent: "product", status: "ok", ...res.meta })
    result = res.value
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "product",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    if (strict) throw err
    ctx.debug?.calls.push({ agent: "product", status: "fallback" })
  }

  const product: ProductUnderstanding = {
    category: normalize(result.category || fallback.category),
    material: normalize(result.material || fallback.material),
    selling_points: Array.isArray(result.selling_points) ? result.selling_points.map(normalize).filter(Boolean).slice(0, 8) : fallback.selling_points,
    target_customer: normalize(result.target_customer || fallback.target_customer)
  }

  return { ...ctx, product }
}
