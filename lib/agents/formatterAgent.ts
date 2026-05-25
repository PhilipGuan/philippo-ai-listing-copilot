import type { AgentContext } from "@/lib/agents/types"
import type { ListingResult } from "@/types/listing"

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

const ensureCount = (values: string[], count: number, fallback: (i: number) => string) => {
  const normalized = values.map((v) => v.trim()).filter(Boolean)
  if (normalized.length >= count) return normalized.slice(0, count)
  return [...normalized, ...Array.from({ length: count - normalized.length }, (_, i) => fallback(i))].slice(0, count)
}

export async function formatterAgent(ctx: AgentContext): Promise<AgentContext> {
  const seo = ctx.seoDraft
  if (!seo) return ctx

  const keywords = uniq(seo.keywords).slice(0, 10)

  const result: ListingResult = {
    title: seo.title.trim(),
    bullets: ensureCount(seo.bullets, 5, (i) => `Feature highlight ${i + 1}`),
    description: seo.description.trim(),
    keywords: keywords.length >= 5 ? keywords : ensureCount(keywords, 5, (i) => `keyword-${i + 1}`),
    compliance: ctx.compliance ?? { risk: "low", warning: [] },
    evaluation: ctx.evaluation ?? {
      overall: 0,
      dimension: { seo: 0, feature: 0, compliance: 100, readability: 85 },
      improvement: []
    },
    seo_opportunity: ctx.seoOpportunity,
    seo_engine: ctx.seoEngine,
    vision_context: ctx.vision,
    image_quality: ctx.imageQuality,
    optimization: ctx.optimization
  }

  ctx.debug?.calls.push({ agent: "formatter", status: "local" })
  return { ...ctx, result }
}
