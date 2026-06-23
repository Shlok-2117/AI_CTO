import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const DEVOPS_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 8 — DEVOPS & INFRASTRUCTURE

Think as a Senior DevOps/SRE Engineer.
Design the complete deployment, monitoring, and operational strategy.

Output ONLY this JSON:
{
  "phase": "devops",
  "repository": {
    "strategy": "string",
    "branching_model": "string",
    "code_review_policy": "string",
    "branch_protection": ["string"]
  },
  "ci_cd": {
    "platform": "string",
    "pipeline_stages": [
      {
        "stage": "string",
        "actions": ["string"],
        "estimated_duration_mins": 5
      }
    ],
    "deployment_strategy": "string",
    "rollback_strategy": "string",
    "deployment_frequency": "string"
  },
  "infrastructure": {
    "cloud_provider": "string",
    "regions": ["string"],
    "iac_tool": "string",
    "container_strategy": "string",
    "service_mesh": "string"
  },
  "observability": {
    "logging": {
      "tool": "string",
      "retention_days": 30,
      "log_levels": ["string"]
    },
    "metrics": {
      "tool": "string",
      "key_metrics": ["string"]
    },
    "tracing": {
      "tool": "string",
      "sampling_rate": "string"
    },
    "alerting": {
      "tool": "string",
      "critical_alerts": ["string"],
      "on_call_strategy": "string"
    },
    "dashboards": ["string"]
  },
  "environments": [
    {
      "name": "string",
      "purpose": "string",
      "infrastructure": "string",
      "data": "string"
    }
  ]
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runDevOpsPhase(problem: string, architectureData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\nARCHITECTURE: ${JSON.stringify(architectureData, null, 2)}\n\nDesign the complete DevOps and infrastructure strategy. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, DEVOPS_PROMPT)
  const cleaned = cleanJSON(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Phase 8 JSON parse failed')
  }
}
