import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { cacheKey, getCached, setCached } from '../services/cache.service'

const router = Router()
const prisma = new PrismaClient()

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { problem, force_regenerate } = req.body
    if (!problem || problem.trim().length < 10) {
      return res.status(400).json({ error: 'Describe your idea in at least 10 characters' })
    }

    if (!force_regenerate) {
      const cached = getCached(cacheKey(problem))
      if (cached) {
        console.log('Cache hit — returning cached result')
        return res.json({ ...cached, cached: true })
      }
    }

    console.log('Step 1: Architecture...')
    const { generateArchitecture } = await import('../agents/architecture.agent')
    const architecture = await generateArchitecture(problem)

    console.log('Step 2: Database...')
    const { generateDatabase } = await import('../agents/database.agent')
    const database = await generateDatabase(architecture)

    console.log('Step 3: API Design...')
    const { generateApiDesign } = await import('../agents/api.agent')
    const api = await generateApiDesign(architecture, database)

    console.log('Step 4: Cost Estimation...')
    const { generateCost } = await import('../agents/cost.agent')
    const cost = await generateCost(architecture)

    console.log('Step 5: Security...')
    const { generateSecurity } = await import('../agents/security.agent')
    const security = await generateSecurity(architecture)

    console.log('Step 6: Diagrams...')
    const { generateDiagrams } = await import('../agents/diagram.agent')
    const diagrams = await generateDiagrams(architecture, database)

    const fullOutput = { architecture, database, api, cost, security, diagrams }

    const generation = await prisma.generation.create({
      data: {
        userId: req.userId!,
        input: problem,
        projectName: architecture.project_name,
        output: JSON.stringify(fullOutput)
      }
    })

    const responseData = {
      id: generation.id,
      projectName: architecture.project_name,
      result: fullOutput,
    }
    setCached(cacheKey(problem), responseData)
    return res.json(responseData)

  } catch (err: any) {
    console.error('Generate error:', err)
    return res.status(500).json({ error: err.message || 'Generation failed' })
  }
})

router.get('/debug/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: { id: req.params.id, userId: req.userId! }
    })
    if (!generation) return res.status(404).json({ error: 'Not found' })

    const output = JSON.parse(generation.output) as any

    return res.json({
      has_cost: !!output?.cost,
      cost_structure: output?.cost ? Object.keys(output.cost) : null,
      cost_tiers: output?.cost?.tiers ? Object.keys(output.cost.tiers) : null,
      cost_sample_small: output?.cost?.tiers?.small || null,

      has_security: !!output?.security,
      security_structure: output?.security ? Object.keys(output.security) : null,
      security_risk_score: output?.security?.risk_score || null,
      security_checklist_keys: output?.security?.checklist ? Object.keys(output.security.checklist) : null,
      checklist_sample: output?.security?.checklist
        ? Object.entries(output.security.checklist).slice(0, 1).map(([k, v]: [string, any]) => ({
            key: k,
            type: typeof v,
            is_array: Array.isArray(v),
            length: Array.isArray(v) ? v.length : null,
            sample: Array.isArray(v) ? v[0] : v
          }))
        : null,

      has_diagrams: !!output?.diagrams,
      diagram_keys: output?.diagrams ? Object.keys(output.diagrams) : null,
      er_diagram_length: output?.diagrams?.er_diagram?.length || output?.diagrams?.er?.length || 0,
      er_diagram_preview: output?.diagrams?.er_diagram?.slice(0, 200) || output?.diagrams?.er?.slice(0, 200) || null,
      architecture_diagram_preview: output?.diagrams?.architecture?.slice(0, 100) || null,
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: { id: req.params.id, userId: req.userId! }
    })
    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' })
    }
    return res.json({ id: generation.id, projectName: generation.projectName, result: JSON.parse(generation.output) })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch generation' })
  }
})

router.get('/:id/pdf', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: { id: req.params.id, userId: req.userId! }
    })
    if (!generation) {
      return res.status(404).json({ error: 'Generation not found' })
    }
    const { generatePDF } = await import('../services/pdf.service')
    const pdfBuffer = await generatePDF({
      projectName: generation.projectName,
      result: JSON.parse(generation.output)
    })
    const safeFilename = generation.projectName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}-CTO-Report.pdf"`)
    return res.send(pdfBuffer)
  } catch (err: any) {
    console.error('PDF error:', err)
    return res.status(500).json({ error: 'PDF generation failed: ' + err.message })
  }
})

export default router
