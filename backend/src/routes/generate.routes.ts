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
