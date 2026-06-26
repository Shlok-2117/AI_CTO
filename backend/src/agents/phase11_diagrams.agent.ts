import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const DIAGRAMS_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 11 — DIAGRAMS

Generate architecture diagrams in valid Mermaid.js syntax.

STRICT RULES — follow exactly:
1. Use ONLY ASCII characters — no unicode, no smart quotes
2. Use ONLY --> for arrows (two dashes + greater than)
3. Node IDs: alphanumeric only, no spaces (use underscore)
4. Node labels: use square brackets [Label Text]
5. Keep it simple — max 8 nodes per diagram
6. No subgraphs — flat structure only
7. No special characters in labels: & < > ' "

VALID EXAMPLE — copy this style exactly:
graph TD
    Client[Web Client] --> Gateway[API Gateway]
    Gateway --> Auth[Auth Service]
    Gateway --> Core[Core Service]
    Core --> DB[(PostgreSQL)]
    Core --> Cache[(Redis)]

ER DIAGRAM VALID EXAMPLE:
erDiagram
    USER {
        uuid id
        string email
        string name
    }
    ORDER {
        uuid id
        uuid user_id
        string status
    }
    USER ||--o{ ORDER : places

SEQUENCE VALID EXAMPLE:
sequenceDiagram
    actor User
    participant App
    participant API
    participant DB
    User->>App: Login Request
    App->>API: POST /auth/login
    API->>DB: Find User
    DB-->>API: User Found
    API-->>App: JWT Token
    App-->>User: Success

Return JSON with these exact keys:
{
  "architecture": "graph TD\\n    Client[Web Client] --> Gateway[API Gateway]\\n    Gateway --> Auth[Auth Service]",
  "er_diagram": "erDiagram\\n    USER {\\n        uuid id\\n        string email\\n    }",
  "sequence": "sequenceDiagram\\n    actor User\\n    participant API\\n    User->>API: Request\\n    API-->>User: Response"
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runDiagramsPhase(problem: string, architectureData: any, databaseData: any): Promise<any> {
  const serviceNames = architectureData?.services?.map((s: any) => s.name).join(', ') || 'Services'
  const tableNames = databaseData?.tables?.map((t: any) => t.name).join(', ') || 'Tables'
  const prompt = `STARTUP IDEA: ${problem}\nSERVICES: ${serviceNames}\nTABLES: ${tableNames}\n\nGenerate valid Mermaid diagrams for this system. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, DIAGRAMS_PROMPT)
  const cleaned = cleanJSON(raw)
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Phase 11 JSON parse failed')
  }
}
