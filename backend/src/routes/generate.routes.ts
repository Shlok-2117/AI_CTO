import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'
import { generateCTOBlueprint } from '../agents/cto.orchestrator'
import { cacheKey, getCached, setCached } from '../services/cache.service'

const router = Router()
const prisma = new PrismaClient()

router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { problem, force_regenerate } = req.body

    if (!problem || problem.trim().length < 10) {
      return res.status(400).json({ error: 'Please describe your startup idea in at least 10 characters' })
    }

    const normalizedInput = problem.trim()
    const key = cacheKey(normalizedInput)

    if (!force_regenerate) {
      const cached = getCached(key)
      if (cached) {
        console.log('[Cache] HIT — returning cached blueprint')
        const generation = await prisma.generation.create({
          data: {
            userId: req.userId!,
            input: normalizedInput,
            projectName: cached.founder?.startup_identity?.one_line_pitch || 'Cached Blueprint',
            output: JSON.stringify(cached)
          }
        })
        return res.json({
          id: generation.id,
          projectName: generation.projectName,
          result: cached,
          from_cache: true
        })
      }
    }

    console.log(`[Generate] Starting 12-phase CTO analysis: "${normalizedInput}"`)
    const blueprint = await generateCTOBlueprint(normalizedInput)

    setCached(key, blueprint)

    const projectName =
      blueprint.founder?.startup_identity?.one_line_pitch ||
      blueprint.architecture?.project_name ||
      normalizedInput

    const generation = await prisma.generation.create({
      data: {
        userId: req.userId!,
        input: normalizedInput,
        projectName,
        output: JSON.stringify(blueprint)
      }
    })

    return res.json({
      id: generation.id,
      projectName,
      result: blueprint,
      from_cache: false
    })

  } catch (err: any) {
    console.error('[Generate] Error:', err)
    return res.status(500).json({ error: err.message || 'Blueprint generation failed' })
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
      has_cost: !!output?.finops,
      cost_structure: output?.finops ? Object.keys(output.finops) : null,
      cost_tiers: output?.finops?.tiers ? Object.keys(output.finops.tiers) : null,
      cost_sample_mvp: output?.finops?.tiers?.mvp || null,

      has_security: !!output?.security,
      security_structure: output?.security ? Object.keys(output.security) : null,
      security_risk_score: output?.security?.risk_score || null,
      security_checklist_keys: output?.security?.checklist ? Object.keys(output.security.checklist) : null,

      has_diagrams: !!output?.diagrams,
      diagram_keys: output?.diagrams ? Object.keys(output.diagrams) : null,
      er_diagram_length: output?.diagrams?.er_diagram?.length || 0,
      er_diagram_preview: output?.diagrams?.er_diagram?.slice(0, 200) || null,

      top_level_keys: Object.keys(output),
      version: output?.metadata?.version || '1.0'
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
    if (!generation) return res.status(404).json({ error: 'Generation not found' })
    return res.json({
      id: generation.id,
      projectName: generation.projectName,
      result: JSON.parse(generation.output)
    })
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch generation' })
  }
})

router.get('/:id/pdf', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const generation = await prisma.generation.findFirst({
      where: { id: req.params.id, userId: req.userId! }
    })
    if (!generation) return res.status(404).json({ error: 'Not found' })

    const { generatePDF } = await import('../services/pdf.service')
    const pdfBuffer = await generatePDF({
      projectName: generation.projectName,
      result: JSON.parse(generation.output)
    })

    const safeFilename = generation.projectName.replace(/[^a-zA-Z0-9-_ ]/g, '').replace(/\s+/g, '-')
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}-CTO-Blueprint.pdf"`)
    return res.send(pdfBuffer)
  } catch (err: any) {
    return res.status(500).json({ error: 'PDF generation failed: ' + err.message })
  }
})

export default router
