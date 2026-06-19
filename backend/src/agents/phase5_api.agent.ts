import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const API_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 5 — API DESIGN

Think as a Principal API Architect.
Design production-grade APIs considering versioning, rate limiting, idempotency, and developer experience.

Output ONLY this JSON:
{
  "phase": "api_design",
  "api_strategy": {
    "style": "REST",
    "versioning": "string",
    "authentication": "string",
    "base_url": "string",
    "rate_limiting": {
      "anonymous": "string",
      "authenticated": "string",
      "premium": "string"
    }
  },
  "endpoints": [
    {
      "path": "string",
      "method": "POST",
      "description": "string",
      "auth_required": true,
      "rate_limited": true,
      "idempotent": false,
      "request_body": {},
      "response": {},
      "status_codes": {},
      "caching": "string",
      "notes": "string"
    }
  ],
  "webhook_design": {
    "events": ["string"],
    "retry_strategy": "string",
    "security": "string"
  },
  "error_handling": {
    "error_format": {
      "error": "string",
      "code": "string",
      "message": "string",
      "details": {}
    },
    "error_codes": [
      {
        "code": "string",
        "http_status": 400,
        "description": "string"
      }
    ]
  }
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runAPIPhase(problem: string, architectureData: any, databaseData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\nARCHITECTURE: ${JSON.stringify(architectureData, null, 2)}\nDATABASE: ${JSON.stringify(databaseData, null, 2)}\n\nDesign production-grade APIs. Think about developer experience and scale. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, API_PROMPT)
  return JSON.parse(cleanJSON(raw))
}
