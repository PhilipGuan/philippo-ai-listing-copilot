"use client"

import { useEffect, useMemo, useState, type RefObject } from "react"
import type { Marketplace } from "@/types/listing"
import { ImageCarousel } from "@/components/ImageCarousel"

export type ProductFormValue = {
  product_name: string
  material: string
  featuresText: string
  marketplace: Marketplace
  brand: string
  color: string
  dimensions: string
  target_audience: string
}

type Props = {
  disabled?: boolean
  value: ProductFormValue
  onChange: (next: ProductFormValue) => void
  images: File[]
  onImagesChange: (next: File[]) => void
  featuresRef?: RefObject<HTMLTextAreaElement>
  onSubmit: (payload: { value: ProductFormValue; images: File[] }) => void
}

const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"])

const parseFeatures = (text: string) =>
  text
    .split(/\r?\n/g)
    .map((v) => v.trim())
    .filter(Boolean)

const ext = (name: string) => {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/)
  return m?.[1] ?? ""
}

const isAllowed = (file: File) => {
  if (allowedMime.has(file.type)) return true
  const e = ext(file.name)
  return e === "jpg" || e === "jpeg" || e === "png" || e === "webp"
}

export function ProductForm({ disabled, onSubmit, value, onChange, images, onImagesChange, featuresRef }: Props) {
  const [imageErrors, setImageErrors] = useState<string[]>([])
  const [imageWarnings, setImageWarnings] = useState<string[]>([])

  const featuresCount = useMemo(() => parseFeatures(value.featuresText).length, [value.featuresText])

  useEffect(() => {
    if (!images.length) {
      setImageErrors([])
      setImageWarnings([])
    }
  }, [images.length])

  const validateImages = async (files: File[]) => {
    const errors: string[] = []
    const warnings: string[] = []

    if (files.length < 1) errors.push("Please upload at least 1 image.")
    if (files.length > 5) errors.push("Please upload up to 5 images.")

    for (const f of files) {
      if (!isAllowed(f)) errors.push(`Unsupported format: ${f.name}. Use JPG/JPEG, PNG, or WebP.`)
      if (f.size > 10 * 1024 * 1024) warnings.push(`Large file: ${f.name} (>10MB). Upload may be slow.`)
      if (f.size < 80 * 1024) warnings.push(`Low file size: ${f.name} (<80KB). Image may be too low quality.`)
      try {
        const bmp = await createImageBitmap(f)
        const shortest = Math.min(bmp.width, bmp.height)
        if (shortest < 800) warnings.push(`Low resolution: ${f.name} (shortest side < 800px).`)
        bmp.close()
      } catch {
        warnings.push(`Cannot read image resolution: ${f.name}.`)
      }
    }

    setImageErrors(errors)
    setImageWarnings(warnings)
    return { errors, warnings }
  }

  const canSubmit = useMemo(() => {
    if (disabled) return false
    if (!value.product_name.trim()) return false
    if (!value.material.trim()) return false
    if (featuresCount < 1) return false
    if (images.length < 1 || images.length > 5) return false
    if (imageErrors.length) return false
    return true
  }, [disabled, value.product_name, value.material, featuresCount, images.length, imageErrors.length])

  return (
    <form
      className="w-full space-y-4 rounded-xl border border-white/10 bg-white/5 p-4"
      onSubmit={async (e) => {
        e.preventDefault()
        const { errors } = await validateImages(images)
        if (errors.length) return
        onSubmit({ value, images })
      }}
    >
      <div className="text-sm font-semibold text-white/90">Product Input</div>

      <div className="space-y-2">
        <div className="text-xs text-white/60">Product Images (1~5)</div>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          className="block w-full text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-black hover:file:bg-white/90"
          onChange={async (e) => {
            const input = e.currentTarget
            const next = Array.from(input.files ?? []).slice(0, 5)
            input.value = ""
            onImagesChange(next)
            await validateImages(next)
          }}
        />
        {images.length ? <ImageCarousel images={images} /> : null}
        {imageErrors.length ? (
          <ul className="space-y-1 text-xs text-red-300">
            {imageErrors.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        ) : null}
        {imageWarnings.length ? (
          <ul className="space-y-1 text-xs text-yellow-200/90">
            {imageWarnings.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs text-white/60">Product Name</div>
          <input
            disabled={disabled}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={value.product_name}
            onChange={(e) => onChange({ ...value, product_name: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-white/60">Material</div>
          <input
            disabled={disabled}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={value.material}
            onChange={(e) => onChange({ ...value, material: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-white/60">Key Features (one per line)</div>
          <div className="text-xs text-white/50">{featuresCount} items</div>
        </div>
        <textarea
          ref={featuresRef ?? undefined}
          disabled={disabled}
          className="min-h-[120px] w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          value={value.featuresText}
          onChange={(e) => onChange({ ...value, featuresText: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs text-white/60">Marketplace</div>
          <select
            disabled
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none"
            value={value.marketplace}
            onChange={(e) => onChange({ ...value, marketplace: e.target.value as Marketplace })}
          >
            <option value="US">US</option>
          </select>
        </div>
        <div className="space-y-2">
          <div className="text-xs text-white/60">Brand (optional)</div>
          <input
            disabled={disabled}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={value.brand}
            onChange={(e) => onChange({ ...value, brand: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <div className="text-xs text-white/60">Color (optional)</div>
          <input
            disabled={disabled}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={value.color}
            onChange={(e) => onChange({ ...value, color: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs text-white/60">Dimensions (optional)</div>
          <input
            disabled={disabled}
            className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
            value={value.dimensions}
            onChange={(e) => onChange({ ...value, dimensions: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs text-white/60">Target Audience (optional)</div>
        <input
          disabled={disabled}
          className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none focus:border-white/30"
          value={value.target_audience}
          onChange={(e) => onChange({ ...value, target_audience: e.target.value })}
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
      >
        Generate
      </button>
    </form>
  )
}
