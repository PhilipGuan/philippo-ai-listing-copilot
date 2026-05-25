"use client"

import type { ListingResult } from "@/types/listing"

type Props = {
  previous: ListingResult | null
  current: ListingResult
}

const fmt = (n: number) => {
  const sign = n > 0 ? "+" : ""
  return `${sign}${Math.round(n)}`
}

export function DeltaCompare({ previous, current }: Props) {
  if (!previous) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="text-xs text-white/60">Delta Compare</div>
        <div className="mt-2 text-xs text-white/60">Run Generate again to see optimization impact.</div>
      </div>
    )
  }

  const delta = current.delta
  const overall = delta?.overall ?? current.evaluation.overall - previous.evaluation.overall
  const seo = delta?.seo ?? current.evaluation.dimension.seo - previous.evaluation.dimension.seo
  const feature = delta?.feature ?? current.evaluation.dimension.feature - previous.evaluation.dimension.feature
  const compliance = delta?.compliance ?? current.evaluation.dimension.compliance - previous.evaluation.dimension.compliance
  const readability = delta?.readability ?? current.evaluation.dimension.readability - previous.evaluation.dimension.readability
  const image =
    delta?.image ??
    (typeof current.image_quality?.hero_ctr_score === "number" && typeof previous.image_quality?.hero_ctr_score === "number"
      ? current.image_quality.hero_ctr_score - previous.image_quality.hero_ctr_score
      : 0)

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-white/60">Delta Compare</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
        <div>Previous: {previous.evaluation.overall}</div>
        <div>Current: {current.evaluation.overall}</div>
      </div>
      <div className="mt-2 text-sm font-semibold text-white/90">Overall {fmt(overall)}</div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
        <div>SEO {fmt(seo)}</div>
        <div>Feature {fmt(feature)}</div>
        <div>Compliance {fmt(compliance)}</div>
        <div>Readability {fmt(readability)}</div>
        <div>Image {fmt(image)}</div>
      </div>
    </div>
  )
}

