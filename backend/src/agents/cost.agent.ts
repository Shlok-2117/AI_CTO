import { callAI } from '../services/ai.service'
import { COST_SYSTEM_PROMPT } from '../prompts/cost.prompt'

function extractJSON(text: string): string {
  text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')

  if (start === -1 || end === -1) throw new Error('No JSON object found in response')

  return text.slice(start, end + 1)
}

export async function generateCost(architecture: any) {
  const prompt = `Estimate cloud costs for this system architecture:

ARCHITECTURE:
${JSON.stringify(architecture, null, 2)}

Output ONLY valid JSON. Nothing else.`

  let lastError = ''

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Cost agent attempt ${attempt}...`)
      const raw = await callAI(prompt, COST_SYSTEM_PROMPT)
      const cleaned = extractJSON(raw)
      const parsed = JSON.parse(cleaned)

      if (!parsed.tiers) {
        throw new Error('Missing tiers object')
      }

      return parsed
    } catch (e: any) {
      lastError = e.message
      console.error(`Cost agent attempt ${attempt} failed:`, e.message)
      if (attempt < 3) await new Promise(r => setTimeout(r, 2000))
    }
  }

  console.log('Cost agent: returning fallback response')
  return {
    tiers: {
      small: {
        description: '0–1,000 users/month',
        monthly_usd: 45,
        services: [
          { name: 'EC2 t3.micro', type: 'Compute', spec: '1 vCPU, 1GB RAM', cost_usd: 8 },
          { name: 'RDS db.t3.micro', type: 'Database', spec: '1 vCPU, 1GB RAM, 20GB SSD', cost_usd: 15 }
        ]
      },
      medium: {
        description: '1,000–50,000 users/month',
        monthly_usd: 280,
        services: []
      },
      large: {
        description: '50,000–1,000,000 users/month',
        monthly_usd: 1200,
        services: []
      }
    },
    breakdown: { compute: 40, database: 30, storage: 15, networking: 10, other: 5 },
    cost_saving_tips: ['AI generation failed — showing fallback estimate. Use Reserved Instances for EC2 savings.'],
    free_tier_eligible: ['AWS Lambda', 'S3 (5GB)', 'CloudFront (1TB)']
  }
}
