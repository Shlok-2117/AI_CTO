import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const HIRING_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 10 — HIRING PLAN

Think as an Engineering Manager and VP of Engineering.
Design the complete technical hiring plan for 3 years.
Every hire must be justified by business need.

Output ONLY this JSON:
{
  "phase": "hiring_plan",
  "hiring_philosophy": "string",
  "year_1": {
    "team_size": 3,
    "hires": [
      {
        "role": "string",
        "when_to_hire": "string",
        "why_this_role_now": "string",
        "skills_required": ["string"],
        "salary_range_usd": "string",
        "can_be_founder": true
      }
    ],
    "total_salary_burn_usd": 0,
    "team_structure": "string"
  },
  "year_2": {
    "team_size": 8,
    "new_hires": [
      {
        "role": "string",
        "trigger": "string",
        "salary_range_usd": "string"
      }
    ],
    "teams_formed": ["string"]
  },
  "year_3": {
    "team_size": 20,
    "specialized_teams": ["string"],
    "leadership_needs": ["string"]
  },
  "hiring_order_reasoning": "string",
  "avoid_early_hiring": ["string"],
  "contractor_vs_fulltime": [
    {
      "function": "string",
      "recommendation": "contractor",
      "reasoning": "string"
    }
  ]
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runHiringPhase(problem: string, architectureData: any, founderData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\nARCHITECTURE: ${JSON.stringify(architectureData, null, 2)}\nBUSINESS CONTEXT: ${JSON.stringify(founderData, null, 2)}\n\nDesign the complete hiring plan. Every hire must be justified. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, HIRING_PROMPT)
  const cleaned = cleanJSON(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Phase 10 JSON parse failed')
  }
}
