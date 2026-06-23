import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const PRODUCT_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 2 — PRODUCT STRATEGY

You are thinking as the Head of Product.
Given the founder analysis, design the complete product strategy.

Output ONLY this JSON:
{
  "phase": "product_strategy",
  "user_journey": {
    "awareness": "string",
    "activation": "string",
    "retention": "string",
    "revenue": "string",
    "referral": "string"
  },
  "core_features": [
    {
      "feature": "string",
      "user_story": "string",
      "priority": "P0",
      "effort": "Low",
      "impact": "High"
    }
  ],
  "growth_strategy": {
    "acquisition_channels": ["string"],
    "viral_loop": "string",
    "network_effects": "string",
    "content_strategy": "string"
  },
  "metrics": {
    "north_star_metric": "string",
    "primary_metrics": [
      {
        "metric": "string",
        "definition": "string",
        "target_month_3": "string",
        "target_month_12": "string"
      }
    ],
    "vanity_metrics_to_avoid": ["string"]
  },
  "product_risks": [
    {
      "risk": "string",
      "likelihood": "Medium",
      "mitigation": "string"
    }
  ]
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runProductPhase(problem: string, founderData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\n\nFOUNDER ANALYSIS:\n${JSON.stringify(founderData, null, 2)}\n\nNow think as the Product Manager. Design the complete product strategy. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, PRODUCT_PROMPT)
  const cleaned = cleanJSON(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Phase 2 JSON parse failed')
  }
}
