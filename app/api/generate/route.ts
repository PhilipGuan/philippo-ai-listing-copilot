import { NextResponse } from "next/server"
import type { GenerateRequest } from "@/types/listing"
import { PipelineError, runPipeline } from "@/lib/agents/pipeline"
import { DashscopeError, getDashscopeModel, getDashscopeTextEndpoint } from "@/lib/llm/dashscope"

const allowedMime = new Set(["image/jpeg", "image/png", "image/webp"])

const parseString = (value: FormDataEntryValue | null) => (typeof value === "string" ? value : "")

const toDataUrl = async (file: File) => {
  const buf = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buf.toString("base64")}`
}

const parseFeatures = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return []
  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean)
  } catch {}
  return trimmed
    .split(/\r?\n/g)
    .map((v) => v.trim())
    .filter(Boolean)
}

const parseCustomAttributes = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  try {
    const parsed = JSON.parse(trimmed)
    if (!Array.isArray(parsed)) return undefined
    const allowed = new Set(["text", "multiline", "select"])
    const normalized = parsed
      .map((v) => v as Record<string, unknown>)
      .map((v) => ({
        key: typeof v.key === "string" ? v.key.trim() : "",
        type: typeof v.type === "string" ? v.type : "text",
        value: typeof v.value === "string" ? v.value : ""
      }))
      .filter((v) => v.key.length > 0 && allowed.has(v.type))
      .map((v) => ({ ...v, type: v.type as "text" | "multiline" | "select" }))
    return normalized.length ? normalized : undefined
  } catch {
    return undefined
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url)
  const strict = process.env.STRICT_LLM === "1"
  const debug = url.searchParams.get("debug") === "1" || process.env.DEBUG_LLM === "1" || strict || process.env.NODE_ENV !== "production"

  try {
    const form = await req.formData()
    const images = form.getAll("images").filter((v): v is File => v instanceof File)

    if (images.length < 1) {
      return NextResponse.json({ message: "Please upload image." }, { status: 400 })
    }
    if (images.length > 5) {
      return NextResponse.json({ message: "Please upload up to 5 images." }, { status: 400 })
    }

    for (const image of images) {
      if (!allowedMime.has(image.type)) {
        return NextResponse.json({ message: "Unsupported image format. Please upload JPG/JPEG, PNG, or WebP." }, { status: 400 })
      }
    }

    const product_name = parseString(form.get("product_name")).trim()
    const material = parseString(form.get("material")).trim()
    const featuresRaw = parseString(form.get("features"))
    const customAttributesRaw = parseString(form.get("custom_attributes"))
    const marketplaceRaw = parseString(form.get("marketplace")).trim()

    if (!product_name) {
      return NextResponse.json({ message: "Missing product name." }, { status: 400 })
    }

    const features = parseFeatures(featuresRaw)
    if (features.length < 1) {
      return NextResponse.json({ message: "Missing features." }, { status: 400 })
    }

    if (marketplaceRaw !== "US") {
      return NextResponse.json({ message: "Unsupported marketplace." }, { status: 400 })
    }

    const imageInputs = await Promise.all(images.slice(0, 1).map(async (img) => ({ mime: img.type, dataUrl: await toDataUrl(img) })))
    const custom_attributes = parseCustomAttributes(customAttributesRaw)

    const input: GenerateRequest = {
      product_name,
      material: material || undefined,
      features,
      marketplace: "US",
      brand: parseString(form.get("brand")).trim() || undefined,
      color: parseString(form.get("color")).trim() || undefined,
      dimensions: parseString(form.get("dimensions")).trim() || undefined,
      target_audience: parseString(form.get("target_audience")).trim() || undefined,
      custom_attributes,
      images: imageInputs
    }

    const { result, debug: dbg } = await runPipeline(input, { debug, strict })
    if (debug && dbg) {
      return NextResponse.json({ ...result, _debug: dbg }, { status: 200 })
    }
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    let msg = err instanceof Error ? err.message : "Please retry."
    if (err instanceof Error && err.name === "AbortError") {
      msg = "Generation timeout. Please retry."
    } else if (err instanceof DashscopeError) {
      if (/Model output invalid/i.test(err.message)) {
        msg = "Model output invalid. Please retry."
      } else if (err.status === 429 || (typeof err.status === "number" && err.status >= 500)) {
        msg = "Temporary service issue. Please retry."
      }
    }

    const payload: Record<string, unknown> = { message: msg || "Please retry." }
    if (debug) {
      if (err instanceof PipelineError) {
        payload._debug = err.debug
      } else {
        payload._debug = {
          strict,
          model: getDashscopeModel(),
          endpoint: getDashscopeTextEndpoint(),
          calls: []
        }
      }
    }
    return NextResponse.json(payload, { status: 500 })
  }
}
