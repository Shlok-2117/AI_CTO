import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const SCALING_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 6 — SCALING ROADMAP & RELIABILITY

Think as a Cloud Architect and SRE.
Design the complete scaling roadmap from 0 to 100M users.
Also design for reliability — what fails and how do we survive it.

Output ONLY this JSON:
{
  "phase": "scaling_reliability",
  "scaling_stages": [
    {
      "stage": 1,
      "users": "string",
      "monthly_active_users": 0,
      "infrastructure": "string",
      "database": "string",
      "caching": "string",
      "cdn": "string",
      "estimated_monthly_cost_usd": 0,
      "bottleneck": "string",
      "migration_trigger": "string"
    }
  ],
  "reliability": {
    "rto": "string",
    "rpo": "string",
    "target_uptime": "string",
    "failure_scenarios": [
      {
        "scenario": "string",
        "probability": "Medium",
        "impact": "string",
        "detection": "string",
        "recovery": "string",
        "prevention": "string"
      }
    ],
    "backup_strategy": "string",
    "disaster_recovery": "string",
    "chaos_engineering": "string"
  },
  "performance_targets": {
    "api_p99_latency_ms": 500,
    "api_p95_latency_ms": 200,
    "page_load_time_ms": 3000,
    "database_query_p99_ms": 100
  }
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runScalingPhase(problem: string, architectureData: any, founderData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\nARCHITECTURE: ${JSON.stringify(architectureData, null, 2)}\nBUSINESS CONTEXT: ${JSON.stringify(founderData, null, 2)}\n\nDesign the complete scaling roadmap and reliability plan. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, SCALING_PROMPT)
  return JSON.parse(cleanJSON(raw))
}
