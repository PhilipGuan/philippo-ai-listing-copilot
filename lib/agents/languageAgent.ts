import type { AgentContext, LanguageCode } from "@/lib/agents/types"
import { DashscopeError, dashscopeJsonWithMeta } from "@/lib/llm/dashscope"

const hasCjk = (value: string) => /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(value)

export async function languageAgent(ctx: AgentContext): Promise<AgentContext> {
  const combined = [
    ctx.input.product_name,
    ctx.input.material,
    ctx.input.brand ?? "",
    ctx.input.color ?? "",
    ctx.input.dimensions ?? "",
    ctx.input.target_audience ?? "",
    ctx.input.features.join(" ")
  ].join(" ")

  const fallback: LanguageCode = hasCjk(combined) ? "zh" : "en"

  const strict = ctx.strict === true

  let result: { language: LanguageCode } = { language: fallback }
  try {
    const res = await dashscopeJsonWithMeta<{ language: LanguageCode }>(
      [
        {
          role: "system",
          content: 'Detect the input language. Output JSON only: {"language":"zh"} or {"language":"en"}.'
        },
        {
          role: "user",
          content: combined
        }
      ],
      { temperature: 0, retries: 1 }
    )
    ctx.debug?.calls.push({ agent: "language", status: "ok", ...res.meta })
    result = res.value
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "language",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    if (strict) throw err
  }

  const language: LanguageCode = result.language === "zh" || result.language === "en" ? result.language : fallback
  return { ...ctx, language }
}
