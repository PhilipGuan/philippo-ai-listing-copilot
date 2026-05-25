import type { GenerateRequest, ListingResult } from "@/types/listing"
import type { AgentContext, AgentCallDebug } from "@/lib/agents/types"
import { getDashscopeModel, getDashscopeTextEndpoint } from "@/lib/llm/dashscope"
import { languageAgent } from "@/lib/agents/languageAgent"
import { visionAgent } from "@/lib/agents/visionAgent"
import { productAgent } from "@/lib/agents/productAgent"
import { contextMergeAgent } from "@/lib/agents/contextMergeAgent"
import { keywordAgent } from "@/lib/agents/keywordAgent"
import { seoAgent } from "@/lib/agents/seoAgent"
import { complianceAgent } from "@/lib/agents/complianceAgent"
import { evaluationAgent } from "@/lib/agents/evaluation"
import { keywordGapAgent } from "@/lib/agents/keywordGapAgent"
import { formatterAgent } from "@/lib/agents/formatterAgent"
import { imageQualityAgent } from "@/lib/agents/imageQualityAgent"
import { keywordOpportunityAgent } from "@/lib/agents/keywordOpportunityAgent"
import { gapDiscoveryAgent } from "@/lib/agents/gapDiscoveryAgent"
import { optimizationDecisionAgent } from "@/lib/agents/optimizationDecisionAgent"
import { seoWeaknessAnalysisAgent } from "@/lib/agents/seoWeaknessAnalysisAgent"
import { searchIntentExpansionAgent } from "@/lib/agents/searchIntentExpansionAgent"
import { featureExpansionAgent } from "@/lib/agents/featureExpansionAgent"
import { customerIntentExpansionAgent } from "@/lib/agents/customerIntentExpansionAgent"
import { seoOpportunityRankingAgent } from "@/lib/agents/seoOpportunityRankingAgent"

export type PipelineDebug = {
  strict: boolean
  model: string
  endpoint: string
  calls: AgentCallDebug[]
}

export class PipelineError extends Error {
  debug: PipelineDebug
  constructor(message: string, debug: PipelineDebug) {
    super(message)
    this.name = "PipelineError"
    this.debug = debug
  }
}

export async function runPipeline(
  input: GenerateRequest,
  options?: { debug?: boolean; strict?: boolean }
): Promise<{ result: ListingResult; debug?: PipelineDebug }> {
  const strict = options?.strict ?? process.env.STRICT_LLM === "1"
  const debugEnabled = options?.debug ?? false
  const calls: AgentCallDebug[] = []

  let ctx: AgentContext = {
    input,
    strict,
    debug: debugEnabled ? { calls } : undefined
  }

  const buildDebug = (): PipelineDebug => ({
    strict,
    model: getDashscopeModel(),
    endpoint: getDashscopeTextEndpoint(),
    calls
  })

  try {
    ctx = await languageAgent(ctx)
    ctx = await visionAgent(ctx)
    ctx = await productAgent(ctx)
    ctx = await contextMergeAgent(ctx)
    ctx = await keywordAgent(ctx)
    ctx = await seoAgent(ctx)
    ctx = await complianceAgent(ctx)
    ctx = await formatterAgent(ctx)
    ctx = await evaluationAgent(ctx)
    ctx = await keywordGapAgent(ctx)
    ctx = await formatterAgent(ctx)
    ctx = await imageQualityAgent(ctx)
    ctx = await keywordOpportunityAgent(ctx)
    ctx = await gapDiscoveryAgent(ctx)
    ctx = await optimizationDecisionAgent(ctx)
    ctx = await formatterAgent(ctx)
    ctx = await seoWeaknessAnalysisAgent(ctx)
    ctx = await searchIntentExpansionAgent(ctx)
    ctx = await featureExpansionAgent(ctx)
    ctx = await customerIntentExpansionAgent(ctx)
    ctx = await seoOpportunityRankingAgent(ctx)
    ctx = await formatterAgent(ctx)

    if (!ctx.result) {
      throw new Error("Generation failed")
    }

    const debug: PipelineDebug | undefined = debugEnabled ? buildDebug() : undefined
    return { result: ctx.result, debug }
  } catch (err) {
    if (debugEnabled) {
      throw new PipelineError(err instanceof Error ? err.message : "Please retry.", buildDebug())
    }
    throw err
  }
}
