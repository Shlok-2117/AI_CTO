import { isGroqOnCooldown } from '../services/ai.service'
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

// Reduces prior-phase output to max ~400 chars before passing as context to the
// next agent so large JSON blobs don't overflow provider context windows.
// Preserves array structure (first 3 items, name-key only) so agents that do
// data?.services?.map(s => s.name) still get real values.
function trimContext(data: any, maxChars = 400): any {
  if (!data) return null
  if (JSON.stringify(data).length <= maxChars) return data

  const slim: Record<string, any> = {}
  for (const [k, v] of Object.entries(data)) {
    if (k === '_status') continue
    if (typeof v === 'string') {
      slim[k] = (v as string).slice(0, 60)
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      slim[k] = v
    } else if (Array.isArray(v)) {
      slim[k] = (v as any[]).slice(0, 3).map((item: any) => {
        if (!item || typeof item !== 'object') return item
        const label =
          item.name ?? item.role ?? item.title ?? item.table_name ??
          item.table ?? item.endpoint ?? item.service ?? item.phase ??
          String(Object.values(item)[0] ?? '').slice(0, 50)
        return { name: String(label).slice(0, 50) }
      })
    } else if (v && typeof v === 'object') {
      const sub: Record<string, any> = {}
      for (const [sk, sv] of Object.entries(v as Record<string, any>)) {
        if (typeof sv === 'string') sub[sk] = (sv as string).slice(0, 40)
        else if (typeof sv === 'number' || typeof sv === 'boolean') sub[sk] = sv
      }
      slim[k] = sub
    }
  }
  return slim
}

async function runPhaseWithFallback(phaseName: string, phaseFunction: () => Promise<any>, fallback: any): Promise<any> {
  // If Groq hit its TPM limit on the previous phase, wait 3s to let the
  // 60s bucket partially refill before hammering it again.
  if (isGroqOnCooldown()) {
    console.log(`[CTO] Groq rate limited — waiting 95s for TPM reset before ${phaseName}...`)
    await new Promise(r => setTimeout(r, 95000))
  }
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

  const product = await runPhaseWithFallback(
    'Phase 2: Product Strategy',
    () => runProductPhase(problem, trimContext(founder)),
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

  const architecture = await runPhaseWithFallback(
    'Phase 3: System Architecture',
    () => runArchitecturePhase(problem, trimContext(founder), trimContext(product)),
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

  const database = await runPhaseWithFallback(
    'Phase 4: Data Modeling',
    () => runDatabasePhase(problem, trimContext(architecture)),
    {
      _status: 'failed',
      phase: 'data_modeling',
      database_strategy: { primary_database: 'N/A', primary_reasoning: '' },
      tables: [],
      relationships: [],
      indexes: []
    }
  )

  const api = await runPhaseWithFallback(
    'Phase 5: API Design',
    () => runAPIPhase(problem, trimContext(architecture), trimContext(database)),
    {
      _status: 'failed',
      phase: 'api_design',
      api_strategy: { style: 'REST', versioning: '/v1/', authentication: 'JWT', base_url: '/api/v1' },
      endpoints: [],
      error_handling: { error_codes: [] }
    }
  )

  const scaling = await runPhaseWithFallback(
    'Phase 6: Scaling & Reliability',
    () => runScalingPhase(problem, trimContext(architecture), trimContext(founder)),
    {
      _status: 'failed',
      phase: 'scaling_reliability',
      scaling_stages: [],
      reliability: { rto: 'N/A', rpo: 'N/A', target_uptime: 'N/A', failure_scenarios: [] },
      performance_targets: { api_p99_latency_ms: 500, api_p95_latency_ms: 200, page_load_time_ms: 3000, database_query_p99_ms: 100 }
    }
  )

  const security = await runPhaseWithFallback(
    'Phase 7: Security Review',
    () => runSecurityPhase(problem, trimContext(architecture), trimContext(api)),
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

  const devops = await runPhaseWithFallback(
    'Phase 8: DevOps',
    () => runDevOpsPhase(problem, trimContext(architecture)),
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

  const finops = await runPhaseWithFallback(
    'Phase 9: FinOps',
    () => runFinOpsPhase(problem, trimContext(architecture), trimContext(founder)),
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

  const hiring = await runPhaseWithFallback(
    'Phase 10: Hiring Plan',
    () => runHiringPhase(problem, trimContext(architecture), trimContext(founder)),
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

  const diagrams = await runPhaseWithFallback(
    'Phase 11: Diagrams',
    () => runDiagramsPhase(problem, trimContext(architecture), trimContext(database)),
    {
      _status: 'failed',
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
