"use client"

import { useEffect, useState } from "react"

type Props = {
  images: File[]
}

export function ImageCarousel({ images }: Props) {
  const [previews, setPreviews] = useState<Array<{ file: File; name: string; url: string }>>([])
  const [active, setActive] = useState(0)

  useEffect(() => {
    const next = images.slice(0, 5).map((file) => ({ file, name: file.name, url: URL.createObjectURL(file) }))
    setPreviews(next)
    setActive(0)
    return () => {
      next.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [images])

  if (!previews.length) return null

  const main = previews[Math.min(active, previews.length - 1)]

  return (
    <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-white/60">Preview</div>
      <div className="overflow-hidden rounded-md border border-white/10 bg-black/30">
        <img
          src={main.url}
          alt={main.name}
          className="h-64 w-full object-contain"
          onError={() => {
            setPreviews((prev) => {
              const idx = Math.min(active, prev.length - 1)
              const current = prev[idx]
              if (!current) return prev
              const url = URL.createObjectURL(current.file)
              URL.revokeObjectURL(current.url)
              const next = prev.slice()
              next[idx] = { ...current, url }
              return next
            })
          }}
        />
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {previews.map((u, idx) => (
          <button
            key={u.url}
            type="button"
            className={[
              "overflow-hidden rounded-md border bg-black/30",
              idx === active ? "border-white/40" : "border-white/10 hover:border-white/30"
            ].join(" ")}
            onMouseEnter={() => setActive(idx)}
            onClick={() => setActive(idx)}
          >
            <img src={u.url} alt={u.name} className="h-14 w-14 object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}
