import type { AgentContext } from "@/lib/agents/types"
import type { VisionContext } from "@/types/listing"
import { DashscopeError, dashscopeMultimodalJsonWithMeta, getDashscopeVlFallbackModel } from "@/lib/llm/dashscope"

const uniq = (values: string[]) => Array.from(new Set(values.map((v) => v.trim()).filter(Boolean)))

const normalize = (value: string) => value.trim().replace(/\s+/g, " ")

type MultimodalContent = { text?: string; image?: string }

type MultimodalMessage = { role: "system" | "user" | "assistant"; content: string | MultimodalContent[] }

export async function visionAgent(ctx: AgentContext): Promise<AgentContext> {
  const strict = ctx.strict === true
  const image = ctx.input.images[0]

  const fallback: VisionContext = {
    category: "",
    material: "",
    visual_features: [],
    possible_customer: ""
  }

  let result: VisionContext = fallback

  const userText = JSON.stringify(
    {
      product_name: ctx.input.product_name,
      features: ctx.input.features,
      custom_attributes: ctx.input.custom_attributes ?? []
    },
    null,
    2
  )

  const messages: MultimodalMessage[] = [
    {
      role: "system",
      content:
        'You are an Amazon product catalog expert. Analyze the uploaded product image. Output JSON only with keys: {"category":"","material":"","visual_features":[],"possible_customer":""}. Do not generate any listing copy.'
    },
    {
      role: "user",
      content: [{ image: image.dataUrl }, { text: userText }]
    }
  ]

  try {
    const res = await dashscopeMultimodalJsonWithMeta<VisionContext>(messages, { temperature: 0.1, retries: 0 })
    ctx.debug?.calls.push({ agent: "vision", status: "ok", ...res.meta })
    result = res.value
  } catch (err) {
    const meta = err instanceof DashscopeError ? err.meta : undefined
    ctx.debug?.calls.push({
      agent: "vision",
      status: "error",
      ...(meta || {}),
      error: err instanceof Error ? err.message : "Unknown error"
    })
    if (strict) throw err

    const fallbackModel = getDashscopeVlFallbackModel()
    if (fallbackModel) {
      const res = await dashscopeMultimodalJsonWithMeta<VisionContext>(messages, { temperature: 0.1, retries: 0, model: fallbackModel })
      ctx.debug?.calls.push({ agent: "vision", status: "fallback", ...res.meta })
      result = res.value
    } else {
      ctx.debug?.calls.push({ agent: "vision", status: "fallback" })
    }
  }

  const vision: VisionContext = {
    category: normalize(result.category || fallback.category),
    material: normalize(result.material || fallback.material),
    visual_features: Array.isArray(result.visual_features) ? uniq(result.visual_features).slice(0, 12) : fallback.visual_features,
    possible_customer: normalize(result.possible_customer || fallback.possible_customer)
  }

  return { ...ctx, vision }
}
