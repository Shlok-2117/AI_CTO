import { runFounderPhase } from './phase1_founder.agent'
import { runProductPhase } from './phase2_product.agent'
import { runArchitecturePhase } from './phase3_architecture.agent'
import { runDatabasePhase } from './phase4_database.agent'
import { runAPIPhase } from './phase5_api.agent'
import { runScalingPhase } from './phase6_scaling.agent'
import { runSecurityPhase } from './phase7_security.agent'
import { runDevOpsPhase } from './phase8_devops.agent'
import { runFinOpsPhase } from './phase9_finops.agent'
import { runHiringPhase } from './phase10_hiring.agent'
import { runDiagramsPhase } from './phase11_diagrams.agent'
import { runCTOVerdictPhase } from './phase12_cto_verdict.agent'

async function runPhaseWithFallback(phaseName: string, phaseFunction: () => Promise<any>, fallback: any): Promise<any> {
  try {
    console.log(`[CTO] Running ${phaseName}...`)
    const result = await phaseFunction()
    console.log(`[CTO] ${phaseName} complete`)
    return result
  } catch (err: any) {
    console.error(`[CTO] ${phaseName} failed: ${err.message}`)
    return fallback
  }
}

export async function generateCTOBlueprint(problem: string): Promise<any> {
  console.log(`\n[CTO SYSTEM] Starting 12-phase analysis for: "${problem}"\n`)

  const founder = await runPhaseWithFallback(
    'Phase 1: Founder Mindset',
    () => runFounderPhase(problem),
    { error: 'Phase failed', phase: 'founder_mindset' }
  )

  const product = await runPhaseWithFallback(
    'Phase 2: Product Strategy',
    () => runProductPhase(problem, founder),
    { error: 'Phase failed', phase: 'product_strategy' }
  )

  const architecture = await runPhaseWithFallback(
    'Phase 3: System Architecture',
    () => runArchitecturePhase(problem, founder, product),
    { error: 'Phase failed', phase: 'system_architecture' }
  )

  const database = await runPhaseWithFallback(
    'Phase 4: Data Modeling',
    () => runDatabasePhase(problem, architecture),
    { error: 'Phase failed', phase: 'data_modeling' }
  )

  const api = await runPhaseWithFallback(
    'Phase 5: API Design',
    () => runAPIPhase(problem, architecture, database),
    { error: 'Phase failed', phase: 'api_design' }
  )

  const scaling = await runPhaseWithFallback(
    'Phase 6: Scaling & Reliability',
    () => runScalingPhase(problem, architecture, founder),
    { error: 'Phase failed', phase: 'scaling_reliability' }
  )

  const security = await runPhaseWithFallback(
    'Phase 7: Security Review',
    () => runSecurityPhase(problem, architecture, api),
    { error: 'Phase failed', phase: 'security_review' }
  )

  const devops = await runPhaseWithFallback(
    'Phase 8: DevOps',
    () => runDevOpsPhase(problem, architecture),
    { error: 'Phase failed', phase: 'devops' }
  )

  const finops = await runPhaseWithFallback(
    'Phase 9: FinOps',
    () => runFinOpsPhase(problem, architecture, founder),
    { error: 'Phase failed', phase: 'finops' }
  )

  const hiring = await runPhaseWithFallback(
    'Phase 10: Hiring Plan',
    () => runHiringPhase(problem, architecture, founder),
    { error: 'Phase failed', phase: 'hiring_plan' }
  )

  const diagrams = await runPhaseWithFallback(
    'Phase 11: Diagrams',
    () => runDiagramsPhase(problem, architecture, database),
    {
      phase: 'diagrams',
      architecture: 'graph TD\n    Client-->API\n    API-->DB',
      er_diagram: 'erDiagram\n    USER ||--o{ SESSION : has',
      sequence: 'sequenceDiagram\n    User->>API: Request\n    API-->>User: Response'
    }
  )

  const allData = { founder, product, architecture, database, api, scaling, security, devops, finops, hiring, diagrams }

  const verdictContext = {
    startup: {
      idea: problem,
      identity: founder?.startup_identity,
      market: founder?.market_reality,
    },
    product: {
      core_features: product?.mvp_scope?.core_features,
      positioning: product?.positioning,
    },
    architecture: {
      recommended_stack: architecture?.recommended_stack,
      key_services: architecture?.core_services?.map((s: any) => s?.name || s),
      deployment: architecture?.deployment_architecture,
    },
    database: {
      primary_db: database?.primary_database,
      key_entities: database?.schema?.map((t: any) => t?.table_name || t?.name || t),
    },
    scaling: {
      bottlenecks: scaling?.bottlenecks?.slice(0, 3),
      approach: scaling?.scaling_approach,
    },
    security: {
      risk_level: security?.overall_risk_level,
      critical_risks: security?.critical_risks?.slice(0, 3),
    },
    finops: {
      mvp_cost: finops?.tiers?.mvp?.monthly_total,
      growth_cost: finops?.tiers?.growth?.monthly_total,
    },
    hiring: {
      first_hires: hiring?.immediate_hires?.slice(0, 3)?.map((h: any) => h?.role || h),
    },
  }

  const verdict = await runPhaseWithFallback(
    'Phase 12: CTO Verdict',
    () => runCTOVerdictPhase(problem, verdictContext),
    { error: 'Phase failed', phase: 'cto_verdict' }
  )

  console.log('\n[CTO SYSTEM] Blueprint generation complete!\n')

  return {
    ...allData,
    verdict,
    metadata: {
      generated_at: new Date().toISOString(),
      problem,
      total_phases: 12,
      version: '2.0'
    }
  }
}
