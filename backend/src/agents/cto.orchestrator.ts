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

// Builds a compact ~200-token string summary of all completed phases.
// Passed as context to each subsequent agent instead of full JSON blobs,
// keeping prompts well under provider context limits.
function buildContextSummary(phases: {
  founder?: any; product?: any; architecture?: any; database?: any;
  api?: any; scaling?: any; security?: any; devops?: any;
  finops?: any; hiring?: any; diagrams?: any;
}): string {
  const parts: string[] = []

  if (phases.founder) {
    const p = phases.founder
    const pitch = p?.startup_identity?.one_line_pitch || 'startup idea'
    parts.push(`Founder: ${pitch}`.slice(0, 100))
  }
  if (phases.product) {
    const p = phases.product
    const metric = p?.metrics?.north_star_metric || 'product strategy'
    parts.push(`Product: ${metric}`.slice(0, 100))
  }
  if (phases.architecture) {
    const p = phases.architecture
    const pattern = p?.architecture_style?.pattern || 'architecture'
    const svcs = (p?.services || []).slice(0, 3).map((s: any) => s?.name || s).filter(Boolean).join(', ')
    parts.push(`Arch: ${pattern}${svcs ? ` [${svcs}]` : ''}`.slice(0, 100))
  }
  if (phases.database) {
    const p = phases.database
    const db = p?.database_strategy?.primary_database || 'DB'
    const tables = (p?.tables || []).slice(0, 4).map((t: any) => t?.name || t?.table_name || t).filter(Boolean).join(', ')
    parts.push(`DB: ${db}${tables ? ` tables:${tables}` : ''}`.slice(0, 100))
  }
  if (phases.api) {
    const p = phases.api
    const style = p?.api_strategy?.style || 'REST'
    const count = (p?.endpoints || []).length
    parts.push(`API: ${style}, ${count} endpoints`.slice(0, 100))
  }
  if (phases.scaling) {
    const p = phases.scaling
    const uptime = p?.reliability?.target_uptime || 'N/A'
    parts.push(`Scaling: uptime=${uptime}`.slice(0, 100))
  }
  if (phases.security) {
    const p = phases.security
    const risk = p?.risk_score || 'reviewed'
    parts.push(`Security: risk=${risk}`.slice(0, 100))
  }
  if (phases.devops) {
    const p = phases.devops
    const cloud = p?.infrastructure?.cloud_provider || 'cloud'
    parts.push(`DevOps: ${cloud}`.slice(0, 100))
  }
  if (phases.finops) {
    const p = phases.finops
    const cost = p?.tiers?.mvp?.monthly_usd || p?.cost_per_user?.at_1k_users || '?'
    parts.push(`FinOps: MVP=$${cost}/mo`.slice(0, 100))
  }
  if (phases.hiring) {
    const p = phases.hiring
    const size = p?.year_1?.team_size || '?'
    parts.push(`Hiring: y1 team=${size}`.slice(0, 100))
  }
  if (phases.diagrams) {
    parts.push('Diagrams: generated')
  }

  return parts.join(' | ').slice(0, 500)
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

  // Tracks completed phase results so buildContextSummary can grow incrementally.
  const completed: {
    founder?: any; product?: any; architecture?: any; database?: any;
    api?: any; scaling?: any; security?: any; devops?: any;
    finops?: any; hiring?: any; diagrams?: any;
  } = {}

  // Returns a compact context object wrapping the summary string. Each agent
  // receives this instead of the full prior-phase JSON (~200 tokens vs 3000+).
  const ctx = () => ({ _summary: buildContextSummary(completed) })

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
  completed.founder = founder

  const product = await runPhaseWithFallback(
    'Phase 2: Product Strategy',
    () => runProductPhase(problem, ctx()),
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
  completed.product = product

  const architecture = await runPhaseWithFallback(
    'Phase 3: System Architecture',
    () => runArchitecturePhase(problem, ctx(), ctx()),
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
  completed.architecture = architecture

  const database = await runPhaseWithFallback(
    'Phase 4: Data Modeling',
    () => runDatabasePhase(problem, ctx()),
    {
      _status: 'failed',
      phase: 'data_modeling',
      database_strategy: { primary_database: 'N/A', primary_reasoning: '' },
      tables: [],
      relationships: [],
      indexes: []
    }
  )
  completed.database = database

  const api = await runPhaseWithFallback(
    'Phase 5: API Design',
    () => runAPIPhase(problem, ctx(), ctx()),
    {
      _status: 'failed',
      phase: 'api_design',
      api_strategy: { style: 'REST', versioning: '/v1/', authentication: 'JWT', base_url: '/api/v1' },
      endpoints: [],
      error_handling: { error_codes: [] }
    }
  )
  completed.api = api

  const scaling = await runPhaseWithFallback(
    'Phase 6: Scaling & Reliability',
    () => runScalingPhase(problem, ctx(), ctx()),
    {
      _status: 'failed',
      phase: 'scaling_reliability',
      scaling_stages: [],
      reliability: { rto: 'N/A', rpo: 'N/A', target_uptime: 'N/A', failure_scenarios: [] },
      performance_targets: { api_p99_latency_ms: 500, api_p95_latency_ms: 200, page_load_time_ms: 3000, database_query_p99_ms: 100 }
    }
  )
  completed.scaling = scaling

  const security = await runPhaseWithFallback(
    'Phase 7: Security Review',
    () => runSecurityPhase(problem, ctx(), ctx()),
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
  completed.security = security

  const devops = await runPhaseWithFallback(
    'Phase 8: DevOps',
    () => runDevOpsPhase(problem, ctx()),
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
  completed.devops = devops

  const finops = await runPhaseWithFallback(
    'Phase 9: FinOps',
    () => runFinOpsPhase(problem, ctx(), ctx()),
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
  completed.finops = finops

  const hiring = await runPhaseWithFallback(
    'Phase 10: Hiring Plan',
    () => runHiringPhase(problem, ctx(), ctx()),
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
  completed.hiring = hiring

  const diagrams = await runPhaseWithFallback(
    'Phase 11: Diagrams',
    () => runDiagramsPhase(problem, ctx(), ctx()),
    {
      _status: 'failed',
      phase: 'diagrams',
      architecture: 'graph TD\n    Client-->API\n    API-->DB',
      er_diagram: 'erDiagram\n    USER ||--o{ SESSION : has',
      sequence: 'sequenceDiagram\n    User->>API: Request\n    API-->>User: Response'
    }
  )
  completed.diagrams = diagrams

  const allData = { founder, product, architecture, database, api, scaling, security, devops, finops, hiring, diagrams }

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
