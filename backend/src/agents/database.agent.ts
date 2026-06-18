import { callAI } from '../services/ai.service'
import { DATABASE_SYSTEM_PROMPT } from '../prompts/database.prompt'

function extractJSON(text: string): string {
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')

  if (start === -1 || end === -1) throw new Error('No JSON object found in response')

  return text.slice(start, end + 1)
}

export async function generateDatabase(architecture: any) {
  const prompt = `Given this system architecture, design the complete database schema:

ARCHITECTURE:
${JSON.stringify(architecture, null, 2)}

Output ONLY valid JSON. Nothing else.`

  let lastError = ''

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Database agent attempt ${attempt}...`)
      const raw = await callAI(prompt, DATABASE_SYSTEM_PROMPT)
      const cleaned = extractJSON(raw)
      const parsed = JSON.parse(cleaned)

      if (!parsed.tables || !Array.isArray(parsed.tables)) {
        throw new Error('Missing tables array')
      }

      return parsed
    } catch (e: any) {
      lastError = e.message
      console.error(`Database agent attempt ${attempt} failed:`, e.message)
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('Database agent: returning fallback response')
  return {
    tables: [
      {
        name: 'users',
        purpose: 'Stores user accounts',
        columns: [
          { name: 'id', type: 'UUID', constraints: ['PRIMARY KEY', 'DEFAULT gen_random_uuid()'], description: 'Unique user identifier' },
          { name: 'email', type: 'VARCHAR', constraints: ['NOT NULL', 'UNIQUE'], description: 'User email address' },
          { name: 'password_hash', type: 'VARCHAR', constraints: ['NOT NULL'], description: 'Hashed password' },
          { name: 'created_at', type: 'TIMESTAMP', constraints: ['DEFAULT now()'], description: 'Account creation timestamp' },
          { name: 'updated_at', type: 'TIMESTAMP', constraints: ['DEFAULT now()'], description: 'Last update timestamp' }
        ],
        indexes: ['email'],
        relationships: []
      }
    ],
    total_tables: 1,
    normalization: '3NF — fallback schema, AI generation failed',
    sql_preview: "CREATE TABLE users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT now(), updated_at TIMESTAMP DEFAULT now());"
  }
}
