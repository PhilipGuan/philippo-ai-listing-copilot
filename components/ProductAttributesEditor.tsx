"use client"

import { useMemo, useState } from "react"
import type { CustomAttributeType } from "@/types/listing"

export type AttributeTemplateId = "size" | "color" | "voltage" | "wattage" | "capacity"

export type ProductAttributeRow = {
  id: string
  key: string
  type: CustomAttributeType
  value: string
  template?: AttributeTemplateId
}

type Props = {
  disabled?: boolean
  value: ProductAttributeRow[]
  onChange: (next: ProductAttributeRow[]) => void
}

const templates: Array<{ id: AttributeTemplateId; label: string; key: string; options: string[] }> = [
  { id: "size", label: "Size", key: "Size", options: ["S", "M", "L", "XL"] },
  { id: "color", label: "Color", key: "Color", options: ["Black", "White", "Gray", "Blue", "Red"] },
  { id: "voltage", label: "Voltage", key: "Voltage", options: ["110V", "220V"] },
  { id: "wattage", label: "Wattage", key: "Wattage", options: ["30W", "60W", "100W"] },
  { id: "capacity", label: "Capacity", key: "Capacity", options: ["Small", "Medium", "Large"] }
]

const makeId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`

const quickKeys = ["Material", "Brand", "Color", "Dimensions"] as const

export function ProductAttributesEditor({ disabled, value, onChange }: Props) {
  const [templateToAdd, setTemplateToAdd] = useState<AttributeTemplateId>("size")

  const templateMap = useMemo(() => new Map(templates.map((t) => [t.id, t])), [])

  const addRow = (partial?: Partial<ProductAttributeRow>) => {
    const next: ProductAttributeRow = {
      id: makeId(),
      key: "",
      type: "text",
      value: "",
      ...partial
    }
    onChange([...value, next])
  }

  const removeRow = (id: string) => onChange(value.filter((r) => r.id !== id))

  const updateRow = (id: string, patch: Partial<ProductAttributeRow>) =>
    onChange(
      value.map((r) => {
        if (r.id !== id) return r
        const next = { ...r, ...patch }
        if (patch.type && patch.type !== "select") return { ...next, template: undefined }
        return next
      })
    )

  const addTemplateRow = (id: AttributeTemplateId) => {
    const t = templateMap.get(id)
    if (!t) return
    addRow({ key: t.key, type: "select", template: t.id, value: t.options[0] ?? "" })
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-white/60">Product Attributes (optional)</div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {quickKeys.map((k) => (
              <button
                key={k}
                type="button"
                disabled={disabled}
                className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                onClick={() => addRow({ key: k, type: "text" })}
              >
                + {k}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <select
              disabled={disabled}
              value={templateToAdd}
              className="rounded-md border border-white/10 bg-black/20 px-2 py-1 text-xs text-white outline-none disabled:cursor-not-allowed disabled:opacity-40"
              onChange={(e) => setTemplateToAdd(e.target.value as AttributeTemplateId)}
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={disabled}
              className="rounded-md border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={() => addTemplateRow(templateToAdd)}
            >
              + Template
            </button>
          </div>

          <button
            type="button"
            disabled={disabled}
            className="rounded-md bg-white px-2.5 py-1 text-xs font-medium text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => addRow()}
          >
            + Add Attribute
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {value.map((row) => {
          const t = row.template ? templateMap.get(row.template) : undefined
          const options = row.type === "select" && t ? t.options : []
          const valueNode =
            row.type === "multiline" ? (
              <textarea
                disabled={disabled}
                className="min-h-[42px] w-full rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-sm text-white outline-none focus:border-white/30"
                value={row.value}
                onChange={(e) => updateRow(row.id, { value: e.target.value })}
              />
            ) : row.type === "select" ? (
              <div className="flex items-center gap-2">
                <select
                  disabled={disabled}
                  value={row.template ?? "size"}
                  className="w-[140px] rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  onChange={(e) => {
                    const nextTemplate = e.target.value as AttributeTemplateId
                    const tpl = templateMap.get(nextTemplate)
                    updateRow(row.id, { template: nextTemplate, value: tpl?.options[0] ?? "" })
                  }}
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <select
                  disabled={disabled}
                  value={row.value}
                  className="flex-1 rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  onChange={(e) => updateRow(row.id, { value: e.target.value })}
                >
                  {options.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <input
                disabled={disabled}
                className="w-full rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-sm text-white outline-none focus:border-white/30"
                value={row.value}
                onChange={(e) => updateRow(row.id, { value: e.target.value })}
              />
            )

          return (
            <div key={row.id} className="grid grid-cols-12 gap-2">
              <div className="col-span-4">
                <input
                  disabled={disabled}
                  placeholder="Key (e.g. Color)"
                  className="w-full rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-sm text-white outline-none focus:border-white/30"
                  value={row.key}
                  onChange={(e) => updateRow(row.id, { key: e.target.value })}
                />
              </div>
              <div className="col-span-3">
                <select
                  disabled={disabled}
                  value={row.type}
                  className="w-full rounded-md border border-white/10 bg-black/20 px-2.5 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  onChange={(e) => updateRow(row.id, { type: e.target.value as CustomAttributeType })}
                >
                  <option value="text">text</option>
                  <option value="multiline">multiline</option>
                  <option value="select">select</option>
                </select>
              </div>
              <div className="col-span-4">{valueNode}</div>
              <div className="col-span-1 flex items-start justify-end">
                <button
                  type="button"
                  disabled={disabled}
                  className="rounded-md border border-white/15 bg-white/5 px-2.5 py-2 text-sm text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => removeRow(row.id)}
                >
                  Del
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
