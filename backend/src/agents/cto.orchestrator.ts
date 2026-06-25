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

// Returns a compact summary of all completed phases — max 500 chars / ~125 tokens.
// Each subsequent agent receives this string instead of full prior-phase JSON,
// giving a ~90% token reduction while keeping the essential context visible.
function buildContextSummary(completedPhases: Record<string, any>): string {
  const lines: string[] = []

  if (completedPhases.phase1) {
    const p = completedPhases.phase1
    const pitch = p?.startup_identity?.one_line_pitch
      || p?.oneLinePitch
      || p?.pitch
      || 'startup defined'
    const model = p?.business_model?.primary_model
      || p?.businessModel
      || 'business model defined'
    lines.push(`P1: ${pitch} | ${model}`.slice(0, 120))
  }

  if (completedPhases.phase2) {
    const p = completedPhases.phase2
    const nsm = p?.north_star_metric
      || p?.northStarMetric
      || p?.metrics?.north_star_metric
      || 'product strategy defined'
    lines.push(`P2: ${nsm}`.slice(0, 100))
  }

  if (completedPhases.phase3) {
    const p = completedPhases.phase3
    const stack = p?.tech_stack?.primary
      || p?.techStack
      || p?.architecture_style?.pattern
      || p?.architecture
      || 'architecture defined'
    lines.push(`P3: ${stack}`.slice(0, 100))
  }

  if (completedPhases.phase4) {
    const p = completedPhases.phase4
    const tables = p?.tables?.length
      || p?.schema?.length
      || '?'
    lines.push(`P4: DB schema ${tables} tables`.slice(0, 100))
  }

  if (completedPhases.phase5) {
    const p = completedPhases.phase5
    const endpoints = p?.endpoints?.length
      || p?.api_endpoints?.length
      || '?'
    lines.push(`P5: ${endpoints} API endpoints defined`.slice(0, 100))
  }

  if (completedPhases.phase6) {
    lines.push(`P6: scaling roadmap defined`)
  }

  if (completedPhases.phase7) {
    lines.push(`P7: security audit defined`)
  }

  if (completedPhases.phase8) {
    lines.push(`P8: devops pipeline defined`)
  }

  if (completedPhases.phase9) {
    lines.push(`P9: finops analysis defined`)
  }

  if (completedPhases.phase10) {
    lines.push(`P10: hiring plan defined`)
  }

  if (completedPhases.phase11) {
    lines.push(`P11: architecture diagrams defined`)
  }

  return lines.join('\n').slice(0, 500)
}

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

  const completed: Record<string, any> = {}
  const ctx = () => buildContextSummary(completed)

  // ── Phase 1: no prior context ──────────────────────────────────────────────
  const founder = await runPhaseWithFallback(
    'Phase 1: Founder Mindset',
    () => runFounderPhase(problem),
    {
      _status: 'failed',
      phase: 'founder_mindset',
      startup_identity: { one_line_pitch: 'Analysis unavailable', problem_statement: '', why_now: '', unfair_advantage: '' },
      market: { tam: 'N/A', sam: 'N/A', som: 'N/A', competitors: [] },
      business_model: { primary_model: 'N/A', pricing_strategy: 'N/A', revenue_streams: [], unit_economics: {} },
      revenue_milestones: { first_100_dollars: 'N/A', first_10k_monthly: 'N/A', first_100k_monthly: 'N/A', first_1m_arr: 'N/A' },
      mvp_definition: { must_have_features: [], should_have_features: [], must_NOT_build: [], mvp_timeline_weeks: 0 },
      customer: { primary_persona: null }
    }
  )
  completed.phase1 = founder

  // ── Phase 2 ────────────────────────────────────────────────────────────────
  const p2ctx = ctx()
  console.log(`[Context] Phase 2 context length: ${p2ctx.length} chars`)
  const product = await runPhaseWithFallback(
    'Phase 2: Product Strategy',
    () => runProductPhase(problem, p2ctx),
    {
      _status: 'failed',
      phase: 'product_strategy',
      user_journey: { awareness: '', activation: '', retention: '', revenue: '', referral: '' },
      core_features: [],
      growth_strategy: { acquisition_channels: [], viral_loop: '', network_effects: '' },
      metrics: { north_star_metric: '', primary_metrics: [] },
      product_risks: []
    }
  )
  completed.phase2 = product

  // ── Phase 3 ────────────────────────────────────────────────────────────────
  const p3ctx = ctx()
  console.log(`[Context] Phase 3 context length: ${p3ctx.length} chars`)
  const architecture = await runPhaseWithFallback(
    'Phase 3: System Architecture',
    () => runArchitecturePhase(problem, p3ctx, p3ctx),
    {
      _status: 'failed',
      phase: 'system_architecture',
      architecture_style: { pattern: 'N/A', justification: 'Analysis unavailable', evolution_path: '' },
      services: [],
      communication_patterns: [],
      technical_decisions: [],
      third_party_integrations: []
    }
  )
  completed.phase3 = architecture

  // ── Phase 4 ────────────────────────────────────────────────────────────────
  const p4ctx = ctx()
  console.log(`[Context] Phase 4 context length: ${p4ctx.length} chars`)
  const database = await runPhaseWithFallback(
    'Phase 4: Data Modeling',
    () => runDatabasePhase(problem, p4ctx),
    {
      _status: 'failed',
      phase: 'data_modeling',
      database_strategy: { primary_database: 'N/A', primary_reasoning: '' },
      tables: [],
      relationships: [],
      indexes: []
    }
  )
  completed.phase4 = database

  // ── Phase 5 ────────────────────────────────────────────────────────────────
  const p5ctx = ctx()
  console.log(`[Context] Phase 5 context length: ${p5ctx.length} chars`)
  const api = await runPhaseWithFallback(
    'Phase 5: API Design',
    () => runAPIPhase(problem, p5ctx, p5ctx),
    {
      _status: 'failed',
      phase: 'api_design',
      api_strategy: { style: 'REST', versioning: '/v1/', authentication: 'JWT', base_url: '/api/v1' },
      endpoints: [],
      error_handling: { error_codes: [] }
    }
  )
  completed.phase5 = api

  // ── Phase 6 ────────────────────────────────────────────────────────────────
  const p6ctx = ctx()
  console.log(`[Context] Phase 6 context length: ${p6ctx.length} chars`)
  const scaling = await runPhaseWithFallback(
    'Phase 6: Scaling & Reliability',
    () => runScalingPhase(problem, p6ctx, p6ctx),
    {
      _status: 'failed',
      phase: 'scaling_reliability',
      scaling_stages: [],
      reliability: { rto: 'N/A', rpo: 'N/A', target_uptime: 'N/A', failure_scenarios: [] },
      performance_targets: { api_p99_latency_ms: 500, api_p95_latency_ms: 200, page_load_time_ms: 3000, database_query_p99_ms: 100 }
    }
  )
  completed.phase6 = scaling

  // ── Phase 7 ────────────────────────────────────────────────────────────────
  const p7ctx = ctx()
  console.log(`[Context] Phase 7 context length: ${p7ctx.length} chars`)
  const security = await runPhaseWithFallback(
    'Phase 7: Security Review',
    () => runSecurityPhase(problem, p7ctx, p7ctx),
    {
      _status: 'failed',
      phase: 'security_review',
      risk_score: 'N/A',
      top_3_risks: [],
      threat_model: { attack_surfaces: [], most_valuable_assets: [], likely_attackers: [] },
      owasp_coverage: [],
      checklist: {},
      security_roadmap: []
    }
  )
  completed.phase7 = security

  // ── Phase 8 ────────────────────────────────────────────────────────────────
  const p8ctx = ctx()
  console.log(`[Context] Phase 8 context length: ${p8ctx.length} chars`)
  const devops = await runPhaseWithFallback(
    'Phase 8: DevOps',
    () => runDevOpsPhase(problem, p8ctx),
    {
      _status: 'failed',
      phase: 'devops',
      repository: null,
      ci_cd: null,
      infrastructure: null,
      observability: null,
      environments: []
    }
  )
  completed.phase8 = devops

  // ── Phase 9 ────────────────────────────────────────────────────────────────
  const p9ctx = ctx()
  console.log(`[Context] Phase 9 context length: ${p9ctx.length} chars`)
  const finops = await runPhaseWithFallback(
    'Phase 9: FinOps',
    () => runFinOpsPhase(problem, p9ctx, p9ctx),
    {
      _status: 'failed',
      phase: 'finops',
      cost_philosophy: 'Analysis unavailable',
      tiers: null,
      cost_per_user: { at_1k_users: 'N/A', at_10k_users: 'N/A', at_100k_users: 'N/A' },
      revenue_vs_infra: { break_even_users: 0, target_infra_as_percent_revenue: 'N/A' },
      optimization_opportunities: [],
      cost_saving_tips: []
    }
  )
  completed.phase9 = finops

  // ── Phase 10 ───────────────────────────────────────────────────────────────
  const p10ctx = ctx()
  console.log(`[Context] Phase 10 context length: ${p10ctx.length} chars`)
  const hiring = await runPhaseWithFallback(
    'Phase 10: Hiring Plan',
    () => runHiringPhase(problem, p10ctx, p10ctx),
    {
      _status: 'failed',
      phase: 'hiring_plan',
      hiring_philosophy: 'Analysis unavailable',
      year_1: null,
      year_2: null,
      year_3: null,
      contractor_vs_fulltime: [],
      avoid_early_hiring: []
    }
  )
  completed.phase10 = hiring

  // ── Phase 11 ───────────────────────────────────────────────────────────────
  const p11ctx = ctx()
  console.log(`[Context] Phase 11 context length: ${p11ctx.length} chars`)
  const diagrams = await runPhaseWithFallback(
    'Phase 11: Diagrams',
    () => runDiagramsPhase(problem, p11ctx, p11ctx),
    {
      _status: 'failed',
      phase: 'diagrams',
      architecture: 'graph TD\n    Client-->API\n    API-->DB',
      er_diagram: 'erDiagram\n    USER ||--o{ SESSION : has',
      sequence: 'sequenceDiagram\n    User->>API: Request\n    API-->>User: Response'
    }
  )
  completed.phase11 = diagrams

  const allData = { founder, product, architecture, database, api, scaling, security, devops, finops, hiring, diagrams }

  // ── Phase 12: Verdict (uses hand-picked slim fields, not summary) ──────────
  const verdictContext = {
    startup: {
      idea: problem,
      identity: founder?.startup_identity,
      market: founder?.market,
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
      mvp_cost: finops?.tiers?.mvp?.monthly_usd,
      growth_cost: finops?.tiers?.growth?.monthly_usd,
    },
    hiring: {
      first_hires: hiring?.immediate_hires?.slice(0, 3)?.map((h: any) => h?.role || h),
    },
  }

  const verdict = await runPhaseWithFallback(
    'Phase 12: CTO Verdict',
    () => runCTOVerdictPhase(problem, verdictContext),
    {
      _status: 'failed',
      phase: 'cto_verdict',
      investor_review: null,
      devils_advocate: null,
      confidence_scores: [],
      what_netflix_would_do_differently: [],
      what_stripe_would_do_differently: [],
      if_only_10k_left: '',
      if_funding_doubled: '',
      final_cto_statement: 'Verdict analysis unavailable. Please regenerate.'
    }
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
