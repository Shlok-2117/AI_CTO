import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const DIAGRAMS_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 11 — DIAGRAMS

Generate valid Mermaid diagram syntax for all 3 diagrams.
Use \\n for newlines inside strings.
Keep diagrams clean and readable.

Output ONLY this JSON:
{
  "phase": "diagrams",
  "architecture": "graph TD\\n    Client[React Frontend]-->API[API Gateway]\\n    API-->Auth[Auth Service]\\n    API-->Core[Core Service]",
  "er_diagram": "erDiagram\\n    USER ||--o{ ORDER : places\\n    ORDER ||--|{ ITEM : contains",
  "sequence": "sequenceDiagram\\n    actor User\\n    User->>Frontend: Action\\n    Frontend->>API: Request\\n    API-->>Frontend: Response"
}

Rules for Mermaid syntax:
- Use \\n for newlines (double backslash n in the JSON string)
- No special characters in node labels except spaces and letters
- For erDiagram, use simple entity names without spaces
- Keep node names short (max 20 chars)
- Test mentally that syntax is valid before outputting
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
