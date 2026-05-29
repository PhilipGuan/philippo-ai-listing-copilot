"use client"

import { useRef, useState } from "react"
import { LoadingState } from "@/components/LoadingState"
import { ProductForm, type ProductFormValue } from "@/components/ProductForm"
import type { ListingResult } from "@/types/listing"
import { ResultPanel } from "@/components/ResultPanel"
import { OptimizationPanel } from "@/components/OptimizationPanel"
import { DebugDrawer } from "@/components/DebugDrawer"

export default function HomePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ListingResult | null>(null)
  const [previousResult, setPreviousResult] = useState<ListingResult | null>(null)
  const [debugInfo, setDebugInfo] = useState<unknown | null>(null)
  const [appliedKeywords, setAppliedKeywords] = useState<string[]>([])
  const [appliedSeo, setAppliedSeo] = useState<string[]>([])
  const [productInput, setProductInput] = useState<ProductFormValue>({
    product_name: "",
    featuresText: "",
    customAttributes: [],
    marketplace: "US",
    target_audience: ""
  })
  const [images, setImages] = useState<File[]>([])
  const featuresRef = useRef<HTMLTextAreaElement>(null!)

  const erase = () => {
    setError(null)
    setResult(null)
    setPreviousResult(null)
    setDebugInfo(null)
    setAppliedKeywords([])
    setAppliedSeo([])
  }

  const applyKeyword = (keyword: string) => {
    const normalized = keyword.trim()
    if (!normalized) return

    setProductInput((v) => {
      const lines = v.featuresText
        .split(/\r?\n/g)
        .map((x) => x.trim())
        .filter(Boolean)
      const exists = lines.some((x) => x.toLowerCase() === normalized.toLowerCase())
      const next = exists ? lines : [...lines, normalized]
      return { ...v, featuresText: next.join("\n") }
    })

    setAppliedKeywords((prev) => {
      const exists = prev.some((k) => k.toLowerCase() === normalized.toLowerCase())
      return exists ? prev : [...prev, normalized]
    })

    requestAnimationFrame(() => {
      featuresRef.current?.focus()
      featuresRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
    })
  }

  const normalizeLine = (value: string) => value.trim().replace(/\s+/g, " ")

  const seoPrefix = (type: string) => {
    if (type === "primary_keyword") return "[SEO:Primary Keyword]"
    if (type === "search_intent") return "[SEO:Search Intent]"
    if (type === "feature_expand") return "[SEO:Feature]"
    if (type === "customer_expand") return "[SEO:Customer]"
    if (type === "long_tail_keyword") return "[SEO:Long Tail]"
    return "[SEO]"
  }

  const applySeoOpportunity = (payload: { type: string; keyword: string }) => {
    const term = payload.keyword.trim()
    if (!term) return
    const line = normalizeLine(`${seoPrefix(payload.type)} ${term}`)
    const key = `${payload.type}:${term.toLowerCase()}`

    setProductInput((v) => {
      const lines = v.featuresText
        .split(/\r?\n/g)
        .map((x) => normalizeLine(x))
        .filter(Boolean)
      const exists = lines.some((x) => x.toLowerCase() === line.toLowerCase())
      const next = exists ? lines : [...lines, line]
      return { ...v, featuresText: next.join("\n") }
    })

    setAppliedSeo((prev) => (prev.includes(key) ? prev : [...prev, key]))

    requestAnimationFrame(() => {
      featuresRef.current?.focus()
      featuresRef.current?.scrollIntoView({ block: "center", behavior: "smooth" })
    })
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-10 lg:h-screen lg:gap-4 lg:py-6 lg:overflow-hidden">
      <header className="space-y-2">
        <div className="text-2xl font-semibold tracking-tight text-white">Philippo AI Listing Copilot</div>
        <div className="text-sm text-white/60">Upload images and product info to generate an Amazon-ready listing (Mock pipeline).</div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:flex-1 lg:min-h-0 lg:h-full lg:grid-cols-3 lg:overflow-hidden">
        <div className="lg:min-h-0 lg:overflow-auto lg:overscroll-contain">
          <ProductForm
            disabled={loading}
            value={productInput}
            onChange={setProductInput}
            images={images}
            onImagesChange={setImages}
            featuresRef={featuresRef}
            onSubmit={async ({ value, images }) => {
              setError(null)
              setResult(null)
              setDebugInfo(null)
              setLoading(true)
              try {
                const form = new FormData()
                images.forEach((f) => form.append("images", f, f.name))
                form.append("product_name", value.product_name)
                form.append(
                  "features",
                  JSON.stringify(
                    value.featuresText
                      .split(/\r?\n/g)
                      .map((v) => v.trim())
                      .filter(Boolean)
                  )
                )
                form.append("marketplace", value.marketplace)
                if (value.target_audience.trim()) form.append("target_audience", value.target_audience.trim())
                if (value.customAttributes.length) {
                  const rows = value.customAttributes
                    .map((r) => ({ key: r.key.trim(), type: r.type, value: r.value }))
                    .filter((r) => r.key.length > 0)
                  if (rows.length) form.append("custom_attributes", JSON.stringify(rows))
                }

                const res = await fetch("/api/generate?debug=1", { method: "POST", body: form })
                const data = await res.json()
                if (!res.ok) {
                  setError(typeof data?.message === "string" ? data.message : "Please retry.")
                  setDebugInfo(data?._debug ?? null)
                  return
                }
                const { _debug, ...rest } = data as Record<string, unknown>
                setDebugInfo(_debug ?? null)
                const next = rest as ListingResult
                setResult((prev) => {
                  setPreviousResult(prev)
                  if (!prev) return next
                  const delta = {
                    overall: next.evaluation.overall - prev.evaluation.overall,
                    seo: next.evaluation.dimension.seo - prev.evaluation.dimension.seo,
                    feature: next.evaluation.dimension.feature - prev.evaluation.dimension.feature,
                    compliance: next.evaluation.dimension.compliance - prev.evaluation.dimension.compliance,
                    readability: next.evaluation.dimension.readability - prev.evaluation.dimension.readability,
                    image:
                      typeof next.image_quality?.hero_ctr_score === "number" && typeof prev.image_quality?.hero_ctr_score === "number"
                        ? next.image_quality.hero_ctr_score - prev.image_quality.hero_ctr_score
                        : undefined
                  }
                  return { ...next, delta }
                })
              } catch {
                setError("Please retry.")
                setResult(null)
                setPreviousResult(null)
                setDebugInfo(null)
              } finally {
                setLoading(false)
              }
            }}
          />
        </div>

        <div className="lg:min-h-0 lg:overflow-auto lg:overscroll-contain">
          {result ? (
            <OptimizationPanel
              current={result}
              previous={previousResult}
              disabled={loading}
              onApplyKeyword={applyKeyword}
              appliedKeywords={appliedKeywords}
              onApplySeoOpportunity={applySeoOpportunity}
              appliedSeo={appliedSeo}
            />
          ) : (
            <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              Generate a listing to see optimization opportunities.
            </div>
          )}
        </div>

        <div className="space-y-4 lg:min-h-0 lg:overflow-auto lg:overscroll-contain">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm font-semibold text-white/80">Generated Listing</div>
            <button
              type="button"
              className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white/90 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={loading || (!result && !error)}
              onClick={erase}
            >
              Erase
            </button>
          </div>

          {loading ? <LoadingState /> : null}
          {error ? <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div> : null}
          {result ? <ResultPanel value={result} onChange={setResult} /> : null}
          {!loading && !error && !result ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
              Fill the form and click Generate to see the result.
            </div>
          ) : null}
        </div>
      </div>

      <footer className="text-xs text-white/40">
        Listing generation uses DashScope text generation. The system does not persist historical outputs or input context across runs.
      </footer>

      <DebugDrawer value={debugInfo} />
    </main>
  )
}
