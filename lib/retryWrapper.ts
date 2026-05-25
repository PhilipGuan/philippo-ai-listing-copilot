const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export type RetryResult<T> = {
  value: T
  attempts: number
}

export async function withRetry<T>(
  task: (attempt: number, signal: AbortSignal) => Promise<T>,
  options?: {
    maxRetry?: number
    timeoutMs?: number
    maxTotalDelayMs?: number
    shouldRetry?: (attempt: number, err: unknown) => boolean
    delayMs?: (attempt: number, err: unknown) => number
  }
) {
  const maxRetry = options?.maxRetry ?? 2
  let lastErr: unknown = null
  let delayed = 0
  let lastAttempt = 0

  for (let attempt = 1; attempt <= 1 + maxRetry; attempt++) {
    lastAttempt = attempt
    if (attempt > 1) {
      const d = Math.max(0, Math.floor(options?.delayMs ? options.delayMs(attempt, lastErr) : 0))
      const maxTotal = options?.maxTotalDelayMs ?? 8000
      const safe = Math.max(0, Math.min(d, maxTotal - delayed))
      delayed += safe
      if (safe > 0) await sleep(safe)
    }

    const controller = new AbortController()
    const timeout = options?.timeoutMs ? setTimeout(() => controller.abort(), options.timeoutMs) : null
    try {
      const v = await task(attempt, controller.signal)
      if (timeout) clearTimeout(timeout)
      return { value: v, attempts: attempt } satisfies RetryResult<T>
    } catch (err) {
      if (timeout) clearTimeout(timeout)
      lastErr = err
      if (attempt >= 1 + maxRetry) break
      if (options?.shouldRetry && !options.shouldRetry(attempt, err)) break
    }
  }

  if (lastErr && typeof lastErr === "object") {
    ;(lastErr as { attempts?: number }).attempts = lastAttempt
  }
  throw lastErr instanceof Error ? lastErr : new Error("Retry failed")
}
