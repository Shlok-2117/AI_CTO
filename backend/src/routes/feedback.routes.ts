import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { optionalAuth } from '../middleware/auth.middleware'

const router = Router()
const prisma = new PrismaClient()

router.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const {
      overallRating, outputQuality, easeOfUse, speedRating,
      featureRequests, wouldRecommend, usageContext,
      bestThing, improvementArea, message, generationId
    } = req.body

    if (!overallRating || overallRating < 1 || overallRating > 5) {
      return res.status(400).json({ error: 'Overall rating (1-5) is required' })
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: (req as any).user?.userId || null,
        generationId: generationId || null,
        overallRating: Number(overallRating),
        outputQuality: Number(outputQuality) || 3,
        easeOfUse: Number(easeOfUse) || 3,
        speedRating: Number(speedRating) || 3,
        featureRequests: JSON.stringify(featureRequests || []),
        wouldRecommend: Boolean(wouldRecommend),
        usageContext: usageContext || 'other',
        bestThing: bestThing || null,
        improvementArea: improvementArea || null,
        message: message || null,
      }
    })

    console.log(`[Feedback] New feedback: ${overallRating}/5 from ${(req as any).user?.userId || 'anonymous'}`)
    return res.json({ success: true, id: feedback.id, message: 'Thank you for your feedback!' })
  } catch (err: any) {
    console.error('[Feedback] Error:', err.message)
    return res.status(500).json({ error: 'Failed to save feedback' })
  }
})

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany()
    if (feedbacks.length === 0) {
      return res.json({ total: 0, averageRating: 0, wouldRecommend: 0 })
    }
    const total = feedbacks.length
    const avgOverall = feedbacks.reduce((s, f) => s + f.overallRating, 0) / total
    const avgQuality = feedbacks.reduce((s, f) => s + f.outputQuality, 0) / total
    const avgEase = feedbacks.reduce((s, f) => s + f.easeOfUse, 0) / total
    const avgSpeed = feedbacks.reduce((s, f) => s + f.speedRating, 0) / total
    const recommendPct = (feedbacks.filter(f => f.wouldRecommend).length / total) * 100

    const allFeatures: string[] = []
    feedbacks.forEach(f => {
      try { allFeatures.push(...JSON.parse(f.featureRequests)) } catch {}
    })
    const featureCounts: Record<string, number> = {}
    allFeatures.forEach(f => { featureCounts[f] = (featureCounts[f] || 0) + 1 })
    const topFeatures = Object.entries(featureCounts)
      .sort(([, a], [, b]) => b - a).slice(0, 5)
      .map(([f, c]) => ({ feature: f, count: c }))

    return res.json({
      total,
      avgOverall: Math.round(avgOverall * 10) / 10,
      avgQuality: Math.round(avgQuality * 10) / 10,
      avgEase: Math.round(avgEase * 10) / 10,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      recommendPct: Math.round(recommendPct),
      topFeatures
    })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

router.get('/all', async (_req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true, name: true }
        }
      }
    })
    return res.json({ feedbacks, total: feedbacks.length })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
