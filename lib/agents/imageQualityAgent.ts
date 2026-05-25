import type { AgentContext } from "@/lib/agents/types"
import type { ImageOpportunity, ImageQuality } from "@/types/listing"

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

const includesAny = (values: string[], patterns: RegExp[]) => {
  const text = values.map((v) => v.toLowerCase()).join(" ")
  return patterns.some((p) => p.test(text))
}

const priorityFromScore = (score: number): ImageOpportunity["priority"] => {
  if (score < 65) return "high"
  if (score < 80) return "medium"
  return "low"
}

export async function imageQualityAgent(ctx: AgentContext): Promise<AgentContext> {
  if (!ctx.input.images.length) return ctx

  const visionFeatures = ctx.vision?.visual_features ?? []
  const dataUrlLen = ctx.input.images[0]?.dataUrl?.length ?? 0

  let clarity = 82
  let focus = 84
  let background = 80
  let framing = 82

  if (dataUrlLen && dataUrlLen < 250_000) clarity -= 15
  if (includesAny(visionFeatures, [/blurry/, /blur/, /out of focus/, /soft focus/])) focus -= 22
  if (includesAny(visionFeatures, [/clutter/, /messy/, /busy background/, /noisy background/, /background clutter/])) background -= 25
  if (includesAny(visionFeatures, [/cropped/, /cut off/, /too small/, /far away/])) framing -= 18

  clarity = clamp(clarity)
  focus = clamp(focus)
  background = clamp(background)
  framing = clamp(framing)

  const hero_ctr_score = clamp((clarity + focus + background + framing) / 4)

  const improvement: string[] = []
  const image: ImageOpportunity[] = []

  if (background < 80) {
    improvement.push("Reduce background clutter and use a cleaner backdrop.")
    image.push({
      suggestion: "Use a cleaner hero image background.",
      priority: priorityFromScore(background),
      dimension: "background"
    })
  }
  if (clarity < 80) {
    improvement.push("Improve lighting and sharpness to increase clarity.")
    image.push({
      suggestion: "Improve lighting/sharpness for a clearer hero image.",
      priority: priorityFromScore(clarity),
      dimension: "clarity"
    })
  }
  if (focus < 80) {
    improvement.push("Ensure the product is in focus and avoid motion blur.")
    image.push({
      suggestion: "Retake the photo with the product in focus.",
      priority: priorityFromScore(focus),
      dimension: "focus"
    })
  }
  if (framing < 80) {
    improvement.push("Frame the product larger and avoid cropping key parts.")
    image.push({
      suggestion: "Improve framing so the product fills the frame.",
      priority: priorityFromScore(framing),
      dimension: "framing"
    })
  }
  if (!improvement.length) {
    improvement.push("Hero image looks usable. Consider adding lifestyle and close-up shots for higher CTR.")
    image.push({ suggestion: "Add lifestyle/close-up images to enrich the gallery.", priority: "low", dimension: "hero_ctr" })
  }

  const imageQuality: ImageQuality = { clarity, focus, background, framing, hero_ctr_score, improvement: improvement.slice(0, 6) }

  ctx.debug?.calls.push({
    agent: "image_quality",
    status: "local",
    details: { clarity, focus, background, framing, hero_ctr_score, improvements: improvement.length }
  })

  return { ...ctx, imageQuality, imageOpportunities: image.slice(0, 6) }
}

