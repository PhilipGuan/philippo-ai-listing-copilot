import type { AgentContext } from "@/lib/agents/types"

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

export async function contextMergeAgent(ctx: AgentContext): Promise<AgentContext> {
  if (!ctx.product || !ctx.vision) return ctx

  const before = {
    category: ctx.product.category,
    material: ctx.product.material,
    selling_points_len: ctx.product.selling_points?.length ?? 0,
    target_customer: ctx.product.target_customer
  }

  const category =
    ctx.product.category && ctx.product.category !== "General" ? ctx.product.category : ctx.vision.category || ctx.product.category

  const material = ctx.product.material || ctx.vision.material

  const selling_points = uniq([...(ctx.product.selling_points ?? []), ...(ctx.vision.visual_features ?? [])]).slice(0, 8)

  const target_customer =
    ctx.product.target_customer && ctx.product.target_customer !== "General"
      ? ctx.product.target_customer
      : ctx.vision.possible_customer || ctx.product.target_customer

  ctx.debug?.calls.push({
    agent: "merge",
    status: "local",
    details: {
      before,
      vision: {
        category: ctx.vision.category,
        material: ctx.vision.material,
        visual_features_len: ctx.vision.visual_features?.length ?? 0,
        possible_customer: ctx.vision.possible_customer
      },
      after: {
        category,
        material,
        selling_points_len: selling_points.length,
        target_customer
      }
    }
  })

  return {
    ...ctx,
    product: {
      ...ctx.product,
      category,
      material,
      selling_points,
      target_customer
    }
  }
}
