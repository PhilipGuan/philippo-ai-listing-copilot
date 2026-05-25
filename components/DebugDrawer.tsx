"use client"

import { useEffect, useMemo, useState } from "react"

type Props = {
  value: unknown
}

export function DebugDrawer({ value }: Props) {
  const [open, setOpen] = useState(false)

  const text = useMemo(() => JSON.stringify(value, null, 2), [value])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open])

  const copy = async () => {
    await navigator.clipboard.writeText(text)
  }

  return (
    <>
      <button
        type="button"
        className="fixed bottom-5 right-5 z-40 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur hover:bg-white/15"
        onClick={() => setOpen(true)}
      >
        Debug
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button type="button" className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-white/10 bg-black/70 backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-4">
              <div className="text-sm font-semibold text-white/90">Debug</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-white/90"
                  onClick={copy}
                >
                  Copy
                </button>
                <button
                  type="button"
                  className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90 hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            <pre className="flex-1 overflow-auto whitespace-pre-wrap break-words p-4 text-xs text-white/70">{text}</pre>
          </div>
        </div>
      ) : null}
    </>
  )
}

