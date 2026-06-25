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
      repository: {
        strategy: 'GitOps with trunk-based development',
        branching_model: 'GitHub Flow',
        code_review_policy: '2 reviewers required before merge',
        branch_protection: ['Require PR reviews', 'Block direct pushes to main', 'Require status checks']
      },
      ci_cd: {
        platform: 'GitHub Actions',
        pipeline_stages: [
          { stage: 'Lint & Format', actions: ['ESLint', 'Prettier check'], estimated_duration_mins: 2 },
          { stage: 'Test', actions: ['Unit tests', 'Integration tests'], estimated_duration_mins: 5 },
          { stage: 'Build', actions: ['Docker build', 'Push to registry'], estimated_duration_mins: 4 },
          { stage: 'Deploy', actions: ['Blue-green deploy', 'Smoke tests'], estimated_duration_mins: 3 },
        ],
        deployment_strategy: 'Blue-green deployment',
        deployment_frequency: 'On every merge to main',
        rollback_strategy: 'Instant traffic switch to previous version'
      },
      infrastructure: {
        cloud_provider: 'AWS',
        regions: ['us-east-1', 'ap-south-1'],
        iac_tool: 'Terraform',
        container_strategy: 'Docker + ECS Fargate'
      },
      observability: {
        logging: { tool: 'CloudWatch Logs', retention_days: 30, log_levels: ['ERROR', 'WARN', 'INFO'] },
        metrics: { tool: 'Datadog', key_metrics: ['API latency p99', 'Error rate', 'CPU utilization', 'DB query time'] },
        alerting: { tool: 'PagerDuty', on_call_strategy: 'Rotating on-call weekly', critical_alerts: ['API down > 1min', 'Error rate > 5%', 'CPU > 90%'] }
      },
      environments: [
        { name: 'Development', purpose: 'Active development and testing', infrastructure: 'Docker Compose (local)', data: 'Seeded test data' },
        { name: 'Staging', purpose: 'Pre-production validation', infrastructure: 'AWS ECS (1/4 scale)', data: 'Anonymized production copy' },
        { name: 'Production', purpose: 'Live user traffic', infrastructure: 'AWS ECS Fargate (auto-scaling)', data: 'Live data with daily backups' }
      ]
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
      cost_philosophy: 'Pay-as-you-grow — maximize free tiers at MVP, upgrade only when metrics demand it',
      tiers: {
        mvp: {
          monthly_usd: 150,
          description: 'Early stage — free tiers maximized',
          services: [
            { name: 'Compute (Render/Railway)', cost_usd: 50 },
            { name: 'Database (Supabase free)', cost_usd: 0 },
            { name: 'CDN (Cloudflare free)', cost_usd: 0 },
            { name: 'Email (Resend)', cost_usd: 20 },
            { name: 'Storage (S3)', cost_usd: 10 },
            { name: 'Domains & SSL', cost_usd: 70 }
          ],
          free_tier_used: ['Supabase free (500MB DB)', 'Cloudflare free CDN', 'Vercel hobby plan']
        },
        growth: {
          monthly_usd: 1200,
          description: 'Scaling with first 1K–10K users',
          services: [
            { name: 'Compute (ECS Fargate)', cost_usd: 400 },
            { name: 'Database (RDS t3.medium)', cost_usd: 200 },
            { name: 'CDN (CloudFront)', cost_usd: 100 },
            { name: 'Monitoring (Datadog)', cost_usd: 200 },
            { name: 'Storage (S3)', cost_usd: 50 },
            { name: 'Email & Comms', cost_usd: 100 }
          ]
        },
        scale: {
          monthly_usd: 8000,
          description: 'Production scale — 100K+ users',
          services: [
            { name: 'Compute (multi-region ECS)', cost_usd: 3000 },
            { name: 'Database (RDS Multi-AZ)', cost_usd: 1500 },
            { name: 'Cache (ElastiCache)', cost_usd: 500 },
            { name: 'CDN + Edge (CloudFront)', cost_usd: 300 },
            { name: 'Observability stack', cost_usd: 800 }
          ]
        }
      },
      cost_per_user: { at_1k_users: '$0.15/user', at_10k_users: '$0.08/user', at_100k_users: '$0.03/user' },
      revenue_vs_infra: { break_even_users: 500, target_infra_as_percent_revenue: '15%' },
      optimization_opportunities: [
        {
          opportunity: 'Spot instances for batch processing',
          savings_percent: 70,
          effort: 'medium',
          current_cost: 400,
          optimized_cost: 120,
          implementation: 'Migrate non-critical batch jobs to AWS Spot Instances'
        },
        {
          opportunity: 'Reserved instances after stable load',
          savings_percent: 40,
          effort: 'low',
          current_cost: 600,
          optimized_cost: 360,
          implementation: 'Commit to 1-year reserved instances for predictable base load after 6 months'
        }
      ],
      cost_saving_tips: [
        'Start on generous free tiers — Supabase, Vercel, and Cloudflare all have solid free plans',
        'Use spot/preemptible instances for batch jobs (up to 70% cheaper than on-demand)',
        'Aggressively CDN-cache static assets to reduce compute costs significantly',
        'Implement database connection pooling to avoid over-provisioning RDS',
        'Set AWS Budget alerts at $50, $100, and $200 to catch cost surprises early',
        'Reserved instances only after 6 months of stable, predictable load patterns'
      ]
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
      hiring_philosophy: 'Hire for impact, not headcount — generalists first, specialists only when scale demands it',
      year_1: {
        team_size: 3,
        total_salary_burn_usd: 240000,
        hires: [
          {
            role: 'Full-stack Engineer',
            when_to_hire: 'Month 1',
            why_this_role_now: 'Build the core product — this is the most critical first hire',
            salary_range_usd: '$80-100K',
            skills_required: ['React', 'Node.js', 'PostgreSQL', 'Docker']
          },
          {
            role: 'Product Designer',
            when_to_hire: 'Month 2',
            why_this_role_now: 'Ship a user experience that drives retention from day one',
            salary_range_usd: '$70-90K',
            skills_required: ['Figma', 'User research', 'Design systems', 'Prototyping']
          },
          {
            role: 'Growth Marketer',
            when_to_hire: 'Month 4',
            why_this_role_now: 'Drive first 1000 users and validate acquisition channels early',
            salary_range_usd: '$60-80K',
            skills_required: ['SEO', 'Content marketing', 'Analytics', 'Paid social']
          }
        ]
      },
      year_2: {
        team_size: 8,
        new_hires: [
          { role: 'Backend Engineer', trigger: 'When API p99 latency exceeds 300ms consistently', salary_range_usd: '$90-120K' },
          { role: 'Data Engineer', trigger: 'When analytics needs exceed what Mixpanel can provide', salary_range_usd: '$100-130K' },
          { role: 'Customer Success Manager', trigger: 'After first 100 paying customers', salary_range_usd: '$60-80K' }
        ],
        teams_formed: ['Engineering (3 people)', 'Product & Design (2 people)', 'Growth & CS (3 people)']
      },
      year_3: {
        team_size: 20,
        specialized_teams: ['Platform Engineering', 'Data & ML', 'Enterprise Sales', 'Customer Success'],
        leadership_needs: ['VP Engineering', 'Head of Sales', 'Head of Data']
      },
      contractor_vs_fulltime: [
        { function: 'DevOps / Infrastructure', recommendation: 'contractor', reasoning: 'Specialized skill, not needed daily at MVP — use managed services and contract for setup' },
        { function: 'Legal / Compliance', recommendation: 'contractor', reasoning: 'Use external counsel until Series A; too expensive to hire in-house pre-scale' },
        { function: 'Core Engineering', recommendation: 'fulltime', reasoning: 'Speed and product alignment require in-house engineers from day one' },
        { function: 'Content Marketing', recommendation: 'contractor', reasoning: 'Start with a freelancer to test channels before committing to a full-time hire' }
      ],
      avoid_early_hiring: [
        'VP Sales before achieving product-market fit — premature scaling kills startups',
        'HR Manager before 20 employees — use a PEO (Gusto, Rippling) instead',
        'QA Engineer before automated testing is in the culture — build this in from day 1',
        'Office Manager — stay fully remote until the team exceeds 30 people'
      ]
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
      investor_review: {
        investability_score: 68,
        verdict: 'CONDITIONAL_YES',
        reasoning: 'Technically sound approach with practical architecture choices. Market timing is favorable. Key risk is execution — the team must validate core assumptions before scaling infrastructure spend.',
        technical_moat: 'Data network effects and proprietary recommendation engine create compounding value over time',
        biggest_technical_strength: 'Scalable, cloud-native architecture designed to grow with the business without rewrites',
        biggest_technical_risk: 'Microservices complexity at MVP stage — adds operational overhead before achieving product-market fit',
        conditions: [
          'Validate PMF with 100 paying users before scaling infrastructure',
          'Ship MVP in under 12 weeks to test core assumptions quickly',
          'Reduce CAC by 30% through organic and referral channels'
        ]
      },
      devils_advocate: {
        most_dangerous_decision: 'Choosing distributed architecture before validating whether the product deserves the complexity — a modular monolith would ship faster and iterate faster',
        overengineered_components: [
          {
            component: 'Microservices architecture at MVP',
            issue: 'Adds deployment complexity, inter-service latency, and debugging difficulty before PMF',
            simpler_alternative: 'Modular monolith that can be extracted to services when specific bottlenecks emerge'
          },
          {
            component: 'Kubernetes orchestration',
            issue: 'Significant operational overhead — a team of 3 cannot run Kubernetes efficiently',
            simpler_alternative: 'Managed PaaS like Railway, Render, or ECS Fargate until you have a dedicated platform engineer'
          }
        ],
        wrong_assumptions: [
          'Users will pay before you have deeply validated their problem and your solution',
          'Competitors will not respond aggressively to your market entry',
          'Growth will be linear — it almost always requires step-change investments to unlock each stage'
        ]
      },
      confidence_scores: [
        { recommendation: 'Architecture viability', confidence: 76, reasoning: 'Sound technical choices with minor over-engineering at early stage' },
        { recommendation: 'Market timing', confidence: 70, reasoning: 'Growing market but increasingly competitive — differentiation needs sharpening' },
        { recommendation: 'Team execution', confidence: 65, reasoning: 'Insufficient team signal to score higher — execution is the hardest part' },
        { recommendation: 'Financial projections', confidence: 67, reasoning: 'Cost estimates are conservative but revenue assumptions are optimistic' }
      ],
      what_netflix_would_do_differently: [
        'A/B test every feature with 1% of users before full rollout — build experimentation infrastructure early',
        'Invest in personalization and recommendation algorithms from day one, not as an afterthought',
        'Build chaos engineering into the deployment pipeline immediately — resilience is a feature'
      ],
      what_stripe_would_do_differently: [
        'API-first design — treat developer experience as the primary product surface',
        'Obsess over 99.99% uptime from the first paying customer — reliability is the product promise',
        'Build comprehensive webhook and event systems for integrations before anyone asks for them'
      ],
      if_only_10k_left: 'Spend $6K on 3 months of cloud credits to keep the product live. Spend $3K on 20 deep user interviews to understand if the problem is real. Spend $1K on essential tooling. Shut down everything that is not core product.',
      if_funding_doubled: 'Hire a senior backend engineer and a growth hacker immediately. Extend runway to 18 months minimum. Accelerate to 1000 users before the next raise. Do not touch infrastructure scale until you hit product-market fit.',
      final_cto_statement: 'Technically sound blueprint with practical architecture choices. The biggest risk is not technical — it is market and execution. Ship an MVP in 8 weeks, get 100 people to pay, then let the data tell you what to build and scale next.'
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
