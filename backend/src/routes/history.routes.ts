import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware'

const router = Router()
const prisma = new PrismaClient()

router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const generations = await prisma.generation.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        input: true,
        projectName: true,
        createdAt: true
      }
    })
    return res.json({ generations })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch history' })
  }
})

router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    await prisma.generation.deleteMany({
      where: { id: req.params.id, userId: req.userId! }
    })
    return res.json({ message: 'Deleted successfully' })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete' })
  }
})

export default router
