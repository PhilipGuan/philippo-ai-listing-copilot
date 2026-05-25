import { withRetry } from "@/lib/retryWrapper"

type DashscopeMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

type DashscopeMultimodalContent = {
  text?: string
  image?: string
}

type DashscopeMultimodalMessage = {
  role: "system" | "user" | "assistant"
  content: string | DashscopeMultimodalContent[]
}

const isAbort = (err: unknown) => err instanceof Error && (err.name === "AbortError" || /aborted/i.test(err.message))

export type DashscopeCallMeta = {
  endpoint: string
  model: string
  requestId?: string
  attempts?: number
}

type DashscopeResponse = {
  output?: {
    choices?: Array<{
      message?: {
        content?: unknown
      }
    }>
  }
  request_id?: string
  code?: string
  message?: string
}

export class DashscopeError extends Error {
  meta: DashscopeCallMeta
  status?: number
  code?: string
  constructor(message: string, meta: DashscopeCallMeta, extra?: { status?: number; code?: string }) {
    super(message)
    this.name = "DashscopeError"
    this.meta = meta
    this.status = extra?.status
    this.code = extra?.code
  }
}

const stripFences = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim()

const extractJsonCandidate = (value: string) => {
  const trimmed = stripFences(value)
  const first = trimmed.indexOf("{")
  const last = trimmed.lastIndexOf("}")
  if (first >= 0 && last >= 0 && last > first) return trimmed.slice(first, last + 1)
  return trimmed
}

const stripWrap = (value: string) => value.trim().replace(/^['"`]+/, "").replace(/['"`]+$/, "")

const contentToString = (value: unknown): string | null => {
  if (typeof value === "string") return value
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (typeof item === "string") return item
        if (item && typeof item === "object") {
          const v = item as Record<string, unknown>
          if (typeof v.text === "string") return v.text
          if (typeof v.content === "string") return v.content
        }
        return ""
      })
      .filter(Boolean)
    return parts.length ? parts.join("") : null
  }
  if (value && typeof value === "object") {
    const v = value as Record<string, unknown>
    if (typeof v.text === "string") return v.text
    if (typeof v.content === "string") return v.content
  }
  return null
}

export const getDashscopeTextEndpoint = () => {
  const endpoint = process.env.DASHSCOPE_TEXT_ENDPOINT ? stripWrap(process.env.DASHSCOPE_TEXT_ENDPOINT) : ""
  if (endpoint) return endpoint
  const base = (stripWrap(process.env.DASHSCOPE_BASE_URL || "") || "https://dashscope.aliyuncs.com/api/v1").replace(/\/+$/, "")
  const path = (stripWrap(process.env.DASHSCOPE_TEXT_PATH || "") || "/services/aigc/text-generation/generation").replace(/^\/?/, "/")
  return `${base}${path}`
}

export const getDashscopeMultimodalEndpoint = () => {
  const endpoint = process.env.DASHSCOPE_VL_ENDPOINT ? stripWrap(process.env.DASHSCOPE_VL_ENDPOINT) : ""
  if (endpoint) return endpoint
  const base = (stripWrap(process.env.DASHSCOPE_BASE_URL || "") || "https://dashscope.aliyuncs.com/api/v1").replace(/\/+$/, "")
  const path = (stripWrap(process.env.DASHSCOPE_VL_PATH || "") || "/services/aigc/multimodal-generation/generation").replace(/^\/?/, "/")
  return `${base}${path}`
}

export const getDashscopeModel = () => process.env.QWEN_TEXT_MODEL?.trim() || "qwen3.6-flash"

export const getDashscopeVlModel = () => process.env.QWEN_VL_MODEL?.trim() || "qwen-vl-max"

export const getDashscopeVlFallbackModel = () => process.env.QWEN_VL_FALLBACK_MODEL?.trim() || "qwen-vl-plus"

export const getDashscopeApiKey = () => process.env.DASHSCOPE_API_KEY?.trim() || ""

export async function dashscopeChat(messages: DashscopeMessage[], options?: { temperature?: number }) {
  const { content } = await dashscopeChatWithMeta(messages, options)
  return content
}

export async function dashscopeChatWithMeta(messages: DashscopeMessage[], options?: { temperature?: number }) {
  const apiKey = getDashscopeApiKey()
  if (!apiKey) {
    throw new DashscopeError("Missing DASHSCOPE_API_KEY", { endpoint: getDashscopeTextEndpoint(), model: getDashscopeModel() })
  }

  const endpoint = getDashscopeTextEndpoint()
  const model = getDashscopeModel()

  try {
    const res = await withRetry(
      async (_attempt, signal) => {
        const r = await fetch(endpoint, {
          method: "POST",
          cache: "no-store",
          signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            input: { messages },
            parameters: {
              result_format: "message",
              temperature: options?.temperature ?? 0.2
            }
          })
        })

        const data = (await r.json().catch(() => ({}))) as DashscopeResponse
        const meta: DashscopeCallMeta = { endpoint, model, requestId: data.request_id }

        if (!r.ok) {
          const hint = data?.message || data?.code || `HTTP ${r.status}`
          throw new DashscopeError(hint, meta, { status: r.status, code: data?.code })
        }

        const raw = data.output?.choices?.[0]?.message?.content
        const content = contentToString(raw)
        if (!content) {
          throw new DashscopeError("Empty model response", meta, { status: r.status, code: data?.code })
        }

        return { content, meta }
      },
      {
        maxRetry: 2,
        timeoutMs: 15000,
        delayMs: (attempt, err) => {
          const status = err instanceof DashscopeError ? err.status : undefined
          if (status === 429) return 1500
          return attempt >= 3 ? 1500 : 0
        },
        shouldRetry: (_attempt, err) => {
          if (isAbort(err)) return true
          if (err instanceof DashscopeError) {
            if (err.status === 429) return true
            if (typeof err.status === "number" && err.status >= 500) return true
          }
          return false
        }
      }
    )

    res.value.meta.attempts = res.attempts
    return res.value
  } catch (err) {
    if (err instanceof DashscopeError) {
      const attempts = (err as { attempts?: number }).attempts
      if (typeof attempts === "number") err.meta.attempts = attempts
    }
    throw err
  }
}

export async function dashscopeJson<T>(messages: DashscopeMessage[], options?: { temperature?: number; retries?: number }): Promise<T> {
  const { value } = await dashscopeJsonWithMeta<T>(messages, options)
  return value
}

export async function dashscopeJsonWithMeta<T>(
  messages: DashscopeMessage[],
  options?: { temperature?: number; retries?: number }
): Promise<{ value: T; meta: DashscopeCallMeta }> {
  try {
    const res = await withRetry(
      async (_attempt, _signal) => {
        const { content, meta } = await dashscopeChatWithMeta(messages, { temperature: options?.temperature })
        const candidate = extractJsonCandidate(content)
        try {
          return { value: JSON.parse(candidate) as T, meta }
        } catch {
          throw new DashscopeError("Model output invalid. Please retry.", meta)
        }
      },
      {
        maxRetry: 2,
        timeoutMs: 15000,
        delayMs: (attempt, err) => {
          const status = err instanceof DashscopeError ? err.status : undefined
          if (status === 429) return 1500
          return attempt >= 3 ? 1500 : 0
        },
        shouldRetry: (_attempt, err) => {
          if (isAbort(err)) return true
          if (err instanceof DashscopeError) {
            if (err.status === 429) return true
            if (typeof err.status === "number" && err.status >= 500) return true
            if (/Model output invalid/i.test(err.message)) return true
          }
          return false
        }
      }
    )

    res.value.meta.attempts = res.attempts
    return res.value
  } catch (err) {
    if (err instanceof DashscopeError) {
      const attempts = (err as { attempts?: number }).attempts
      if (typeof attempts === "number") err.meta.attempts = attempts
    }
    throw err
  }
}

export async function dashscopeMultimodalChatWithMeta(
  messages: DashscopeMultimodalMessage[],
  options?: { temperature?: number; model?: string }
): Promise<{ content: string; meta: DashscopeCallMeta }> {
  const apiKey = getDashscopeApiKey()
  if (!apiKey) {
    throw new DashscopeError("Missing DASHSCOPE_API_KEY", { endpoint: getDashscopeMultimodalEndpoint(), model: options?.model || getDashscopeVlModel() })
  }

  const endpoint = getDashscopeMultimodalEndpoint()
  const model = options?.model || getDashscopeVlModel()

  try {
    const res = await withRetry(
      async (_attempt, signal) => {
        const r = await fetch(endpoint, {
          method: "POST",
          cache: "no-store",
          signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            input: { messages },
            parameters: {
              result_format: "message",
              temperature: options?.temperature ?? 0.1
            }
          })
        })

        const data = (await r.json().catch(() => ({}))) as DashscopeResponse
        const meta: DashscopeCallMeta = { endpoint, model, requestId: data.request_id }

        if (!r.ok) {
          const hint = data?.message || data?.code || `HTTP ${r.status}`
          throw new DashscopeError(hint, meta, { status: r.status, code: data?.code })
        }

        const raw = data.output?.choices?.[0]?.message?.content
        const content = contentToString(raw)
        if (!content) {
          throw new DashscopeError("Empty model response", meta, { status: r.status, code: data?.code })
        }

        return { content, meta }
      },
      {
        maxRetry: 2,
        timeoutMs: 15000,
        delayMs: (attempt, err) => {
          const status = err instanceof DashscopeError ? err.status : undefined
          if (status === 429) return 1500
          return attempt >= 3 ? 1500 : 0
        },
        shouldRetry: (_attempt, err) => {
          if (isAbort(err)) return true
          if (err instanceof DashscopeError) {
            if (err.status === 429) return true
            if (typeof err.status === "number" && err.status >= 500) return true
          }
          return false
        }
      }
    )

    res.value.meta.attempts = res.attempts
    return res.value
  } catch (err) {
    if (err instanceof DashscopeError) {
      const attempts = (err as { attempts?: number }).attempts
      if (typeof attempts === "number") err.meta.attempts = attempts
    }
    throw err
  }
}

export async function dashscopeMultimodalJsonWithMeta<T>(
  messages: DashscopeMultimodalMessage[],
  options?: { temperature?: number; retries?: number; model?: string }
): Promise<{ value: T; meta: DashscopeCallMeta }> {
  try {
    const res = await withRetry(
      async (_attempt, _signal) => {
        const { content, meta } = await dashscopeMultimodalChatWithMeta(messages, {
          temperature: options?.temperature,
          model: options?.model
        })
        const candidate = extractJsonCandidate(content)
        try {
          return { value: JSON.parse(candidate) as T, meta }
        } catch {
          throw new DashscopeError("Model output invalid. Please retry.", meta)
        }
      },
      {
        maxRetry: 2,
        timeoutMs: 15000,
        delayMs: (attempt, err) => {
          const status = err instanceof DashscopeError ? err.status : undefined
          if (status === 429) return 1500
          return attempt >= 3 ? 1500 : 0
        },
        shouldRetry: (_attempt, err) => {
          if (isAbort(err)) return true
          if (err instanceof DashscopeError) {
            if (err.status === 429) return true
            if (typeof err.status === "number" && err.status >= 500) return true
            if (/Model output invalid/i.test(err.message)) return true
          }
          return false
        }
      }
    )

    res.value.meta.attempts = res.attempts
    return res.value
  } catch (err) {
    if (err instanceof DashscopeError) {
      const attempts = (err as { attempts?: number }).attempts
      if (typeof attempts === "number") err.meta.attempts = attempts
    }
    throw err
  }
}
