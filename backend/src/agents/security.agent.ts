import { callAI } from '../services/ai.service'
import { SECURITY_SYSTEM_PROMPT } from '../prompts/security.prompt'

export async function generateSecurity(architecture: any) {
  const prompt = `Generate security checklist for this system:

ARCHITECTURE:
${JSON.stringify(architecture, null, 2)}

Output ONLY valid JSON. Nothing else.`

  const raw = await callAI(prompt, SECURITY_SYSTEM_PROMPT)
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.error('Security agent parse error:', raw)
    throw new Error('Security agent returned invalid JSON')
  }
}
