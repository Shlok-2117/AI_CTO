import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const FOUNDER_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 1 — FOUNDER MINDSET

You are thinking as the Founder and CEO of this startup.
Before writing a single line of code or choosing any technology,
you must deeply understand the business.

Analyze the startup idea and output ONLY this JSON:
{
  "phase": "founder_mindset",
  "startup_identity": {
    "one_line_pitch": "string",
    "problem_statement": "string",
    "why_now": "string",
    "unfair_advantage": "string"
  },
  "customer": {
    "primary_persona": {
      "name": "string",
      "age_range": "string",
      "pain_points": ["string"],
      "current_alternatives": ["string"],
      "willingness_to_pay": "string"
    },
    "secondary_persona": {
      "name": "string",
      "pain_points": ["string"]
    }
  },
  "business_model": {
    "revenue_streams": ["string"],
    "primary_model": "string",
    "pricing_strategy": "string",
    "unit_economics": {
      "estimated_cac": "string",
      "estimated_ltv": "string",
      "ltv_cac_ratio": "string"
    }
  },
  "revenue_milestones": {
    "first_100_dollars": "string",
    "first_10k_monthly": "string",
    "first_100k_monthly": "string",
    "first_1m_arr": "string"
  },
  "mvp_definition": {
    "must_have_features": ["string"],
    "should_have_features": ["string"],
    "must_NOT_build": ["string"],
    "mvp_timeline_weeks": 12,
    "success_metrics": ["string"]
  },
  "market": {
    "tam": "string",
    "sam": "string",
    "som": "string",
    "competitors": [
      {
        "name": "string",
        "weakness": "string"
      }
    ]
  }
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runFounderPhase(problem: string): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\n\nAnalyze this as the Founder. Think deeply about the business before any technology. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, FOUNDER_PROMPT)
  return JSON.parse(cleanJSON(raw))
}
