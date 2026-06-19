import { callAI } from '../services/ai.service'
import { MASTER_CTO_IDENTITY } from '../prompts/master.system.prompt'

const VERDICT_PROMPT = `
${MASTER_CTO_IDENTITY}

PHASE 12 — CTO SELF-CRITIQUE & INVESTOR VERDICT

This is the most important phase.

You must now SWITCH ROLES completely.

You are no longer the CTO who designed this system.
You are now an EXTERNAL SENIOR TECHNICAL ADVISOR hired by a VC firm
to audit this architecture before they invest $5M.

You are ruthless. You have seen 500+ startups fail.
You challenge every assumption. You find every weakness.

Then you write the final CTO Verdict.

Output ONLY this JSON:
{
  "phase": "cto_verdict",
  "devils_advocate": {
    "overengineered_components": [
      {
        "component": "string",
        "issue": "string",
        "simpler_alternative": "string"
      }
    ],
    "underengineered_components": [
      {
        "component": "string",
        "issue": "string",
        "recommendation": "string"
      }
    ],
    "wrong_assumptions": ["string"],
    "fashionable_but_unnecessary": [
      {
        "technology": "string",
        "why_unnecessary": "string",
        "what_to_use_instead": "string"
      }
    ],
    "first_bottleneck": "string",
    "most_dangerous_decision": "string",
    "technical_debt_accepted": ["string"]
  },
  "confidence_scores": [
    {
      "recommendation": "string",
      "confidence": 85,
      "reasoning": "string"
    }
  ],
  "what_netflix_would_do_differently": ["string"],
  "what_stripe_would_do_differently": ["string"],
  "if_only_10k_left": "string",
  "if_funding_doubled": "string",
  "investor_review": {
    "investability_score": 75,
    "verdict": "INVEST_WITH_CONDITIONS",
    "reasoning": "string",
    "conditions": ["string"],
    "technical_moat": "string",
    "biggest_technical_risk": "string",
    "biggest_technical_strength": "string"
  },
  "final_cto_statement": "string"
}
`

function cleanJSON(text: string): string {
  return text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

export async function runCTOVerdictPhase(problem: string, allPreviousData: any): Promise<any> {
  const prompt = `STARTUP IDEA: ${problem}\n\nCOMPLETE TECHNICAL PLAN PRODUCED SO FAR:\n${JSON.stringify(allPreviousData, null, 2)}\n\nYou are now the external VC technical advisor. Be ruthless. Find every weakness. Then give the final verdict. Output ONLY the JSON structure specified.`
  const raw = await callAI(prompt, VERDICT_PROMPT)
  return JSON.parse(cleanJSON(raw))
}
