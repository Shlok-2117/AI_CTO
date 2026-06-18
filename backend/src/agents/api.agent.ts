import { callAI } from '../services/ai.service'
import { API_SYSTEM_PROMPT } from '../prompts/api.prompt'

function extractJSON(text: string): string {
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')

  if (start === -1 || end === -1) throw new Error('No JSON object found in response')

  return text.slice(start, end + 1)
}

export async function generateApiDesign(architecture: any, database: any) {
  const prompt = `Design the complete REST API for this system:

ARCHITECTURE:
${JSON.stringify(architecture, null, 2)}

DATABASE SCHEMA:
${JSON.stringify(database, null, 2)}

Output ONLY valid JSON. Nothing else.`

  let lastError = ''

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`API agent attempt ${attempt}...`)
      const raw = await callAI(prompt, API_SYSTEM_PROMPT)
      const cleaned = extractJSON(raw)
      const parsed = JSON.parse(cleaned)

      if (!parsed.endpoints || !Array.isArray(parsed.endpoints)) {
        throw new Error('Missing endpoints array')
      }

      return parsed
    } catch (e: any) {
      lastError = e.message
      console.error(`API agent attempt ${attempt} failed:`, e.message)
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('API agent: returning fallback response')
  return {
    base_url: '/api/v1',
    auth_strategy: 'JWT Bearer token in Authorization header',
    versioning: 'URL versioning — /api/v1/',
    total_endpoints: 6,
    rate_limiting: '100 requests per minute per IP',
    error_format: { error: 'string', code: 'string' },
    endpoints: [
      { path: '/auth/register', method: 'POST', description: 'Register user', auth_required: false, request_body: { email: 'string', password: 'string' }, response: { token: 'string' }, status_codes: { '201': 'Created' } },
      { path: '/auth/login', method: 'POST', description: 'Login user', auth_required: false, request_body: { email: 'string', password: 'string' }, response: { token: 'string' }, status_codes: { '200': 'OK' } },
      { path: '/auth/logout', method: 'POST', description: 'Logout user', auth_required: true, request_body: {}, response: { message: 'string' }, status_codes: { '200': 'OK' } },
      { path: '/users/me', method: 'GET', description: 'Get current user', auth_required: true, request_body: {}, response: { user: 'object' }, status_codes: { '200': 'OK' } },
      { path: '/generate', method: 'POST', description: 'Generate architecture', auth_required: true, request_body: { problem: 'string' }, response: { id: 'string', result: 'object' }, status_codes: { '200': 'OK' } },
      { path: '/history', method: 'GET', description: 'Get past generations', auth_required: true, request_body: {}, response: { generations: 'array' }, status_codes: { '200': 'OK' } }
    ]
  }
}
