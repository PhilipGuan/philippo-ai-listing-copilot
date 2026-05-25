import { useEffect, useMemo, useState } from "react"

type Props = {
  label?: string
  stages?: string[]
}

export function LoadingState({ label, stages }: Props) {
  const steps = useMemo(
    () =>
      stages?.length
        ? stages
        : [
            "Generating listing",
            "Evaluating",
            "SEO weakness analysis",
            "Search intent expansion",
            "Feature expansion",
            "Customer expansion",
            "Ranking opportunities",
            "Finalizing"
          ],
    [stages]
  )

  const [index, setIndex] = useState(0)
  const [elapsedSec, setElapsedSec] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const tick = window.setInterval(() => {
      const sec = Math.floor((Date.now() - start) / 1000)
      setElapsedSec(sec)
      setIndex((i) => (i + 1) % Math.max(1, steps.length))
    }, 4500)
    return () => window.clearInterval(tick)
  }, [steps.length])

  const stage = steps[index] ?? label ?? "Working"

  return (
    <div className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      <div className="flex items-center justify-between gap-3">
        <div className="font-medium text-white/90">LLM is working — {stage}</div>
        <div className="text-xs text-white/50">{elapsedSec}s</div>
      </div>
      {elapsedSec >= 20 ? <div className="mt-3 text-xs text-white/60">This may take longer than usual. Still working...</div> : null}
    </div>
  )
}
