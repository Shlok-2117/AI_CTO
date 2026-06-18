import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

export async function generatePDF(data: any): Promise<Buffer> {
  const executablePath = process.env.NODE_ENV === 'production'
    ? await chromium.executablePath()
    : 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  })

  const page = await browser.newPage()
  await page.setContent(buildHTML(data), { waitUntil: 'load' })

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
  })

  await browser.close()
  return Buffer.from(pdf)
}

function buildHTML(data: any): string {
  const { projectName, result } = data
  const arch = result?.architecture
  const db = result?.database
  const api = result?.api
  const cost = result?.cost
  const security = result?.security

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; background: white; }

    .cover { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); color: white; padding: 80px 60px; min-height: 297mm; display: flex; flex-direction: column; justify-content: center; }
    .cover-badge { background: rgba(124,58,237,0.3); border: 1px solid rgba(124,58,237,0.5); color: #c4b5fd; padding: 6px 16px; border-radius: 20px; font-size: 12px; display: inline-block; margin-bottom: 24px; }
    .cover h1 { font-size: 42px; font-weight: 700; margin-bottom: 16px; line-height: 1.2; }
    .cover h1 span { color: #7c3aed; }
    .cover p { font-size: 16px; color: #94a3b8; max-width: 500px; line-height: 1.6; margin-bottom: 48px; }
    .cover-meta { display: flex; gap: 40px; }
    .cover-meta div { }
    .cover-meta .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .cover-meta .value { font-size: 14px; color: #e2e8f0; font-weight: 500; }

    .page { padding: 40px 50px; page-break-before: always; }
    h2 { font-size: 22px; font-weight: 700; color: #1a1a2e; border-bottom: 3px solid #7c3aed; padding-bottom: 10px; margin-bottom: 20px; }
    h3 { font-size: 15px; font-weight: 600; color: #374151; margin: 16px 0 8px; }

    .services-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .service-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; border-left: 4px solid #7c3aed; }
    .service-name { font-size: 14px; font-weight: 600; color: #1a1a2e; }
    .service-tech { font-size: 12px; color: #7c3aed; margin: 2px 0; }
    .service-resp { font-size: 11px; color: #6b7280; }

    .tech-stack { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
    .tech-badge { background: #ede9fe; color: #5b21b6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; }
    th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #e2e8f0; }
    td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; color: #4b5563; }
    tr:hover td { background: #fafafa; }

    .endpoint { display: flex; align-items: flex-start; gap: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px; border: 1px solid #e2e8f0; }
    .method { padding: 3px 8px; border-radius: 5px; font-size: 11px; font-weight: 700; min-width: 52px; text-align: center; font-family: monospace; }
    .GET { background: #dcfce7; color: #166534; }
    .POST { background: #dbeafe; color: #1e40af; }
    .PUT { background: #fef9c3; color: #854d0e; }
    .DELETE { background: #fee2e2; color: #991b1b; }
    .PATCH { background: #fce7f3; color: #9d174d; }
    .endpoint-info .path { font-size: 13px; font-weight: 600; color: #1a1a2e; font-family: monospace; }
    .endpoint-info .desc { font-size: 11px; color: #6b7280; margin-top: 2px; }

    .cost-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .cost-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; text-align: center; }
    .cost-tier { font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin-bottom: 8px; }
    .cost-amount { font-size: 28px; font-weight: 700; color: #1a1a2e; }
    .cost-period { font-size: 12px; color: #6b7280; }
    .cost-desc { font-size: 11px; color: #9ca3af; margin-top: 6px; }

    .risk-badge { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
    .risk-High { background: #fee2e2; color: #991b1b; }
    .risk-Medium { background: #fef9c3; color: #854d0e; }
    .risk-Low { background: #dcfce7; color: #166534; }
    .risk-Critical { background: #fce7f3; color: #9d174d; }

    .checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .priority { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; flex-shrink: 0; }
    .priority-critical { background: #fee2e2; color: #991b1b; }
    .priority-high { background: #ffedd5; color: #9a3412; }
    .priority-medium { background: #fef9c3; color: #854d0e; }
    .checklist-text { font-size: 12px; color: #374151; }

    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #9ca3af; font-size: 11px; }

    .tip { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 10px 14px; border-radius: 0 8px 8px 0; margin-bottom: 8px; font-size: 12px; color: #166534; }
    .diagram-placeholder { background: #1e1b4b; border: 1px solid #4c1d95; border-radius: 8px; padding: 16px; font-family: monospace; font-size: 10px; color: #a78bfa; white-space: pre-wrap; word-break: break-all; margin-bottom: 16px; }
  </style>
</head>
<body>

<!-- Cover Page -->
<div class="cover">
  <div class="cover-badge">AI CTO Report</div>
  <h1>${projectName || 'System Architecture'}<br><span>Technical Blueprint</span></h1>
  <p>${arch?.summary || 'Complete system architecture generated by AI CTO'}</p>
  <div class="cover-meta">
    <div>
      <div class="label">Generated On</div>
      <div class="value">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    </div>
    <div>
      <div class="label">Total Services</div>
      <div class="value">${arch?.services?.length || 0} services</div>
    </div>
    <div>
      <div class="label">Database Tables</div>
      <div class="value">${db?.total_tables || db?.tables?.length || 0} tables</div>
    </div>
    <div>
      <div class="label">API Endpoints</div>
      <div class="value">${api?.total_endpoints || api?.endpoints?.length || 0} endpoints</div>
    </div>
  </div>
</div>

<!-- Architecture Page -->
<div class="page">
  <h2>System Architecture</h2>
  <div class="services-grid">
    ${arch?.services?.map((s: any) => `
      <div class="service-card">
        <div class="service-name">${s.name}</div>
        <div class="service-tech">${s.technology}</div>
        <div class="service-resp">${s.responsibility}</div>
      </div>
    `).join('') || ''}
  </div>
  <h3>Tech Stack</h3>
  <div class="tech-stack">
    ${arch?.tech_stack ? Object.entries(arch.tech_stack).map(([k, v]) => `
      <span class="tech-badge">${k}: ${v}</span>
    `).join('') : ''}
  </div>
  <h3>Scaling Strategy</h3>
  <p style="font-size:13px;color:#4b5563;line-height:1.6">${arch?.scaling_strategy || ''}</p>
  <div class="footer">AI CTO — System Architecture Report · ${projectName}</div>
</div>

<!-- Database Page -->
<div class="page">
  <h2>Database Schema</h2>
  ${db?.tables?.slice(0, 4).map((table: any) => `
    <h3>${table.name} <span style="font-size:11px;color:#9ca3af;font-weight:400">— ${table.purpose}</span></h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>Constraints</th></thead>
      <tbody>
        ${table.columns?.map((col: any) => `
          <tr>
            <td style="font-family:monospace;font-weight:600">${col.name}</td>
            <td style="font-family:monospace;color:#7c3aed">${col.type}</td>
            <td>${col.constraints?.join(', ') || ''}</td>
          </tr>
        `).join('') || ''}
      </tbody>
    </table>
  `).join('') || ''}
  <div class="footer">AI CTO — Database Schema · ${projectName}</div>
</div>

<!-- API Page -->
<div class="page">
  <h2>API Design</h2>
  <p style="font-size:12px;color:#6b7280;margin-bottom:16px">
    Base URL: <code style="background:#f1f5f9;padding:2px 6px;border-radius:4px">${api?.base_url || '/api/v1'}</code>
    &nbsp;·&nbsp; Auth: ${api?.auth_strategy || 'JWT Bearer token'}
    &nbsp;·&nbsp; Rate Limit: ${api?.rate_limiting || '100 req/min'}
  </p>
  ${api?.endpoints?.map((ep: any) => `
    <div class="endpoint">
      <span class="method ${ep.method}">${ep.method}</span>
      <div class="endpoint-info">
        <div class="path">${ep.path}</div>
        <div class="desc">${ep.description}${ep.auth_required ? ' 🔒' : ''}</div>
      </div>
    </div>
  `).join('') || ''}
  <div class="footer">AI CTO — API Design · ${projectName}</div>
</div>

<!-- Cost Page -->
<div class="page">
  <h2>Cloud Cost Estimation</h2>
  <div class="cost-grid">
    ${cost?.tiers ? Object.entries(cost.tiers).map(([tier, d]: any) => `
      <div class="cost-card">
        <div class="cost-tier">${tier}</div>
        <div class="cost-amount">$${d.monthly_usd}</div>
        <div class="cost-period">/month</div>
        <div class="cost-desc">${d.description}</div>
      </div>
    `).join('') : ''}
  </div>
  <h3>Cost Saving Tips</h3>
  ${cost?.cost_saving_tips?.map((tip: string) => `
    <div class="tip">↓ ${tip}</div>
  `).join('') || ''}
  <div class="footer">AI CTO — Cost Estimation · ${projectName}</div>
</div>

<!-- Security Page -->
<div class="page">
  <h2>Security Checklist</h2>
  <span class="risk-badge risk-${security?.risk_score}">Risk Level: ${security?.risk_score}</span>
  ${security?.checklist ? Object.entries(security.checklist).map(([category, items]: any) => `
    <h3>${category.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}</h3>
    ${items.map((item: any) => `
      <div class="checklist-item">
        <span class="priority priority-${item.priority}">${item.priority}</span>
        <span class="checklist-text">${item.item}</span>
      </div>
    `).join('')}
  `).join('') : ''}
  <div class="footer">AI CTO — Security Checklist · ${projectName}</div>
</div>

<!-- Diagrams Page -->
<div class="page">
  <h2>Architecture Diagrams</h2>
  <p style="font-size:12px;color:#6b7280;margin-bottom:16px">Mermaid diagram source code — paste into <a href="https://mermaid.live" style="color:#7c3aed">mermaid.live</a> to render interactively.</p>
  <h3>System Architecture</h3>
  <div class="diagram-placeholder">${result?.diagrams?.architecture || 'Not generated'}</div>
  <h3 style="margin-top:20px">ER Diagram</h3>
  <div class="diagram-placeholder">${result?.diagrams?.er_diagram || 'Not generated'}</div>
  <h3 style="margin-top:20px">Sequence Diagram</h3>
  <div class="diagram-placeholder">${result?.diagrams?.sequence || 'Not generated'}</div>
  <div class="footer">AI CTO — Diagrams · ${projectName}</div>
</div>

</body>
</html>`
}
