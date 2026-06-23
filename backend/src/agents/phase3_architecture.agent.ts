import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const ARCHITECTURE_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 3 — SYSTEM ARCHITECTURE

You are thinking as the Principal Engineer and System Architect.
Design the complete system architecture based on business and product needs.

For EVERY service, you must justify why it exists, why it is separate, and when it should scale independently.

Output ONLY this JSON:
{
  "phase": "system_architecture",
  "architecture_style": {
    "pattern": "string",
    "justification": "string",
    "evolution_path": "string"
  },
  "services": [
    {
      "name": "string",
      "type": "string",
      "responsibility": "string",
      "why_separate": "string",
      "technology": "string",
      "technology_alternatives": ["string"],
      "technology_reasoning": "string",
      "scales_independently": true,
      "estimated_rps": "string",
      "port": 3000
    }
  ],
  "communication_patterns": [
    {
      "from": "string",
      "to": "string",
      "pattern": "REST",
      "reasoning": "string"
    }
  ],
  "data_flow": "string",
  "third_party_integrations": [
    {
      "service": "string",
      "purpose": "string",
      "fallback": "string"
    }
  ],
  "technical_decisions": [
    {
      "decision": "string",
      "options_considered": ["string"],
      "chosen": "string",
      "reasoning": "string",
      "confidence": 85
    }
  ]
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runArchitecturePhase(problem: string, founderData: any, productData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\n\nFOUNDER ANALYSIS: ${JSON.stringify(founderData, null, 2)}\nPRODUCT STRATEGY: ${JSON.stringify(productData, null, 2)}\n\nDesign the complete system architecture. Every decision must serve the business goals. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, ARCHITECTURE_PROMPT)
  const cleaned = cleanJSON(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Phase 3 JSON parse failed')
  }
}
