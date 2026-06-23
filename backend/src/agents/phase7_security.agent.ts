import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const SECURITY_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 7 — SECURITY REVIEW

Think as a Security Architect. Think like a hacker first.
How would YOU attack this system? Then design defenses.

Output ONLY this JSON:
{
  "phase": "security_review",
  "threat_model": {
    "attack_surfaces": ["string"],
    "most_valuable_assets": ["string"],
    "likely_attackers": ["string"]
  },
  "risk_score": "High",
  "owasp_coverage": [
    {
      "threat": "string",
      "risk_level": "High",
      "mitigation": "string",
      "implemented_by": "string"
    }
  ],
  "checklist": {
    "authentication": [
      {
        "item": "string",
        "priority": "critical",
        "implementation": "string"
      }
    ],
    "authorization": [
      {
        "item": "string",
        "priority": "critical",
        "implementation": "string"
      }
    ],
    "api_security": [
      {
        "item": "string",
        "priority": "high",
        "implementation": "string"
      }
    ],
    "data_security": [
      {
        "item": "string",
        "priority": "high",
        "implementation": "string"
      }
    ],
    "infrastructure": [
      {
        "item": "string",
        "priority": "medium",
        "implementation": "string"
      }
    ]
  },
  "compliance": {
    "required": ["string"],
    "timeline": "string",
    "estimated_cost": "string"
  },
  "top_3_risks": ["string"],
  "security_roadmap": [
    {
      "phase": "Week 1",
      "actions": ["string"]
    }
  ]
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runSecurityPhase(problem: string, architectureData: any, apiData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\nARCHITECTURE: ${JSON.stringify(architectureData, null, 2)}\nAPI DESIGN: ${JSON.stringify(apiData, null, 2)}\n\nThink like a hacker, then like a security architect. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, SECURITY_PROMPT)
  const cleaned = cleanJSON(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Phase 7 JSON parse failed')
  }
}
