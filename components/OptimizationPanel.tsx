"use client"

import type { ListingResult } from "@/types/listing"
import { ImprovementCard } from "@/components/ImprovementCard"
import { DeltaCompare } from "@/components/DeltaCompare"

type Props = {
  current: ListingResult
  previous: ListingResult | null
  disabled?: boolean
  onApplyKeyword?: (keyword: string) => void
  appliedKeywords?: string[]
  onApplySeoOpportunity?: (payload: { type: string; keyword: string }) => void
  appliedSeo?: string[]
}

export function OptimizationPanel({ current, previous, disabled, onApplyKeyword, appliedKeywords, onApplySeoOpportunity, appliedSeo }: Props) {
  const keyword = current.optimization?.keyword ?? []
  const image = current.optimization?.image ?? []
  const imageQuality = current.image_quality
  const decision = current.optimization
  const applyTarget = "Key Features"
  const applied = new Set((appliedKeywords ?? []).map((k) => k.toLowerCase()))
  const appliedSeoSet = new Set(appliedSeo ?? [])
  const seoEngine = current.seo_engine
  const seoOps = seoEngine?.opportunity ?? []

  const impactLabel = (pos: string) => {
    if (pos === "Title") return "Title"
    if (pos === "Description") return "Description"
    return "Bullets"
  }

  const seoPriority = (gain: number) => {
    if (gain >= 10) return "high" as const
    if (gain >= 6) return "medium" as const
    return "low" as const
  }

  return (
    <div className="w-full space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-sm font-semibold text-white/90">Optimization Opportunity</div>

      <div className="grid grid-cols-1 gap-3">
        {seoOps.length ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-white/60">SEO Opportunity Engine</div>
              {typeof seoEngine?.continue === "boolean" ? (
                <div className="text-xs text-white/50">{seoEngine.continue ? "Continue" : "Near complete"}</div>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {seoOps.map((o, i) => {
                const seoKey = `${o.type}:${o.keyword.toLowerCase()}`
                const isApplied = appliedSeoSet.has(seoKey)
                return (
                  <ImprovementCard
                    key={`${o.type}-${o.keyword}-${i}`}
                    title={o.keyword}
                    priority={seoPriority(o.estimated_gain)}
                    meta={
                      <div className="space-y-1">
                        <div>Type: {o.type}</div>
                        <div>Estimated gain: +{o.estimated_gain} SEO</div>
                        <div>Rank: {o.priority}</div>
                        <div>Apply: {applyTarget}</div>
                        {isApplied ? <div>Applied</div> : null}
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-white/80">Inject this term into seller input to improve SEO coverage.</div>
                        {isApplied ? (
                          <div>Already applied. Click Generate again to verify improvement.</div>
                        ) : (
                          <div>Apply will write into {applyTarget}.</div>
                        )}
                      </div>
                    }
                    actionLabel={onApplySeoOpportunity ? (isApplied ? "Applied" : "Apply") : undefined}
                    disabled={disabled || isApplied}
                    onAction={onApplySeoOpportunity ? () => onApplySeoOpportunity({ type: o.type, keyword: o.keyword }) : undefined}
                  />
                )
              })}
            </div>
            {seoEngine?.reason ? <div className="text-xs text-white/60">Continue Decision: {seoEngine.reason}</div> : null}
          </div>
        ) : null}

        {keyword.length ? (
          <div className="space-y-2">
            <div className="text-xs text-white/60">Keyword Opportunity</div>
            <div className="grid grid-cols-1 gap-2">
              {keyword.map((k, i) => {
                const isApplied = applied.has(k.keyword.trim().toLowerCase())
                const impact = impactLabel(k.recommended_position)
                return (
                  <ImprovementCard
                    key={`${k.keyword}-${i}`}
                    title={k.keyword}
                    priority={k.priority}
                    meta={
                      <div className="space-y-1">
                        <div>Impact: {impact}</div>
                        <div>Apply: {applyTarget}</div>
                        {isApplied ? <div>Applied before (still missing)</div> : null}
                      </div>
                    }
                    description={
                      <div className="space-y-1">
                        <div className="text-white/80">Improves generated {impact}.</div>
                        {isApplied ? <div>Already applied. Click Generate again to verify improvement.</div> : <div>Apply will add this keyword into {applyTarget} input.</div>}
                      </div>
                    }
                    actionLabel={onApplyKeyword ? (isApplied ? "Applied" : "Apply") : undefined}
                    disabled={disabled || isApplied}
                    onAction={onApplyKeyword ? () => onApplyKeyword(k.keyword) : undefined}
                  />
                )
              })}
            </div>
          </div>
        ) : null}

        {imageQuality || image.length ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-white/60">Image Opportunity</div>
              {typeof imageQuality?.hero_ctr_score === "number" ? (
                <div className="text-xs text-white/50">Hero score: {imageQuality.hero_ctr_score}</div>
              ) : null}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {image.map((o, i) => (
                <ImprovementCard
                  key={`${o.suggestion}-${i}`}
                  title={o.dimension ? `Image: ${o.dimension}` : "Image Improvement"}
                  priority={o.priority}
                  description={o.suggestion}
                />
              ))}
            </div>
            {imageQuality?.improvement?.length ? (
              <ul className="mt-2 space-y-1 text-xs text-white/60">
                {imageQuality.improvement.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <DeltaCompare previous={previous} current={current} />

        {decision ? (
          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
            <div className="text-xs text-white/60">Continue Decision</div>
            <div className="mt-2 text-sm text-white/90">{decision.continue ? "Further optimization opportunity exists." : "Optimization near complete."}</div>
            <div className="mt-1 text-xs text-white/60">{decision.reason}</div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
