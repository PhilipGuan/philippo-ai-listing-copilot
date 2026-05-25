import type { AgentContext } from "@/lib/agents/types"
import type { SeoOpportunity } from "@/types/listing"

const textIncludes = (haystack: string, needle: string) => haystack.toLowerCase().includes(needle.toLowerCase())

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

const bulletPlacement = (index: number): SeoOpportunity["missing"][number]["recommendedPlacement"] => {
  if (index === 0) return "Bullet 1"
  if (index === 1) return "Bullet 2"
  if (index === 2) return "Bullet 3"
  if (index === 3) return "Bullet 4"
  return "Bullet 5"
}

const recommendPlacement = (seo: { title: string; bullets: string[]; description: string }, keyword: string) => {
  if (!textIncludes(seo.title, keyword)) return "Title" as const
  for (let i = 0; i < Math.min(5, seo.bullets.length); i++) {
    if (!textIncludes(seo.bullets[i], keyword)) return bulletPlacement(i)
  }
  return "Description" as const
}

export async function keywordGapAgent(ctx: AgentContext): Promise<AgentContext> {
  const seo = ctx.seoDraft
  if (!seo || !ctx.keywords) return ctx

  const seoText = [seo.title, ...seo.bullets, seo.description].join(" ")

  const primary = uniq(ctx.keywords.primary_keywords)
  const secondary = uniq(ctx.keywords.secondary_keywords)
  const longTail = uniq(ctx.keywords.long_tail_keywords)

  const missingPrimary = primary.filter((k) => !textIncludes(seoText, k))
  const missingSecondary = secondary.filter((k) => !textIncludes(seoText, k))
  const missingLongTail = longTail.filter((k) => !textIncludes(seoText, k))

  const missing: SeoOpportunity["missing"] = [
    ...missingPrimary.map((keyword) => ({ keyword, severity: "high" as const, recommendedPlacement: recommendPlacement(seo, keyword) })),
    ...missingSecondary.map((keyword) => ({ keyword, severity: "medium" as const, recommendedPlacement: recommendPlacement(seo, keyword) })),
    ...missingLongTail.map((keyword) => ({ keyword, severity: "low" as const, recommendedPlacement: recommendPlacement(seo, keyword) }))
  ].slice(0, 12)

  const seoOpportunity: SeoOpportunity = { missing }
  ctx.debug?.calls.push({ agent: "keyword_gap", status: "local", details: { missing: missing.length } })
  return { ...ctx, seoOpportunity }
}
