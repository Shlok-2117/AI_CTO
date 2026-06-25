import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function safeStr(val: any, fallback = '—'): string {
  if (!val) return fallback
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return fallback
}

function safeArr(val: any): any[] {
  return Array.isArray(val) ? val : []
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function scoreColor(score: number): string {
  if (score >= 80) return '#16a34a'
  if (score >= 60) return '#d97706'
  return '#dc2626'
}

function vcBadge(score: number): { label: string; bg: string; color: string } {
  if (score >= 80) return { label: 'STRONG BUY',          bg: '#dcfce7', color: '#16a34a' }
  if (score >= 65) return { label: 'BUY WITH CONDITIONS', bg: '#dbeafe', color: '#1d4ed8' }
  if (score >= 50) return { label: 'NEUTRAL',             bg: '#fef3c7', color: '#d97706' }
  return                   { label: 'PASS',               bg: '#fee2e2', color: '#dc2626' }
}

function ratingBadge(rating: string): string {
  const map: Record<string, string> = {
    critical: '#dc2626', high: '#ea580c',
    medium: '#d97706', low: '#16a34a',
    P0: '#dc2626', P1: '#ea580c', P2: '#d97706'
  }
  return map[rating?.toLowerCase()] || '#6366f1'
}

function methodColor(method: string): string {
  const map: Record<string, string> = {
    GET: '#16a34a', POST: '#2563eb',
    PUT: '#d97706', PATCH: '#d97706',
    DELETE: '#dc2626'
  }
  return map[method?.toUpperCase()] || '#6366f1'
}

export async function generatePDF(generationId: string): Promise<Buffer> {
  const generation = await prisma.generation.findUnique({
    where: { id: generationId }
  })
  if (!generation) throw new Error('Generation not found')

  const result = JSON.parse(generation.output)
  const r = result
  const projectName = generation.projectName || 'Blueprint'
  const generatedAt = new Date(generation.createdAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  })

  // FIX 1: title truncation + dynamic font size
  const displayTitle = projectName.length > 50
    ? projectName.slice(0, 47) + '...'
    : projectName
  const titleFontSize = projectName.length > 60 ? '36pt'
    : projectName.length > 40 ? '42pt'
    : '48pt'

  const vcScore = r.verdict?.investor_review?.investability_score || 0
  const badge = vcBadge(vcScore)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>${projectName} — CTO Blueprint</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

  *{margin:0;padding:0;box-sizing:border-box;}

  :root {
    --navy: #0f172a;
    --navy2: #1e3a5f;
    --cyan: #0ea5e9;
    --cyan-l: #e0f2fe;
    --amber: #d97706;
    --amber-l: #fef3c7;
    --green: #16a34a;
    --green-l: #dcfce7;
    --red: #dc2626;
    --red-l: #fee2e2;
    --purple: #7c3aed;
    --purple-l: #ede9fe;
    --gray: #64748b;
    --gray-l: #f8fafc;
    --border: #e2e8f0;
    --text: #0f172a;
    --text2: #475569;
    --white: #ffffff;
  }

  body {
    font-family: 'Inter', sans-serif;
    color: var(--text);
    background: var(--white);
    font-size: 10pt;
    line-height: 1.6;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    width: 210mm;
    min-height: 297mm;
    padding: 0;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }
  .page:last-child { page-break-after: avoid; }

  /* COVER */
  .cover {
    background: var(--navy);
    display: flex;
    flex-direction: column;
    min-height: 297mm;
  }
  .cover-top {
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 50px 40px;
    position: relative;
    overflow: hidden;
  }
  .cover-top::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }
  .cover-top::after {
    content: '';
    position: absolute;
    bottom: -80px; left: -80px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%);
    border-radius: 50%;
  }
  .cover-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(14,165,233,0.15);
    border: 1px solid rgba(14,165,233,0.3);
    border-radius: 6px;
    padding: 6px 14px;
    color: #7dd3fc;
    font-size: 8pt;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 28px;
    width: fit-content;
    position: relative; z-index: 1;
  }
  .cover-title {
    font-weight: 900;
    color: #ffffff;
    line-height: 1.1;
    margin-bottom: 12px;
    position: relative; z-index: 1;
    letter-spacing: -0.02em;
  }
  .cover-title span { color: var(--cyan); }
  .cover-sub {
    font-size: 13pt;
    color: #94a3b8;
    font-weight: 400;
    margin-bottom: 40px;
    position: relative; z-index: 1;
    max-width: 480px;
    line-height: 1.5;
  }
  .cover-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    position: relative; z-index: 1;
  }
  .cover-meta-item {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 8px;
    padding: 14px 16px;
  }
  .cover-meta-label {
    font-size: 7pt;
    color: #64748b;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 4px;
  }
  .cover-meta-value {
    font-size: 11pt;
    color: #f1f5f9;
    font-weight: 600;
  }
  .cover-footer {
    background: rgba(0,0,0,0.3);
    padding: 20px 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid rgba(255,255,255,0.06);
  }
  .cover-footer-left { font-size: 8pt; color: #475569; font-family: 'JetBrains Mono', monospace; }
  .cover-footer-right { font-size: 8pt; color: #475569; }

  /* TOC */
  .toc-page { padding: 50px; }
  .toc-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .toc-num { font-size: 8pt; font-weight: 700; color: var(--cyan); font-family: 'JetBrains Mono', monospace; width: 28px; flex-shrink: 0; }
  .toc-title { font-size: 10pt; font-weight: 500; color: var(--text); }

  /* CONTENT PAGES */
  .content-page { padding: 0; display: flex; flex-direction: column; }
  .page-header {
    background: var(--navy);
    padding: 24px 40px 20px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .phase-tag {
    font-size: 7pt; font-weight: 700; color: var(--cyan);
    letter-spacing: 0.2em; text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace; margin-bottom: 4px;
  }
  .page-h1 { font-size: 22pt; font-weight: 800; color: #ffffff; letter-spacing: -0.02em; line-height: 1; }
  .page-sub { font-size: 9pt; color: #94a3b8; margin-top: 4px; }
  .project-label { font-size: 7pt; color: #475569; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.05em; }
  .project-name-tag { font-size: 9pt; color: #7dd3fc; font-weight: 600; max-width: 180px; text-align: right; }
  .page-content { padding: 28px 40px; flex: 1; }
  .page-footer {
    border-top: 1px solid var(--border);
    padding: 10px 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
  }
  .footer-brand { font-size: 7pt; color: var(--gray); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; }
  .footer-page { font-size: 7pt; color: var(--gray); font-family: 'JetBrains Mono', monospace; }

  /* COMPONENTS */
  .section-label {
    font-size: 7pt; font-weight: 700; color: var(--cyan);
    letter-spacing: 0.2em; text-transform: uppercase;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 6px; margin-top: 20px;
  }
  .section-label:first-child { margin-top: 0; }
  .h2 { font-size: 14pt; font-weight: 700; color: var(--navy); margin-bottom: 8px; letter-spacing: -0.01em; }
  .body { font-size: 9.5pt; color: var(--text2); line-height: 1.65; margin-bottom: 10px; }

  .highlight {
    background: var(--cyan-l);
    border-left: 3px solid var(--cyan);
    border-radius: 0 6px 6px 0;
    padding: 12px 16px; margin: 12px 0;
  }
  .highlight p { font-size: 9.5pt; color: #0c4a6e; line-height: 1.55; margin: 0; font-weight: 500; }
  .warn-box {
    background: var(--amber-l);
    border-left: 3px solid var(--amber);
    border-radius: 0 6px 6px 0;
    padding: 10px 16px; margin: 10px 0;
  }
  .warn-box p { font-size: 9pt; color: #78350f; margin: 0; }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 10px 0; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 10px 0; }

  .stat-card {
    background: var(--gray-l); border: 1px solid var(--border);
    border-radius: 8px; padding: 14px 16px; text-align: center;
  }
  .stat-label { font-size: 7pt; color: var(--gray); letter-spacing: 0.1em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }
  .stat-value { font-size: 18pt; font-weight: 800; color: var(--navy); line-height: 1; }
  .stat-sub { font-size: 7.5pt; color: var(--gray); margin-top: 3px; }
  .stat-card.cyan .stat-value { color: var(--cyan); }
  .stat-card.green .stat-value { color: var(--green); }
  .stat-card.amber .stat-value { color: var(--amber); }
  .stat-card.red .stat-value { color: var(--red); }
  .stat-card.purple .stat-value { color: var(--purple); }

  .info-card {
    background: var(--white); border: 1px solid var(--border);
    border-radius: 8px; padding: 14px 16px; margin-bottom: 10px;
    break-inside: avoid;
  }
  .info-card-title { font-size: 10pt; font-weight: 700; color: var(--navy); margin-bottom: 4px; }
  .info-card-sub { font-size: 8.5pt; color: var(--text2); line-height: 1.5; }
  .info-card.cyan-accent { border-left: 3px solid var(--cyan); }
  .info-card.green-accent { border-left: 3px solid var(--green); }
  .info-card.amber-accent { border-left: 3px solid var(--amber); }
  .info-card.red-accent { border-left: 3px solid var(--red); }
  .info-card.purple-accent { border-left: 3px solid var(--purple); }

  .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 8.5pt; }
  .data-table th { background: var(--navy); color: var(--white); padding: 8px 10px; text-align: left; font-weight: 600; font-size: 7.5pt; letter-spacing: 0.05em; }
  .data-table td { padding: 7px 10px; border-bottom: 1px solid var(--border); color: var(--text2); vertical-align: top; }
  .data-table tr:nth-child(even) td { background: var(--gray-l); }
  .data-table tr:last-child td { border-bottom: none; }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 7pt; font-weight: 700; letter-spacing: 0.05em; font-family: 'JetBrains Mono', monospace; }

  .bullet-list { margin: 6px 0; padding-left: 0; list-style: none; }
  .bullet-list li { font-size: 9pt; color: var(--text2); padding: 3px 0 3px 18px; position: relative; line-height: 1.5; }
  .bullet-list li::before { content: '▸'; position: absolute; left: 0; color: var(--cyan); font-size: 8pt; }

  .check-list { margin: 6px 0; padding-left: 0; list-style: none; }
  .check-list li { font-size: 9pt; color: var(--text2); padding: 3px 0 3px 18px; position: relative; line-height: 1.5; }
  .check-list li::before { content: '✓'; position: absolute; left: 0; color: var(--green); font-size: 8pt; font-weight: 700; }
  .cross-list li::before { content: '✕'; color: var(--red); }

  .code-block { background: #0f172a; border-radius: 6px; padding: 12px 14px; margin: 10px 0; overflow: hidden; }
  .code-block code { font-family: 'JetBrains Mono', monospace; font-size: 7.5pt; color: #7dd3fc; line-height: 1.7; white-space: pre-wrap; word-break: break-all; }

  .divider { height: 1px; background: var(--border); margin: 16px 0; }

  @page { size: A4; margin: 0; }
  @media print {
    .page { page-break-after: always; }
    .page:last-child { page-break-after: avoid; }
    body { -webkit-print-color-adjust: exact; }
  }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="page cover">
  <div class="cover-top">
    <div class="cover-badge">JARVIS_CTO — CTO Intelligence System</div>
    <div class="cover-title" style="font-size:${titleFontSize}">
      ${displayTitle}<br/>
      <span>Technical Blueprint</span>
    </div>
    <div class="cover-sub">
      A complete 12-phase technical analysis generated by JARVIS_CTO's
      AI agent pipeline — from Founder Mindset to CTO Verdict.
    </div>
    <div class="cover-meta-grid">
      <div class="cover-meta-item">
        <div class="cover-meta-label">Generated by</div>
        <div class="cover-meta-value">JARVIS_CTO v2.0</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Date</div>
        <div class="cover-meta-value">${generatedAt}</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">Analysis Phases</div>
        <div class="cover-meta-value">12 AI Agents</div>
      </div>
      <div class="cover-meta-item">
        <div class="cover-meta-label">VC Score</div>
        <div class="cover-meta-value" style="color:${badge.color}">
          ${r.verdict?.investor_review?.investability_score || '—'}/100
          <span style="font-size:8pt;margin-left:6px;padding:2px 8px;border-radius:4px;background:${badge.bg};color:${badge.color}">${badge.label}</span>
        </div>
      </div>
    </div>
  </div>
  <div class="cover-footer">
    <div class="cover-footer-left">CONFIDENTIAL · GENERATED BY AI · FOR REFERENCE ONLY</div>
    <div class="cover-footer-right">ai-cto-two.vercel.app</div>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">JARVIS_CTO REPORT</div>
      <div class="page-h1">Table of Contents</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${[
      ['01','Founder Mindset','Business model, customer personas, revenue milestones'],
      ['02','Product Strategy','AARRR journey, features, North Star Metric'],
      ['03','System Architecture','Services, tech stack, and architectural decisions'],
      ['04','Data Modeling','Database schema, relationships, compliance'],
      ['05','API Design','REST endpoints, authentication, webhooks'],
      ['06','Scaling Roadmap','0 to 100M users, infrastructure evolution'],
      ['07','Security Audit','Threat model, OWASP coverage, risk score'],
      ['08','DevOps & CI/CD','Pipeline, deployment strategy, observability'],
      ['09','FinOps Analysis','Cloud costs, break-even, optimizations'],
      ['10','Hiring Plan','3-year team roadmap, salary ranges'],
      ['11','Architecture Diagrams','System, ER, and sequence diagrams'],
      ['12','CTO Verdict','Investability score, devil\'s advocate, final statement'],
    ].map(([num, title, desc]) => `
    <div class="toc-item">
      <span class="toc-num">${num}</span>
      <div style="flex:1">
        <div class="toc-title">${title}</div>
        <div style="font-size:7.5pt;color:var(--gray)">${desc}</div>
      </div>
    </div>`).join('')}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 2 of 14</span>
  </div>
</div>

<!-- PHASE 01 — FOUNDER MINDSET -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 01 · FOUNDER MINDSET</div>
      <div class="page-h1">Business Foundation</div>
      <div class="page-sub">Market opportunity, customer analysis, and revenue strategy</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.founder?.startup_identity ? `
    <div class="highlight">
      <p style="font-size:11pt;font-weight:700;color:#0c4a6e;margin-bottom:4px">
        ${safeStr(r.founder.startup_identity.one_line_pitch)}
      </p>
      <p>${safeStr(r.founder.startup_identity.problem_statement)}</p>
    </div>
    <div class="grid-2">
      <div class="info-card cyan-accent">
        <div class="info-card-title">Why Now</div>
        <div class="info-card-sub">${safeStr(r.founder.startup_identity.why_now)}</div>
      </div>
      <div class="info-card green-accent">
        <div class="info-card-title">Unfair Advantage</div>
        <div class="info-card-sub">${safeStr(r.founder.startup_identity.unfair_advantage)}</div>
      </div>
    </div>` : ''}

    ${r.founder?.customer?.primary_persona ? `
    <div class="section-label">Primary Customer Persona</div>
    <div class="info-card cyan-accent">
      <div class="info-card-title" style="font-size:12pt">${safeStr(r.founder.customer.primary_persona.name)}</div>
      <div class="grid-2" style="margin-top:10px">
        <div>
          <div style="font-size:7.5pt;font-weight:700;color:var(--gray);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em">Pain Points</div>
          <ul class="bullet-list">
            ${safeArr(r.founder.customer.primary_persona.pain_points).slice(0,4).map((p: string) => `<li>${p}</li>`).join('')}
          </ul>
        </div>
        <div>
          <div style="font-size:7.5pt;font-weight:700;color:var(--gray);margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em">Current Alternatives</div>
          <ul class="bullet-list">
            ${safeArr(r.founder.customer.primary_persona.current_alternatives).slice(0,4).map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>` : ''}

    ${r.founder?.revenue_milestones ? `
    <div class="section-label">Revenue Milestones</div>
    <table class="data-table">
      <thead><tr><th>Milestone</th><th>Strategy</th></tr></thead>
      <tbody>
        ${[
          ['First $100', r.founder.revenue_milestones.first_100_dollars],
          ['First $10K/mo', r.founder.revenue_milestones.first_10k_monthly],
          ['First $100K/mo', r.founder.revenue_milestones.first_100k_monthly],
          ['First $1M ARR', r.founder.revenue_milestones.first_1m_arr],
        ].filter(([,v]) => v).map(([m, v]) => `
        <tr><td><strong>${m}</strong></td><td>${safeStr(v)}</td></tr>`).join('')}
      </tbody>
    </table>` : ''}

    ${r.founder?.mvp_definition ? `
    <div class="grid-2">
      <div>
        <div class="section-label" style="color:var(--green)">Must Build (MVP)</div>
        <ul class="check-list">
          ${safeArr(r.founder.mvp_definition.must_have_features).slice(0,5).map((f: string) => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div>
        <div class="section-label" style="color:var(--red)">Must NOT Build Yet</div>
        <ul class="check-list cross-list">
          ${safeArr(r.founder.mvp_definition.must_NOT_build).slice(0,5).map((f: string) => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    </div>` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 3 of 14</span>
  </div>
</div>

<!-- PHASE 02 — PRODUCT STRATEGY -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 02 · PRODUCT STRATEGY</div>
      <div class="page-h1">Product & Growth</div>
      <div class="page-sub">User journey, core features, and key metrics</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.product?.metrics?.north_star_metric ? `
    <div class="highlight">
      <p style="font-size:7.5pt;font-weight:700;color:#0c4a6e;letter-spacing:.1em;margin-bottom:3px">NORTH STAR METRIC</p>
      <p style="font-size:13pt;font-weight:800;color:#0c4a6e">${r.product.metrics.north_star_metric}</p>
    </div>` : ''}

    ${r.product?.user_journey ? `
    <div class="section-label">AARRR User Journey</div>
    <table class="data-table">
      <thead><tr><th width="15%">Stage</th><th>Strategy</th></tr></thead>
      <tbody>
        ${[
          ['Awareness', r.product.user_journey.awareness, '#7c3aed'],
          ['Activation', r.product.user_journey.activation, '#0ea5e9'],
          ['Retention', r.product.user_journey.retention, '#16a34a'],
          ['Revenue', r.product.user_journey.revenue, '#d97706'],
          ['Referral', r.product.user_journey.referral, '#ec4899'],
        ].filter(([,v]) => v).map(([stage, val, color]) => `
        <tr>
          <td><span style="font-weight:700;color:${color}">${stage}</span></td>
          <td>${safeStr(val)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}

    ${safeArr(r.product?.core_features).length ? `
    <div class="section-label">Core Features</div>
    <table class="data-table">
      <thead><tr><th width="25%">Feature</th><th width="12%">Priority</th><th width="12%">Effort</th><th>User Story</th></tr></thead>
      <tbody>
        ${safeArr(r.product.core_features).slice(0,8).map((f: any) => `
        <tr>
          <td><strong>${safeStr(f.feature)}</strong></td>
          <td>
            <span class="badge" style="background:${ratingBadge(f.priority)}20;color:${ratingBadge(f.priority)}">
              ${safeStr(f.priority)}
            </span>
          </td>
          <td>${safeStr(f.effort)}</td>
          <td>${safeStr(f.user_story)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}

    ${safeArr(r.product?.metrics?.primary_metrics).length ? `
    <div class="section-label">Key Metrics & Targets</div>
    <table class="data-table">
      <thead><tr><th>Metric</th><th>3-Month Target</th><th>12-Month Target</th></tr></thead>
      <tbody>
        ${safeArr(r.product.metrics.primary_metrics).slice(0,5).map((m: any) => `
        <tr>
          <td><strong>${safeStr(m.metric)}</strong></td>
          <td style="color:var(--cyan);font-weight:600">${safeStr(m.target_month_3)}</td>
          <td style="color:var(--navy);font-weight:700">${safeStr(m.target_month_12)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 4 of 14</span>
  </div>
</div>

<!-- PHASE 03 — ARCHITECTURE -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 03 · SYSTEM ARCHITECTURE</div>
      <div class="page-h1">Technical Design</div>
      <div class="page-sub">Services, tech stack, and architectural decisions</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.architecture?.architecture_style ? `
    <div class="highlight">
      <p style="font-size:7.5pt;font-weight:700;color:#0c4a6e;margin-bottom:3px">ARCHITECTURE PATTERN</p>
      <p style="font-size:13pt;font-weight:800;color:#0c4a6e">${safeStr(r.architecture.architecture_style.pattern)}</p>
      <p style="margin-top:6px">${safeStr(r.architecture.architecture_style.justification)}</p>
    </div>` : ''}

    ${safeArr(r.architecture?.services).length ? `
    <div class="section-label">Service Breakdown</div>
    <table class="data-table">
      <thead><tr><th width="22%">Service</th><th width="20%">Technology</th><th>Responsibility</th><th width="25%">Why Separate</th></tr></thead>
      <tbody>
        ${safeArr(r.architecture.services).map((s: any) => `
        <tr>
          <td><strong>${safeStr(s.name)}</strong></td>
          <td><span style="color:var(--cyan);font-family:'JetBrains Mono',monospace;font-size:8pt">${safeStr(s.technology)}</span></td>
          <td>${safeStr(s.responsibility)}</td>
          <td style="font-size:8pt;color:var(--gray)">${safeStr(s.why_separate)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}

    ${safeArr(r.architecture?.technical_decisions).length ? `
    <div class="section-label">Key Technical Decisions</div>
    ${safeArr(r.architecture.technical_decisions).slice(0,4).map((d: any) => `
    <div class="info-card" style="margin-bottom:8px;break-inside:avoid">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <div class="info-card-title">${safeStr(d.decision)} → <span style="color:var(--cyan)">${safeStr(d.chosen)}</span></div>
        <span class="badge" style="background:${(d.confidence||0)>80?'#dcfce7':(d.confidence||0)>60?'#fef3c7':'#fee2e2'};color:${(d.confidence||0)>80?'#16a34a':(d.confidence||0)>60?'#d97706':'#dc2626'}">
          ${safeStr(d.confidence)}% confidence
        </span>
      </div>
      <div class="info-card-sub">${safeStr(d.reasoning)}</div>
    </div>`).join('')}` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 5 of 14</span>
  </div>
</div>

<!-- PHASE 04 — DATABASE -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 04 · DATA MODELING</div>
      <div class="page-h1">Database Design</div>
      <div class="page-sub">Schema, relationships, and compliance</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.database?.database_strategy ? `
    <div class="grid-3" style="margin-bottom:14px">
      <div class="stat-card cyan">
        <div class="stat-label">Primary Database</div>
        <div class="stat-value" style="font-size:11pt">${safeStr(r.database.database_strategy.primary_database)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cache Layer</div>
        <div class="stat-value" style="font-size:11pt">${safeStr(r.database.database_strategy.caching_layer)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">File Storage</div>
        <div class="stat-value" style="font-size:11pt">${safeStr(r.database.database_strategy.file_storage)}</div>
      </div>
    </div>` : ''}

    ${safeArr(r.database?.tables).slice(0,3).map((table: any) => `
    <div class="section-label">${safeStr(table.name)} Table</div>
    <table class="data-table" style="margin-bottom:12px">
      <thead><tr><th width="20%">Column</th><th width="15%">Type</th><th width="25%">Constraints</th><th>Purpose</th><th width="8%">PII</th></tr></thead>
      <tbody>
        ${safeArr(table.columns).slice(0,6).map((col: any) => `
        <tr>
          <td><code style="font-family:'JetBrains Mono',monospace;font-size:8pt">${safeStr(col.name)}</code></td>
          <td><span style="color:var(--purple);font-family:'JetBrains Mono',monospace;font-size:7.5pt">${safeStr(col.type)}</span></td>
          <td style="font-size:7.5pt">${safeArr(col.constraints).join(', ')}</td>
          <td style="font-size:8pt;color:var(--gray)">${safeStr(col.purpose || col.description || '')}</td>
          <td>${col.pii ? '<span class="badge" style="background:#fef3c7;color:#92400e">PII</span>' : ''}</td>
        </tr>`).join('')}
      </tbody>
    </table>`).join('')}

    ${r.database?.sql_preview ? `
    <div class="section-label">SQL Preview</div>
    <div class="code-block">
      <code>${escapeHtml(r.database.sql_preview.substring(0,600))}${r.database.sql_preview.length > 600 ? '\n-- ... (truncated)' : ''}</code>
    </div>` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 6 of 14</span>
  </div>
</div>

<!-- PHASE 05 — API DESIGN -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 05 · API DESIGN</div>
      <div class="page-h1">API Specification</div>
      <div class="page-sub">Endpoints, authentication, and error handling</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.api?.api_strategy ? `
    <div class="grid-3" style="margin-bottom:14px">
      <div class="stat-card cyan"><div class="stat-label">Style</div><div class="stat-value" style="font-size:11pt">${safeStr(r.api.api_strategy.style)}</div></div>
      <div class="stat-card"><div class="stat-label">Auth</div><div class="stat-value" style="font-size:10pt">${safeStr(r.api.api_strategy.authentication)}</div></div>
      <div class="stat-card"><div class="stat-label">Base URL</div><div class="stat-value" style="font-size:10pt">${safeStr(r.api.api_strategy.base_url)}</div></div>
    </div>` : ''}

    ${safeArr(r.api?.endpoints).length ? `
    <div class="section-label">Endpoints (${safeArr(r.api.endpoints).length} total)</div>
    <table class="data-table">
      <thead><tr><th width="10%">Method</th><th width="30%">Path</th><th>Description</th><th width="10%">Auth</th><th width="10%">Rate Ltd</th></tr></thead>
      <tbody>
        ${safeArr(r.api.endpoints).slice(0,12).map((ep: any) => `
        <tr>
          <td>
            <span class="badge" style="background:${methodColor(ep.method)}20;color:${methodColor(ep.method)};font-weight:800">
              ${safeStr(ep.method)}
            </span>
          </td>
          <td><code style="font-family:'JetBrains Mono',monospace;font-size:7.5pt">${safeStr(ep.path)}</code></td>
          <td style="font-size:8.5pt">${safeStr(ep.description)}</td>
          <td style="text-align:center">${ep.auth_required ? '🔒' : '—'}</td>
          <td style="text-align:center">${ep.rate_limited ? '✓' : '—'}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}

    ${safeArr(r.api?.error_handling?.error_codes).length ? `
    <div class="section-label">Standard Error Codes</div>
    <div class="grid-2">
      ${safeArr(r.api.error_handling.error_codes).slice(0,6).map((e: any) => `
      <div class="info-card red-accent" style="margin:0">
        <div style="display:flex;justify-content:space-between">
          <span style="font-family:'JetBrains Mono',monospace;font-size:8pt;font-weight:700;color:var(--red)">${safeStr(e.code)}</span>
          <span class="badge" style="background:#fee2e2;color:#dc2626">HTTP ${safeStr(e.http_status)}</span>
        </div>
        <div class="info-card-sub">${safeStr(e.description)}</div>
      </div>`).join('')}
    </div>` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 7 of 14</span>
  </div>
</div>

<!-- PHASE 06 — SCALING -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 06 · SCALING ROADMAP</div>
      <div class="page-h1">Infrastructure Evolution</div>
      <div class="page-sub">From zero to 100 million users</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${safeArr(r.scaling?.scaling_stages).length ? `
    <table class="data-table">
      <thead><tr><th width="5%">#</th><th width="18%">Stage</th><th width="15%">Cost/mo</th><th>Infrastructure</th><th>Bottleneck</th></tr></thead>
      <tbody>
        ${safeArr(r.scaling.scaling_stages).map((s: any) => `
        <tr>
          <td style="font-weight:700;color:var(--cyan);font-family:'JetBrains Mono',monospace">${safeStr(s.stage)}</td>
          <td><strong>${safeStr(s.users)}</strong></td>
          <td style="color:var(--green);font-weight:700">$${safeStr(s.estimated_monthly_cost_usd)}</td>
          <td style="font-size:8pt">${safeStr(s.infrastructure)}</td>
          <td style="font-size:8pt;color:var(--red)">${safeStr(s.bottleneck)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}

    ${r.scaling?.reliability ? `
    <div class="section-label">Reliability Targets</div>
    <div class="grid-3" style="margin-bottom:14px">
      <div class="stat-card green">
        <div class="stat-label">Target Uptime</div>
        <div class="stat-value" style="font-size:14pt">${safeStr(r.scaling.reliability.target_uptime)}</div>
      </div>
      <div class="stat-card amber">
        <div class="stat-label">RTO</div>
        <div class="stat-value" style="font-size:14pt">${safeStr(r.scaling.reliability.rto)}</div>
      </div>
      <div class="stat-card cyan">
        <div class="stat-label">RPO</div>
        <div class="stat-value" style="font-size:14pt">${safeStr(r.scaling.reliability.rpo)}</div>
      </div>
    </div>

    ${safeArr(r.scaling.reliability.failure_scenarios).length ? `
    <div class="section-label">Failure Scenarios & Recovery</div>
    <table class="data-table">
      <thead><tr><th>Scenario</th><th width="15%">Probability</th><th>Recovery Plan</th></tr></thead>
      <tbody>
        ${safeArr(r.scaling.reliability.failure_scenarios).slice(0,5).map((s: any) => `
        <tr>
          <td><strong>${safeStr(s.scenario)}</strong></td>
          <td>
            <span class="badge" style="background:${ratingBadge(s.probability)}20;color:${ratingBadge(s.probability)}">
              ${safeStr(s.probability)}
            </span>
          </td>
          <td>${safeStr(s.recovery)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 8 of 14</span>
  </div>
</div>

<!-- PHASE 07 — SECURITY -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 07 · SECURITY AUDIT</div>
      <div class="page-h1">Security Review</div>
      <div class="page-sub">Threat model, OWASP coverage, and compliance roadmap</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.security ? `
    <div style="display:flex;gap:16px;align-items:flex-start;margin-bottom:16px">
      <div style="flex:1">
        <div class="section-label">Overall Risk Assessment</div>
        <div style="background:${
          r.security.risk_score==='Critical'?'#ede9fe':
          r.security.risk_score==='High'?'#fee2e2':
          r.security.risk_score==='Medium'?'#fef3c7':'#dcfce7'
        };border-radius:8px;padding:16px;border-left:4px solid ${
          r.security.risk_score==='Critical'?'#7c3aed':
          r.security.risk_score==='High'?'#dc2626':
          r.security.risk_score==='Medium'?'#d97706':'#16a34a'
        }">
          <div style="font-size:7.5pt;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--gray);margin-bottom:4px">RISK SCORE</div>
          <div style="font-size:20pt;font-weight:900;color:${
            r.security.risk_score==='Critical'?'#7c3aed':
            r.security.risk_score==='High'?'#dc2626':
            r.security.risk_score==='Medium'?'#d97706':'#16a34a'
          }">${safeStr(r.security.risk_score)}</div>
        </div>
        ${safeArr(r.security.top_3_risks).length ? `
        <div class="warn-box" style="margin-top:10px">
          <p style="font-weight:700;margin-bottom:6px">Top Risk Factors:</p>
          ${safeArr(r.security.top_3_risks).map((risk: string) => `<p style="margin:2px 0">▸ ${risk}</p>`).join('')}
        </div>` : ''}
      </div>
    </div>

    ${r.security.checklist && typeof r.security.checklist === 'object' ? `
    <div class="section-label">Security Checklist</div>
    ${Object.entries(r.security.checklist).slice(0,3).map(([cat, items]: any) =>
      Array.isArray(items) && items.length > 0 ? `
    <div class="info-card" style="margin-bottom:8px">
      <div class="info-card-title">${cat.replace(/_/g,' ').toUpperCase()}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-top:8px">
        ${items.slice(0,6).map((item: any) => `
        <div style="display:flex;gap:6px;align-items:flex-start;font-size:8.5pt">
          <span style="color:${ratingBadge(item.priority||'medium')};font-weight:700;flex-shrink:0">●</span>
          <span style="color:var(--text2)">${typeof item === 'string' ? item : safeStr(item.item)}</span>
        </div>`).join('')}
      </div>
    </div>` : '').join('')}` : ''}` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 9 of 14</span>
  </div>
</div>

<!-- PHASE 08 — DEVOPS -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 08 · DEVOPS & CI/CD</div>
      <div class="page-h1">Engineering Operations</div>
      <div class="page-sub">Pipeline, deployment strategy, and observability</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.devops?.ci_cd ? `
    <div class="grid-3" style="margin-bottom:14px">
      <div class="stat-card cyan">
        <div class="stat-label">Platform</div>
        <div class="stat-value" style="font-size:11pt">${safeStr(r.devops.ci_cd.platform)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Strategy</div>
        <div class="stat-value" style="font-size:10pt">${safeStr(r.devops.ci_cd.deployment_strategy)}</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Deploy Frequency</div>
        <div class="stat-value" style="font-size:10pt">${safeStr(r.devops.ci_cd.deployment_frequency)}</div>
      </div>
    </div>

    ${safeArr(r.devops.ci_cd.pipeline_stages).length ? `
    <div class="section-label">CI/CD Pipeline Stages</div>
    <table class="data-table">
      <thead><tr><th width="25%">Stage</th><th width="15%">Duration</th><th>Actions</th></tr></thead>
      <tbody>
        ${safeArr(r.devops.ci_cd.pipeline_stages).map((s: any) => `
        <tr>
          <td><strong>${typeof s === 'string' ? s : safeStr(s.stage)}</strong></td>
          <td style="color:var(--cyan);font-family:'JetBrains Mono',monospace">${typeof s !== 'string' && s.estimated_duration_mins ? `~${s.estimated_duration_mins}m` : '—'}</td>
          <td>
            ${typeof s !== 'string' ? safeArr(s.actions).map((a: string) => `
            <span class="badge" style="background:var(--gray-l);color:var(--gray);margin:1px">${a}</span>`).join('') : ''}
          </td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}` : ''}

    ${r.devops?.observability ? `
    <div class="section-label">Observability Stack</div>
    <div class="grid-3">
      ${[
        ['Logging', r.devops.observability.logging, '#0ea5e9'],
        ['Metrics', r.devops.observability.metrics, '#16a34a'],
        ['Tracing', r.devops.observability.tracing, '#7c3aed'],
      ].filter(([,v]) => v).map(([label, data, color]: any) => `
      <div class="info-card" style="border-left:3px solid ${color}">
        <div class="info-card-title">${label}</div>
        <div style="font-size:12pt;font-weight:800;color:${color};margin:4px 0">${safeStr((data as any).tool)}</div>
        ${(data as any).retention_days ? `<div class="info-card-sub">Retention: ${(data as any).retention_days} days</div>` : ''}
      </div>`).join('')}
    </div>` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 10 of 14</span>
  </div>
</div>

<!-- PHASE 09 — FINOPS -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 09 · FINOPS ANALYSIS</div>
      <div class="page-h1">Cloud Cost Analysis</div>
      <div class="page-sub">Infrastructure costs, break-even, and optimizations</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.finops?.tiers ? `
    <div class="section-label">Cost Tiers</div>
    <div class="grid-3">
      ${Object.entries(r.finops.tiers).map(([tier, data]: any) => `
      <div class="stat-card ${tier === 'mvp' ? 'green' : tier === 'growth' ? 'amber' : 'red'}">
        <div class="stat-label">${tier.toUpperCase()} TIER</div>
        <div class="stat-value">$${data.monthly_usd}</div>
        <div class="stat-sub">per month</div>
        ${data.description ? `<div style="font-size:7.5pt;color:var(--gray);margin-top:6px">${data.description}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}

    ${r.finops?.revenue_vs_infra ? `
    <div class="grid-2" style="margin:14px 0">
      <div class="info-card green-accent">
        <div class="info-card-title">Break-Even Users</div>
        <div style="font-size:18pt;font-weight:900;color:var(--green)">${safeStr(r.finops.revenue_vs_infra.break_even_users)}</div>
        <div class="info-card-sub">users needed to cover infrastructure costs</div>
      </div>
      <div class="info-card cyan-accent">
        <div class="info-card-title">Target Infra % of Revenue</div>
        <div style="font-size:18pt;font-weight:900;color:var(--cyan)">${safeStr(r.finops.revenue_vs_infra.target_infra_as_percent_revenue)}</div>
        <div class="info-card-sub">maximum infra cost as % of revenue</div>
      </div>
    </div>` : ''}

    ${safeArr(r.finops?.optimization_opportunities).length ? `
    <div class="section-label">Optimization Opportunities</div>
    <table class="data-table">
      <thead><tr><th>Opportunity</th><th width="18%">Current Cost</th><th width="18%">Optimized</th><th width="15%">Savings</th></tr></thead>
      <tbody>
        ${safeArr(r.finops.optimization_opportunities).map((o: any) => `
        <tr>
          <td><strong>${safeStr(o.opportunity)}</strong></td>
          <td style="color:var(--red)">$${safeStr(o.current_cost)}/mo</td>
          <td style="color:var(--green)">$${safeStr(o.optimized_cost)}/mo</td>
          <td>
            <span class="badge" style="background:#dcfce7;color:#16a34a;font-size:9pt">
              -${safeStr(o.savings_percent)}%
            </span>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 11 of 14</span>
  </div>
</div>

<!-- PHASE 10 — HIRING -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 10 · HIRING PLAN</div>
      <div class="page-h1">Engineering Team</div>
      <div class="page-sub">3-year hiring roadmap with roles, timing, and compensation</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    ${r.hiring?.hiring_philosophy ? `
    <div class="highlight">
      <p><strong>Philosophy:</strong> ${safeStr(r.hiring.hiring_philosophy)}</p>
    </div>` : ''}

    ${safeArr(r.hiring?.year_1?.hires).length ? `
    <div class="section-label">Year 1 — ${r.hiring.year_1.team_size || ''} People · $${(r.hiring.year_1.total_salary_burn_usd||0).toLocaleString()}/year</div>
    <table class="data-table">
      <thead><tr><th width="25%">Role</th><th width="20%">When to Hire</th><th width="22%">Salary Range</th><th>Why Now</th></tr></thead>
      <tbody>
        ${safeArr(r.hiring.year_1.hires).map((h: any) => `
        <tr>
          <td>
            <strong>${safeStr(h.role)}</strong>
            ${h.can_be_founder ? '<span class="badge" style="background:#fef3c7;color:#92400e;margin-left:4px">Founder</span>' : ''}
          </td>
          <td style="font-size:8pt">${safeStr(h.when_to_hire)}</td>
          <td style="color:var(--green);font-weight:600;font-family:'JetBrains Mono',monospace;font-size:8pt">${safeStr(h.salary_range_usd)}</td>
          <td style="font-size:8pt">${safeStr(h.why_this_role_now)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}

    ${safeArr(r.hiring?.avoid_early_hiring).length ? `
    <div class="section-label" style="color:var(--red)">Do NOT Hire Early</div>
    <div class="grid-2">
      ${safeArr(r.hiring.avoid_early_hiring).map((item: string) => `
      <div style="display:flex;gap:6px;align-items:flex-start;font-size:8.5pt;padding:4px 0">
        <span style="color:var(--red);font-weight:700;flex-shrink:0">✕</span>
        <span style="color:var(--text2)">${item}</span>
      </div>`).join('')}
    </div>` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 12 of 14</span>
  </div>
</div>

<!-- PHASE 11 — DIAGRAMS -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 11 · ARCHITECTURE DIAGRAMS</div>
      <div class="page-h1">Visual Blueprint</div>
      <div class="page-sub">System architecture, ER diagram, and sequence flow</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">
    <div class="warn-box">
      <p>Paste any diagram code block below into <strong>mermaid.live</strong> to render it as an interactive visual diagram.</p>
    </div>

    ${r.diagrams?.architecture ? `
    <div class="section-label">System Architecture Diagram</div>
    <pre style="background:#0a0a1a;color:#00ffff;padding:16px;border-radius:8px;font-family:monospace;font-size:10px;border:1px solid #00ffff33;white-space:pre-wrap;word-break:break-all;margin:8px 0">${escapeHtml(String(r.diagrams.architecture).substring(0, 800))}${String(r.diagrams.architecture).length > 800 ? '\n... (truncated)' : ''}</pre>
    <p style="color:#666;font-size:10px;margin-top:4px">📊 Paste above code at mermaid.live to view diagram</p>` : ''}

    ${r.diagrams?.er_diagram ? `
    <div class="section-label" style="margin-top:16px">Entity Relationship (ER) Diagram</div>
    <pre style="background:#0a0a1a;color:#00ffff;padding:16px;border-radius:8px;font-family:monospace;font-size:10px;border:1px solid #00ffff33;white-space:pre-wrap;word-break:break-all;margin:8px 0">${escapeHtml(String(r.diagrams.er_diagram).substring(0, 600))}${String(r.diagrams.er_diagram).length > 600 ? '\n... (truncated)' : ''}</pre>
    <p style="color:#666;font-size:10px;margin-top:4px">📊 Paste above code at mermaid.live to view diagram</p>` : ''}

    ${r.diagrams?.sequence ? `
    <div class="section-label" style="margin-top:16px">Sequence Diagram</div>
    <pre style="background:#0a0a1a;color:#00ffff;padding:16px;border-radius:8px;font-family:monospace;font-size:10px;border:1px solid #00ffff33;white-space:pre-wrap;word-break:break-all;margin:8px 0">${escapeHtml(String(r.diagrams.sequence).substring(0, 400))}${String(r.diagrams.sequence).length > 400 ? '\n... (truncated)' : ''}</pre>
    <p style="color:#666;font-size:10px;margin-top:4px">📊 Paste above code at mermaid.live to view diagram</p>` : ''}
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 13 of 14</span>
  </div>
</div>

<!-- PHASE 12 — CTO VERDICT -->
<div class="page content-page">
  <div class="page-header">
    <div class="page-header-left">
      <div class="phase-tag">PHASE 12 · CTO VERDICT</div>
      <div class="page-h1">Investment Verdict</div>
      <div class="page-sub">Devil's advocate analysis and VC investability score</div>
    </div>
    <div class="page-header-right">
      <div class="project-label">PROJECT</div>
      <div class="project-name-tag">${projectName}</div>
    </div>
  </div>
  <div class="page-content">

    <!-- VC Score + Reasoning -->
    ${r.verdict?.investor_review ? `
    <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:16px">
      <div style="text-align:center;flex-shrink:0">
        <div style="width:90px;height:90px;border-radius:50%;border:4px solid ${scoreColor(vcScore)};display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:8px">
          <div style="font-size:24pt;font-weight:900;color:${scoreColor(vcScore)};line-height:1">
            ${safeStr(r.verdict.investor_review.investability_score, '0')}
          </div>
          <div style="font-size:7pt;color:var(--gray)">/100</div>
        </div>
        <div style="display:inline-block;padding:5px 10px;border-radius:6px;font-size:8pt;font-weight:800;background:${badge.bg};color:${badge.color};white-space:nowrap">
          ${badge.label}
        </div>
      </div>
      <div style="flex:1">
        <div class="highlight" style="margin:0 0 10px 0">
          <p>${safeStr(r.verdict.investor_review.reasoning)}</p>
        </div>
        ${r.verdict.investor_review.technical_moat ? `
        <div class="info-card cyan-accent" style="margin:0">
          <div class="info-card-title">Technical Moat</div>
          <div class="info-card-sub">${safeStr(r.verdict.investor_review.technical_moat)}</div>
        </div>` : ''}
      </div>
    </div>
    ${safeArr(r.verdict.investor_review.conditions).length ? `
    <div class="section-label" style="color:var(--amber)">Conditions for Investment</div>
    <ul class="check-list">
      ${safeArr(r.verdict.investor_review.conditions).map((c: string) => `<li>${c}</li>`).join('')}
    </ul>` : ''}` : ''}

    <!-- Devil's Advocate -->
    ${r.verdict?.devils_advocate ? `
    <div class="section-label" style="margin-top:12px">Devil's Advocate</div>
    ${r.verdict.devils_advocate.most_dangerous_decision ? `
    <div class="warn-box">
      <p style="font-weight:700;margin-bottom:4px">Most Dangerous Decision:</p>
      <p>${safeStr(r.verdict.devils_advocate.most_dangerous_decision)}</p>
    </div>` : ''}
    ${safeArr(r.verdict.devils_advocate.overengineered_components).length ? `
    <div style="margin-top:8px">
      ${safeArr(r.verdict.devils_advocate.overengineered_components).map((c: any) => `
      <div class="info-card red-accent" style="margin-bottom:6px">
        <div class="info-card-title">${safeStr(c.component)}</div>
        <div class="info-card-sub">${safeStr(c.issue)}</div>
        ${c.simpler_alternative ? `<div style="font-size:8pt;color:var(--green);margin-top:4px">✓ Alternative: ${safeStr(c.simpler_alternative)}</div>` : ''}
      </div>`).join('')}
    </div>` : ''}
    ${safeArr(r.verdict.devils_advocate.wrong_assumptions).length ? `
    <div class="section-label" style="color:var(--amber)">Wrong Assumptions to Challenge</div>
    <ul class="check-list cross-list">
      ${safeArr(r.verdict.devils_advocate.wrong_assumptions).slice(0,4).map((a: string) => `<li>${a}</li>`).join('')}
    </ul>` : ''}` : ''}

    <!-- Netflix vs Stripe -->
    ${(safeArr(r.verdict?.what_netflix_would_do_differently).length || safeArr(r.verdict?.what_stripe_would_do_differently).length) ? `
    <div class="grid-2" style="margin-top:12px">
      ${safeArr(r.verdict?.what_netflix_would_do_differently).length ? `
      <div class="info-card amber-accent">
        <div class="info-card-title">vs Netflix</div>
        <ul class="bullet-list" style="margin-top:6px">
          ${safeArr(r.verdict.what_netflix_would_do_differently).slice(0,3).map((n: string) => `<li>${n}</li>`).join('')}
        </ul>
      </div>` : ''}
      ${safeArr(r.verdict?.what_stripe_would_do_differently).length ? `
      <div class="info-card purple-accent">
        <div class="info-card-title">vs Stripe</div>
        <ul class="bullet-list" style="margin-top:6px">
          ${safeArr(r.verdict.what_stripe_would_do_differently).slice(0,3).map((s: string) => `<li>${s}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>` : ''}

    <!-- Confidence Scores -->
    ${safeArr(r.verdict?.confidence_scores).length ? `
    <div class="section-label" style="margin-top:10px">Confidence Scores by Area</div>
    <table class="data-table">
      <thead><tr><th>Area</th><th width="15%">Score</th><th>Reasoning</th></tr></thead>
      <tbody>
        ${safeArr(r.verdict.confidence_scores).map((cs: any) => `
        <tr>
          <td><strong>${safeStr(cs.recommendation)}</strong></td>
          <td style="color:${scoreColor(cs.confidence||0)};font-weight:700;font-family:'JetBrains Mono',monospace">${safeStr(cs.confidence)}/100</td>
          <td style="font-size:8pt">${safeStr(cs.reasoning)}</td>
        </tr>`).join('')}
      </tbody>
    </table>` : ''}

    <!-- Final Statement -->
    ${r.verdict?.final_cto_statement || r.verdict?.final_statement ? `
    <div class="divider"></div>
    <div class="highlight" style="border-left-color:var(--navy);background:#f8fafc">
      <p style="font-size:7.5pt;font-weight:700;color:var(--gray);letter-spacing:.1em;margin-bottom:6px">CTO FINAL STATEMENT</p>
      <p style="font-size:10pt;color:var(--navy);font-weight:500;font-style:italic;line-height:1.7">
        "${safeStr(r.verdict.final_cto_statement || r.verdict.final_statement)}"
      </p>
    </div>` : ''}

    <div style="margin-top:20px;padding:16px;background:var(--navy);border-radius:8px;text-align:center">
      <div style="font-size:7.5pt;color:#475569;letter-spacing:.1em;margin-bottom:6px">GENERATED BY</div>
      <div style="font-size:14pt;font-weight:900;color:#00d4ff;letter-spacing:.05em">JARVIS_CTO</div>
      <div style="font-size:8pt;color:#64748b;margin-top:4px">ai-cto-two.vercel.app · 12-Phase AI Architecture Generator · ${generatedAt}</div>
    </div>
  </div>
  <div class="page-footer">
    <span class="footer-brand">JARVIS_CTO · ai-cto-two.vercel.app · ${generatedAt}</span>
    <span class="footer-page">Page 14 of 14</span>
  </div>
</div>

</body>
</html>`

  const executablePath = process.env.NODE_ENV === 'production'
    ? await chromium.executablePath()
    : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  })

  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: 'load' })

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' }
  })

  await browser.close()
  return Buffer.from(pdf)
}
