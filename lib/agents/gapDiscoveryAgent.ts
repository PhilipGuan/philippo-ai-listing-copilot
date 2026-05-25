import type { AgentContext } from "@/lib/agents/types"
import type { Opportunity } from "@/types/listing"

const priorityRank = (p: Opportunity["priority"]) => (p === "high" ? 0 : p === "medium" ? 1 : 2)

export async function gapDiscoveryAgent(ctx: AgentContext): Promise<AgentContext> {
  const keyword = ctx.keywordOpportunities ?? []
  const image = ctx.imageOpportunities ?? []

  const opportunities: Opportunity[] = [
    ...keyword.map((k) => ({
      type: "keyword" as const,
      priority: k.priority,
      reason: `${k.priority === "high" ? "Primary keyword" : "Keyword"} missing`,
      suggestion: `Add "${k.keyword}" to ${k.recommended_position}.`,
      meta: { keyword: k.keyword, recommended_position: k.recommended_position }
    })),
    ...image.map((i) => ({
      type: "image" as const,
      priority: i.priority,
      reason: i.dimension ? `Image issue: ${i.dimension}` : "Image improvement opportunity",
      suggestion: i.suggestion,
      meta: i.dimension ? { dimension: i.dimension } : undefined
    }))
  ]
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, 12)

  ctx.debug?.calls.push({
    agent: "gap_discovery",
    status: "local",
    details: { keyword: keyword.length, image: image.length, opportunities: opportunities.length }
  })

  return { ...ctx, opportunities }
}

