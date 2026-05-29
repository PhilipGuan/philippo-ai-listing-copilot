export type Marketplace = "US"

export type ComplianceRisk = "low" | "medium" | "high"

export type ComplianceResult = {
  risk: ComplianceRisk
  warning: string[]
}

export type ListingEvaluation = {
  overall: number
  dimension: {
    seo: number
    feature: number
    compliance: number
    readability: number
  }
  improvement: string[]
}

export type Priority = "high" | "medium" | "low"

export type SeoWeaknessType = "primary_keyword" | "feature_coverage" | "customer_intent" | "usage_scenario" | "search_intent"

export type SeoWeaknessSeverity = "critical" | "high" | "medium" | "low"

export type SeoWeakness = {
  type: SeoWeaknessType
  severity: SeoWeaknessSeverity
  reason: string
}

export type SeoRankedOpportunityType = "primary_keyword" | "search_intent" | "feature_expand" | "customer_expand" | "long_tail_keyword"

export type SeoRankedOpportunity = {
  type: SeoRankedOpportunityType
  keyword: string
  estimated_gain: number
  priority: number
}

export type SeoEngineResult = {
  weakness: SeoWeakness[]
  search_intent: string[]
  feature_expand: string[]
  customer: string[]
  opportunity: SeoRankedOpportunity[]
  continue?: boolean
  reason?: string
}

export type KeywordOpportunity = {
  keyword: string
  priority: Priority
  recommended_position: "Title" | "Bullet Point" | "Description"
}

export type ImageOpportunity = {
  suggestion: string
  priority: Priority
  dimension?: "clarity" | "focus" | "background" | "framing" | "hero_ctr"
}

export type Opportunity = {
  type: "keyword" | "image"
  priority: Priority
  reason: string
  suggestion: string
  meta?: Record<string, unknown>
}

export type ImageQuality = {
  clarity: number
  focus: number
  background: number
  framing: number
  hero_ctr_score: number
  improvement: string[]
}

export type OptimizationResult = {
  opportunities: Opportunity[]
  keyword: KeywordOpportunity[]
  image: ImageOpportunity[]
  continue: boolean
  reason: string
}

export type ListingDelta = {
  overall: number
  seo?: number
  feature?: number
  compliance?: number
  readability?: number
  image?: number
}

export type ListingResult = {
  title: string
  bullets: string[]
  description: string
  keywords: string[]
  compliance: ComplianceResult
  evaluation: ListingEvaluation
  seo_opportunity?: SeoOpportunity
  seo_engine?: SeoEngineResult
  vision_context?: VisionContext
  image_quality?: ImageQuality
  optimization?: OptimizationResult
  delta?: ListingDelta
}

export type SeoOpportunity = {
  missing: Array<{
    keyword: string
    severity: "high" | "medium" | "low"
    recommendedPlacement: "Title" | "Bullet 1" | "Bullet 2" | "Bullet 3" | "Bullet 4" | "Bullet 5" | "Description"
  }>
}

export type VisionContext = {
  category: string
  material: string
  visual_features: string[]
  possible_customer: string
}

export type ImageInput = {
  mime: string
  dataUrl: string
}

export type CustomAttributeType = "text" | "multiline" | "select"

export type CustomAttribute = {
  key: string
  type: CustomAttributeType
  value: string
}

export type GenerateRequest = {
  product_name: string
  material?: string
  features: string[]
  marketplace: Marketplace
  brand?: string
  color?: string
  dimensions?: string
  target_audience?: string
  custom_attributes?: CustomAttribute[]
  images: ImageInput[]
}
