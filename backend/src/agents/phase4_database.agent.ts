import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const DATABASE_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 4 — DATA MODELING

Think as a Principal Database Architect.
Design a production-grade data model that handles current needs, 10x growth, GDPR compliance, performance at scale, and future migrations.

Output ONLY this JSON:
{
  "phase": "data_modeling",
  "database_strategy": {
    "primary_database": "string",
    "primary_reasoning": "string",
    "caching_layer": "string",
    "search_engine": "string",
    "analytics_store": "string",
    "file_storage": "string"
  },
  "tables": [
    {
      "name": "string",
      "purpose": "string",
      "columns": [
        {
          "name": "string",
          "type": "string",
          "constraints": ["string"],
          "description": "string",
          "pii": false
        }
      ],
      "indexes": [
        {
          "columns": ["string"],
          "type": "btree",
          "reason": "string"
        }
      ],
      "relationships": [
        {
          "type": "hasMany",
          "table": "string",
          "via": "string"
        }
      ],
      "soft_delete": true,
      "audit_trail": false,
      "estimated_rows_year1": "string"
    }
  ],
  "data_considerations": {
    "gdpr_fields": ["string"],
    "encryption_at_rest": ["string"],
    "data_retention_policy": "string",
    "backup_strategy": "string",
    "migration_strategy": "string"
  },
  "sql_preview": "string",
  "normalization": "string"
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runDatabasePhase(problem: string, architectureData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\nARCHITECTURE: ${JSON.stringify(architectureData, null, 2)}\n\nDesign the complete data model. Think about scale, compliance, and future migrations. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, DATABASE_PROMPT)
  const cleaned = cleanJSON(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Phase 4 JSON parse failed')
  }
}
