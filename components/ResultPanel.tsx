"use client"

import type { ListingResult } from "@/types/listing"

type Props = {
  value: ListingResult
  onChange: (next: ListingResult) => void
}

const formatForCopy = (result: ListingResult) => {
  const bullets = result.bullets.map((b) => `- ${b}`).join("\n")
  const suggestions = result.evaluation.improvement.length
    ? ["", "Suggestions:", ...result.evaluation.improvement.map((s) => `- ${s}`)]
    : []
  const keywordGap = result.seo_opportunity?.missing?.length
    ? [
        "",
        "SEO Opportunity (Missing Keywords):",
        ...result.seo_opportunity.missing.map((m) => `- [${m.severity}] ${m.keyword} (Recommended: ${m.recommendedPlacement})`)
      ]
    : []
  const optimizationKeyword = result.optimization?.keyword?.length
    ? [
        "",
        "Optimization (Keyword):",
        ...result.optimization.keyword.map((k) => `- [${k.priority}] ${k.keyword} (Recommended: ${k.recommended_position})`)
      ]
    : []
  const optimizationImage = result.optimization?.image?.length
    ? ["", "Optimization (Image):", ...result.optimization.image.map((i) => `- [${i.priority}] ${i.suggestion}`)]
    : []
  const seoEngine = result.seo_engine
  const seoEngineWeakness = seoEngine?.weakness?.length
    ? ["", "SEO Engine (Weakness):", ...seoEngine.weakness.map((w) => `- [${w.severity}] ${w.type}: ${w.reason}`)]
    : []
  const seoEngineOpp = seoEngine?.opportunity?.length
    ? ["", "SEO Engine (Opportunity):", ...seoEngine.opportunity.map((o) => `- [#${o.priority}] ${o.keyword} (${o.type}, +${o.estimated_gain})`)]
    : []
  const imageQuality = result.image_quality
    ? [
        "",
        `Image Quality: hero=${result.image_quality.hero_ctr_score} (clarity ${result.image_quality.clarity}, focus ${result.image_quality.focus}, background ${result.image_quality.background}, framing ${result.image_quality.framing})`,
        ...(result.image_quality.improvement?.length ? ["Image Suggestions:", ...result.image_quality.improvement.map((s) => `- ${s}`)] : [])
      ]
    : []
  const delta = result.delta
    ? [
        "",
        `Delta: overall ${result.delta.overall}${result.delta.seo != null ? `, seo ${result.delta.seo}` : ""}${
          result.delta.feature != null ? `, feature ${result.delta.feature}` : ""
        }${result.delta.readability != null ? `, readability ${result.delta.readability}` : ""}${
          result.delta.compliance != null ? `, compliance ${result.delta.compliance}` : ""
        }${result.delta.image != null ? `, image ${result.delta.image}` : ""}`
      ]
    : []
  return [
    `Title: ${result.title}`,
    "",
    "Bullets:",
    bullets,
    "",
    "Description:",
    result.description,
    "",
    `Backend Keywords: ${result.keywords.join(", ")}`,
    "",
    `Compliance Risk: ${result.compliance.risk}`,
    ...(result.compliance.warning.length ? ["Warnings:", ...result.compliance.warning.map((w) => `- ${w}`)] : []),
    "",
    `Evaluation: ${result.evaluation.overall}/100 (SEO ${result.evaluation.dimension.seo}, Feature ${result.evaluation.dimension.feature}, Compliance ${result.evaluation.dimension.compliance}, Readability ${result.evaluation.dimension.readability})`,
    ...suggestions,
    ...keywordGap,
    ...optimizationKeyword,
    ...optimizationImage,
    ...seoEngineWeakness,
    ...seoEngineOpp,
    ...imageQuality,
    ...delta
  ].join("\n")
}

export function ResultPanel({ value, onChange }: Props) {
  const copyAll = async () => {
    await navigator.clipboard.writeText(formatForCopy(value))
  }

  return (
    <div className="w-full space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white/90">Generated Listing</div>
        <button
          type="button"
          className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black hover:bg-white/90"
          onClick={copyAll}
        >
          Copy All
        </button>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-white/60">Title</div>
        <input
          className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-white/60">Bullet Points (5)</div>
        <div className="space-y-2">
          {value.bullets.map((b, idx) => (
            <input
              key={idx}
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
              value={b}
              onChange={(e) => {
                const next = value.bullets.slice()
                next[idx] = e.target.value
                onChange({ ...value, bullets: next })
              }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-white/60">Description</div>
        <textarea
          className="min-h-[160px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          value={value.description}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <div className="text-xs text-white/60">Backend Keywords (comma separated)</div>
        <input
          className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          value={value.keywords.join(", ")}
          onChange={(e) =>
            onChange({
              ...value,
              keywords: e.target.value
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean)
            })
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="text-xs text-white/60">Compliance</div>
          <div className="mt-1 text-sm text-white/90">Risk: {value.compliance.risk}</div>
          {value.compliance.warning.length ? (
            <ul className="mt-2 space-y-1 text-xs text-white/70">
              {value.compliance.warning.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          ) : (
            <div className="mt-2 text-xs text-white/60">No warnings</div>
          )}
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-3">
          <div className="text-xs text-white/60">Evaluation</div>
          <div className="mt-1 text-sm text-white/90">Overall: {value.evaluation.overall}/100</div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/70">
            <div>SEO: {value.evaluation.dimension.seo}</div>
            <div>Feature: {value.evaluation.dimension.feature}</div>
            <div>Compliance: {value.evaluation.dimension.compliance}</div>
            <div>Readability: {value.evaluation.dimension.readability}</div>
          </div>
          {value.evaluation.improvement.length ? (
            <div className="mt-3">
              <div className="text-xs text-white/60">Suggestions</div>
              <ul className="mt-2 space-y-1 text-xs text-white/70">
                {value.evaluation.improvement.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-3 text-xs text-white/60">No suggestions</div>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-white/10 bg-black/20 p-3">
        <div className="text-xs text-white/60">SEO Opportunity</div>
        {value.seo_opportunity?.missing?.length ? (
          <ul className="mt-2 space-y-1 text-xs text-white/70">
            {value.seo_opportunity.missing.map((m, i) => (
              <li key={i}>
                <span className="text-white/80">[{m.severity}]</span> {m.keyword}{" "}
                <span className="text-white/50">(Recommended: {m.recommendedPlacement})</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-2 text-xs text-white/60">No missing keywords detected</div>
        )}
      </div>
    </div>
  )
}
