import type { AgentContext } from "@/lib/agents/types"
import type { ComplianceResult, ComplianceRisk } from "@/types/listing"

const prohibitedTerms = [
  "best",
  "perfect",
  "100% guaranteed",
  "guaranteed",
  "medical",
  "treatment",
  "cure",
  "heal",
  "doctor",
  "clinically proven"
]

const detect = (text: string) => {
  const lower = text.toLowerCase()
  return prohibitedTerms.filter((t) => lower.includes(t))
}

const riskFromHits = (hits: string[]): ComplianceRisk => {
  if (hits.length >= 3) return "high"
  if (hits.length >= 1) return "medium"
  return "low"
}

export async function complianceAgent(ctx: AgentContext): Promise<AgentContext> {
  const content = [ctx.seoDraft?.title ?? "", ...(ctx.seoDraft?.bullets ?? []), ctx.seoDraft?.description ?? ""].join("\n")
  const hits = detect(content)

  const compliance: ComplianceResult = {
    risk: riskFromHits(hits),
    warning: hits.map((h) => `Contains prohibited or risky claim: ${h}`)
  }

  ctx.debug?.calls.push({ agent: "compliance", status: "local" })
  return { ...ctx, compliance }
}
