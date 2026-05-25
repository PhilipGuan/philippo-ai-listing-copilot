import type { AgentContext } from "@/lib/agents/types"
import type { OptimizationResult } from "@/types/listing"

const max = (values: number[]) => values.reduce((a, b) => (a > b ? a : b), 0)

const priorityToScore = (p: "high" | "medium" | "low") => (p === "high" ? 4 : p === "medium" ? 2 : 1)

export async function optimizationDecisionAgent(ctx: AgentContext): Promise<AgentContext> {
  const keyword = ctx.keywordOpportunities ?? []
  const image = ctx.imageOpportunities ?? []
  const opportunities = ctx.opportunities ?? []
  const evaluation = ctx.evaluation

  const keywordGain = keyword.length ? max(keyword.map((k) => priorityToScore(k.priority))) : 0

  let imageGain = 0
  const hero = ctx.imageQuality?.hero_ctr_score
  if (typeof hero === "number") {
    if (hero < 70) imageGain = 2
    else if (hero < 80) imageGain = 1
  }

  let seoPenaltyGain = 0
  if (evaluation?.dimension?.seo != null) {
    if (evaluation.dimension.seo < 80 && keyword.length) seoPenaltyGain = 2
    else if (evaluation.dimension.seo < 85 && keyword.length) seoPenaltyGain = 1
  }

  const base = evaluation?.overall != null && evaluation.overall < 75 && opportunities.length ? 1 : 0

  const expectedGain = keywordGain + imageGain + seoPenaltyGain + base
  const cont = expectedGain > 3
  const reason =
    opportunities[0]?.reason ??
    (keyword.length ? "Keyword opportunity exists" : image.length ? "Image improvement opportunity exists" : "No strong opportunity detected")

  const optimization: OptimizationResult = {
    opportunities,
    keyword,
    image,
    continue: cont,
    reason
  }

  ctx.debug?.calls.push({
    agent: "optimization_decision",
    status: "local",
    details: { expectedGain, continue: cont, reason }
  })

  return { ...ctx, optimization }
}

