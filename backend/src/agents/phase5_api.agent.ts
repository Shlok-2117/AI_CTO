import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

function cleanJSON(text: string): string {
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('No JSON object found')
  return text.slice(start, end + 1)
}

const API_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 5 — API DESIGN

Think as a Principal API Architect.
Design production-grade APIs.

CRITICAL: Output ONLY a single valid JSON object.
No markdown. No explanation. No text before or after.
No trailing commas. All strings must be properly escaped.

Output exactly this structure:
{
  "phase": "api_design",
  "api_strategy": {
    "style": "REST",
    "versioning": "URL versioning /v1/",
    "authentication": "JWT Bearer token",
    "base_url": "/api/v1",
    "rate_limiting": {
      "anonymous": "100 req/hour",
      "authenticated": "1000 req/hour",
      "premium": "10000 req/hour"
    }
  },
  "endpoints": [
    {
      "path": "/auth/register",
      "method": "POST",
      "description": "Register new user",
      "auth_required": false,
      "rate_limited": true,
      "idempotent": false,
      "request_body": {"email": "string", "password": "string", "name": "string"},
      "response": {"token": "string", "user": "object"},
      "status_codes": {"201": "Created", "400": "Validation error", "409": "Email exists"},
      "caching": "none",
      "notes": "Validate email format and password strength"
    }
  ],
  "webhook_design": {
    "events": ["user.created", "payment.completed"],
    "retry_strategy": "Exponential backoff 3 attempts",
    "security": "HMAC-SHA256 signature verification"
  },
  "error_handling": {
    "error_format": {
      "error": "string",
      "code": "string",
      "message": "string",
      "details": "object"
    },
    "error_codes": [
      {
        "code": "AUTH_001",
        "http_status": 401,
        "description": "Invalid or expired token"
      }
    ]
  }
}

Generate at least 10 realistic endpoints for this specific startup.
Output ONLY the JSON object. Nothing else.
`

export async function runAPIPhase(
  problem: string,
  architectureData: any,
  databaseData: any
): Promise<any> {
  const services = architectureData?.services?.slice(0, 5).map((s: any) => s.name).join(', ') || 'core services'
  const tables = databaseData?.tables?.slice(0, 5).map((t: any) => t.name).join(', ') || 'core tables'

  const prompt = `
STARTUP IDEA: ${problem}

KEY SERVICES: ${services}
DATABASE TABLES: ${tables}

Design at least 10 production-grade REST API endpoints for this startup.
Cover auth, core business operations, and data retrieval.
Output ONLY the JSON object. No explanation. No markdown.
`

  let lastError = ''
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      console.log(`[API Agent] Attempt ${attempt}...`)
      const raw = await callAI(prompt, API_PROMPT)
      const cleaned = cleanJSON(raw)
      const parsed = JSON.parse(cleaned)
      if (!parsed.endpoints || !Array.isArray(parsed.endpoints)) {
        throw new Error('Missing endpoints array')
      }
      console.log(`[API Agent] Success — ${parsed.endpoints.length} endpoints`)
      return parsed
    } catch (e: any) {
      lastError = e.message
      console.error(`[API Agent] Attempt ${attempt} failed: ${e.message}`)
      if (attempt < 4) await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log(`[API Agent] All attempts failed (${lastError}) — using fallback`)
  return {
    phase: 'api_design',
    api_strategy: {
      style: 'REST',
      versioning: 'URL versioning /v1/',
      authentication: 'JWT Bearer token',
      base_url: '/api/v1',
      rate_limiting: {
        anonymous: '100 req/hour',
        authenticated: '1000 req/hour',
        premium: '10000 req/hour'
      }
    },
    endpoints: [
      { path: '/auth/register', method: 'POST', description: 'Register new user', auth_required: false, rate_limited: true, idempotent: false, request_body: { email: 'string', password: 'string' }, response: { token: 'string', user: 'object' }, status_codes: { '201': 'Created', '400': 'Validation error' }, caching: 'none', notes: 'Validate email and password' },
      { path: '/auth/login', method: 'POST', description: 'Login user', auth_required: false, rate_limited: true, idempotent: false, request_body: { email: 'string', password: 'string' }, response: { token: 'string', user: 'object' }, status_codes: { '200': 'OK', '401': 'Invalid credentials' }, caching: 'none', notes: '' },
      { path: '/auth/logout', method: 'POST', description: 'Logout user', auth_required: true, rate_limited: false, idempotent: true, request_body: {}, response: { message: 'string' }, status_codes: { '200': 'OK' }, caching: 'none', notes: '' },
      { path: '/users/me', method: 'GET', description: 'Get current user profile', auth_required: true, rate_limited: false, idempotent: true, request_body: {}, response: { user: 'object' }, status_codes: { '200': 'OK', '401': 'Unauthorized' }, caching: '5 minutes', notes: '' },
      { path: '/users/me', method: 'PUT', description: 'Update user profile', auth_required: true, rate_limited: false, idempotent: true, request_body: { name: 'string', avatar: 'string' }, response: { user: 'object' }, status_codes: { '200': 'OK', '400': 'Validation error' }, caching: 'none', notes: '' },
      { path: '/items', method: 'GET', description: 'List all items with pagination', auth_required: true, rate_limited: false, idempotent: true, request_body: {}, response: { items: 'array', total: 'number', page: 'number' }, status_codes: { '200': 'OK' }, caching: '1 minute', notes: 'Support ?page=&limit=&sort=' },
      { path: '/items', method: 'POST', description: 'Create new item', auth_required: true, rate_limited: true, idempotent: false, request_body: { name: 'string', data: 'object' }, response: { item: 'object' }, status_codes: { '201': 'Created', '400': 'Validation error' }, caching: 'none', notes: '' },
      { path: '/items/:id', method: 'GET', description: 'Get item by ID', auth_required: true, rate_limited: false, idempotent: true, request_body: {}, response: { item: 'object' }, status_codes: { '200': 'OK', '404': 'Not found' }, caching: '5 minutes', notes: '' },
      { path: '/items/:id', method: 'PUT', description: 'Update item', auth_required: true, rate_limited: false, idempotent: true, request_body: { name: 'string', data: 'object' }, response: { item: 'object' }, status_codes: { '200': 'OK', '404': 'Not found' }, caching: 'none', notes: '' },
      { path: '/items/:id', method: 'DELETE', description: 'Delete item', auth_required: true, rate_limited: false, idempotent: true, request_body: {}, response: { message: 'string' }, status_codes: { '200': 'OK', '404': 'Not found' }, caching: 'none', notes: 'Soft delete' },
    ],
    webhook_design: {
      events: ['item.created', 'item.updated', 'user.registered'],
      retry_strategy: 'Exponential backoff, 3 attempts',
      security: 'HMAC-SHA256 signature verification'
    },
    error_handling: {
      error_format: { error: 'string', code: 'string', message: 'string', details: 'object' },
      error_codes: [
        { code: 'AUTH_001', http_status: 401, description: 'Invalid or expired token' },
        { code: 'VALID_001', http_status: 400, description: 'Validation failed' },
        { code: 'NOT_FOUND', http_status: 404, description: 'Resource not found' }
      ]
    }
  }
}
