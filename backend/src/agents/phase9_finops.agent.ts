import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const FINOPS_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 9 — FINOPS & COST ANALYSIS

Think as a FinOps Engineer and CFO simultaneously.
Every dollar of infrastructure cost must be justified by revenue potential.

Output ONLY this JSON:
{
  "phase": "finops",
  "cost_philosophy": "string",
  "tiers": {
    "mvp": {
      "description": "string",
      "monthly_usd": 50,
      "services": [
        {
          "name": "string",
          "provider": "string",
          "tier": "string",
          "cost_usd": 0,
          "justification": "string"
        }
      ],
      "runway_months_on_10k": 200,
      "free_tier_used": ["string"]
    },
    "growth": {
      "description": "string",
      "monthly_usd": 500,
      "services": [
        {
          "name": "string",
          "cost_usd": 0,
          "justification": "string"
        }
      ]
    },
    "scale": {
      "description": "string",
      "monthly_usd": 5000,
      "services": [
        {
          "name": "string",
          "cost_usd": 0,
          "justification": "string"
        }
      ]
    }
  },
  "cost_breakdown": {
    "compute": 0,
    "database": 0,
    "storage": 0,
    "networking": 0,
    "ai_apis": 0,
    "monitoring": 0,
    "other": 0
  },
  "optimization_opportunities": [
    {
      "opportunity": "string",
      "current_cost": 0,
      "optimized_cost": 0,
      "savings_percent": 0,
      "effort": "Low",
      "implementation": "string"
    }
  ],
  "cost_per_user": {
    "at_1k_users": "string",
    "at_10k_users": "string",
    "at_100k_users": "string"
  },
  "revenue_vs_infra": {
    "break_even_users": 0,
    "target_infra_as_percent_revenue": "string"
  },
  "cost_saving_tips": ["string"],
  "free_tier_eligible": ["string"]
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runFinOpsPhase(problem: string, architectureData: any, founderData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\nARCHITECTURE: ${JSON.stringify(architectureData, null, 2)}\nBUSINESS MODEL: ${JSON.stringify(founderData?.business_model, null, 2)}\n\nDesign the complete cost strategy. Every dollar must make business sense. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, FINOPS_PROMPT)
  return JSON.parse(cleanJSON(raw))
}
