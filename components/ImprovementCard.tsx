"use client"

import type { ReactNode } from "react"
import type { Priority } from "@/types/listing"

type Props = {
  title: string
  priority: Priority
  description: ReactNode
  meta?: ReactNode
  actionLabel?: string
  onAction?: () => void
  disabled?: boolean
}

const badgeClass = (p: Priority) => {
  if (p === "high") return "bg-red-500/20 text-red-200 border-red-500/30"
  if (p === "medium") return "bg-yellow-500/20 text-yellow-100 border-yellow-500/30"
  return "bg-white/10 text-white/70 border-white/10"
}

export function ImprovementCard({ title, priority, description, meta, actionLabel, onAction, disabled }: Props) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-white/90">{title}</div>
          {meta ? <div className="mt-0.5 text-xs text-white/50">{meta}</div> : null}
        </div>
        <div className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${badgeClass(priority)}`}>
          {priority}
        </div>
      </div>
      <div className="mt-2 text-xs text-white/70">{description}</div>
      {actionLabel && onAction ? (
        <button
          type="button"
          disabled={disabled}
          className="mt-3 rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black disabled:cursor-not-allowed disabled:opacity-40"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  )
}
