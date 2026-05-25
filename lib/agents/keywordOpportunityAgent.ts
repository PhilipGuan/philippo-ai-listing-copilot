import type { AgentContext } from "@/lib/agents/types"
import type { KeywordOpportunity } from "@/types/listing"

const uniqBy = <T>(values: T[], key: (v: T) => string) => {
  const seen = new Set<string>()
  const out: T[] = []
  for (const v of values) {
    const k = key(v)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(v)
  }
  return out
}

const normalizeKey = (value: string) => value.trim().toLowerCase()

const toPosition = (placement: string): KeywordOpportunity["recommended_position"] => {
  if (placement === "Title") return "Title"
  if (placement === "Description") return "Description"
  return "Bullet Point"
}

export async function keywordOpportunityAgent(ctx: AgentContext): Promise<AgentContext> {
  const missing = ctx.seoOpportunity?.missing ?? []
  const keywords = ctx.keywords

  if (!missing.length || !keywords) {
    ctx.debug?.calls.push({ agent: "keyword_opportunity", status: "local", details: { missing: 0 } })
    return { ...ctx, keywordOpportunities: [] }
  }

  const primary = new Set(keywords.primary_keywords.map(normalizeKey))
  const secondary = new Set(keywords.secondary_keywords.map(normalizeKey))

  const mapped: KeywordOpportunity[] = missing.map((m) => {
    const k = normalizeKey(m.keyword)
    const priority: KeywordOpportunity["priority"] = primary.has(k) ? "high" : secondary.has(k) ? "medium" : "low"
    return { keyword: m.keyword.trim(), priority, recommended_position: toPosition(m.recommendedPlacement) }
  })

  const keywordOpportunities = uniqBy(mapped, (m) => normalizeKey(m.keyword)).slice(0, 10)

  ctx.debug?.calls.push({
    agent: "keyword_opportunity",
    status: "local",
    details: { missing: missing.length, opportunities: keywordOpportunities.length }
  })

  return { ...ctx, keywordOpportunities }
}

