import { callAI } from '../services/ai.service'

const DIAGRAM_PROMPT = `
You are a software architect. Output ONLY valid JSON. No markdown.

Generate Mermaid diagram syntax strings for the given architecture.

Output exactly:
{
  "architecture": "graph TD\\n    Client[React Frontend] --> API[API Gateway]\\n    API --> Auth[Auth Service]\\n    API --> Main[Main Service]\\n    Main --> DB[(PostgreSQL)]\\n    Main --> Cache[(Redis)]",
  "er_diagram": "erDiagram\\n    USER ||--o{ ORDER : places\\n    ORDER ||--|{ ORDER_ITEM : contains\\n    USER { string id PK\\n string email\\n string name }\\n    ORDER { string id PK\\n string userId FK\\n float total }\\n    ORDER_ITEM { string id PK\\n string orderId FK\\n int quantity }",
  "sequence": "sequenceDiagram\\n    actor User\\n    User->>Frontend: Open app\\n    Frontend->>API: POST /auth/login\\n    API->>Database: Check credentials\\n    Database-->>API: User found\\n    API-->>Frontend: JWT token\\n    Frontend-->>User: Dashboard"
}

Rules:
- Use \\n for newlines inside strings
- architecture must use graph TD
- er_diagram must use erDiagram
- sequence must use sequenceDiagram
- Output ONLY the JSON object
`

function extractJSON(text: string): string {
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')

  if (start === -1 || end === -1) throw new Error('No JSON object found in response')

  return text.slice(start, end + 1)
}

export async function generateDiagrams(architecture: any, database: any) {
  const prompt = `Generate Mermaid diagrams for this system:

ARCHITECTURE: ${JSON.stringify(architecture, null, 2)}
DATABASE: ${JSON.stringify(database, null, 2)}

Output ONLY valid JSON.`

  let lastError = ''

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Diagram agent attempt ${attempt}...`)
      const raw = await callAI(prompt, DIAGRAM_PROMPT)
      const cleaned = extractJSON(raw)
      const parsed = JSON.parse(cleaned)

      if (!parsed.architecture || !parsed.er_diagram || !parsed.sequence) {
        throw new Error('Missing one or more diagram fields')
      }

      return parsed
    } catch (e: any) {
      lastError = e.message
      console.error(`Diagram agent attempt ${attempt} failed:`, e.message)
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('Diagram agent: returning fallback response')
  return {
    architecture: 'graph TD\n    Client[Frontend] --> API[API Gateway]\n    API --> Auth[Auth Service]\n    API --> Main[Main Service]\n    Main --> DB[(Database)]',
    er_diagram: 'erDiagram\n    USER ||--o{ RECORD : owns\n    USER {\n        string id PK\n        string email\n    }\n    RECORD {\n        string id PK\n        string userId FK\n    }',
    sequence: 'sequenceDiagram\n    actor User\n    User->>Frontend: Open app\n    Frontend->>API: Request\n    API-->>Frontend: Response\n    Frontend-->>User: Render'
  }
}
