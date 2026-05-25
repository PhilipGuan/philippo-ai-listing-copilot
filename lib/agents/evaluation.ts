import type { AgentContext } from "@/lib/agents/types"
import type { ListingEvaluation } from "@/types/listing"

const clamp01 = (value: number) => Math.max(0, Math.min(1, value))

const textIncludes = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle.toLowerCase())

const asPercent = (value01: number) => Math.round(clamp01(value01) * 100)

export async function evaluationAgent(ctx: AgentContext): Promise<AgentContext> {
  const seo = ctx.seoDraft
  if (!seo || !ctx.keywords) return ctx

  const allText = [seo.title, ...seo.bullets, seo.description, seo.keywords.join(" ")].join(" ").toLowerCase()

  const targetKeywords = Array.from(
    new Set([...ctx.keywords.primary_keywords, ...ctx.keywords.secondary_keywords, ...ctx.keywords.long_tail_keywords].map((k) => k.trim()).filter(Boolean))
  )

  const usedKeywordCount = targetKeywords.filter((k) => textIncludes(allText, k)).length
  const keywordCoverage = clamp01(targetKeywords.length ? usedKeywordCount / targetKeywords.length : 0)

  const features = ctx.input.features.map((f) => f.trim()).filter(Boolean)
  const usedFeatureCount = features.filter((f) => textIncludes(allText, f)).length
  const featureCoverage = clamp01(features.length ? usedFeatureCount / features.length : 0)

  const compliance = ctx.compliance?.risk === "high" ? 0.4 : ctx.compliance?.risk === "medium" ? 0.7 : 1

  const readability = 0.85

  const seoScore = keywordCoverage
  const featureScore = featureCoverage
  const complianceScore = compliance
  const readabilityScore = readability

  const overall = seoScore * 0.35 + featureScore * 0.3 + complianceScore * 0.2 + readabilityScore * 0.15

  const improvement: string[] = []
  if (asPercent(seoScore) < 80) improvement.push("Add missing feature keywords into the title or bullets.")
  if (asPercent(featureScore) < 85) improvement.push("Provide additional feature input or ensure features are clearly reflected in bullets.")
  if (asPercent(readabilityScore) < 80) improvement.push("Simplify wording and make bullets more benefit-focused with shorter sentences.")
  if (asPercent(complianceScore) < 100) improvement.push("Remove risky wording and avoid absolute or medical claims.")
  if (!ctx.input.target_audience?.trim()) improvement.push("Add target customer input (Target Audience) for more precise copy.")

  const evaluation: ListingEvaluation = {
    overall: Math.round(overall * 100),
    dimension: {
      seo: asPercent(seoScore),
      feature: asPercent(featureScore),
      compliance: asPercent(complianceScore),
      readability: asPercent(readabilityScore)
    },
    improvement
  }

  ctx.debug?.calls.push({ agent: "evaluation", status: "local" })
  return { ...ctx, evaluation }
}
