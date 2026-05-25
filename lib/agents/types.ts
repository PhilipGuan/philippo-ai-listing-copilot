import type {
  ComplianceResult,
  GenerateRequest,
  ImageOpportunity,
  ImageQuality,
  KeywordOpportunity,
  ListingEvaluation,
  ListingResult,
  SeoEngineResult,
  OptimizationResult,
  Opportunity,
  SeoOpportunity,
  VisionContext
} from "@/types/listing"

export type LanguageCode = "zh" | "en"

export type AgentCallDebug = {
  agent:
    | "language"
    | "vision"
    | "product"
    | "merge"
    | "keyword"
    | "seo"
    | "compliance"
    | "evaluation"
    | "keyword_gap"
    | "image_quality"
    | "keyword_opportunity"
    | "gap_discovery"
    | "optimization_decision"
    | "seo_weakness"
    | "search_intent"
    | "feature_expand"
    | "customer_expand"
    | "seo_rank"
    | "formatter"
  status: "ok" | "fallback" | "error" | "local"
  endpoint?: string
  model?: string
  requestId?: string
  attempts?: number
  error?: string
  details?: Record<string, unknown>
}

export type ProductUnderstanding = {
  category: string
  material: string
  selling_points: string[]
  target_customer: string
}

export type KeywordIntelligence = {
  primary_keywords: string[]
  secondary_keywords: string[]
  long_tail_keywords: string[]
}

export type SeoDraft = {
  title: string
  bullets: string[]
  description: string
  keywords: string[]
}

export type AgentContext = {
  input: GenerateRequest
  strict?: boolean
  language?: LanguageCode
  vision?: VisionContext
  product?: ProductUnderstanding
  keywords?: KeywordIntelligence
  seoDraft?: SeoDraft
  compliance?: ComplianceResult
  evaluation?: ListingEvaluation
  seoOpportunity?: SeoOpportunity
  imageQuality?: ImageQuality
  keywordOpportunities?: KeywordOpportunity[]
  imageOpportunities?: ImageOpportunity[]
  opportunities?: Opportunity[]
  optimization?: OptimizationResult
  seoEngine?: SeoEngineResult
  debug?: {
    calls: AgentCallDebug[]
  }
  result?: ListingResult
}
