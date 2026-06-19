import { Router, Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { sendOTPEmail } from '../services/email.service'

const router = Router()
const prisma = new PrismaClient()

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

router.post('/send', async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) return res.status(409).json({ error: 'Email already registered' })

    await prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true }
    })

    const code = generateOTP()
    await prisma.otpCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000)
      }
    })

    await sendOTPEmail(email, code, name)

    return res.json({ message: 'OTP sent successfully' })
  } catch (err: any) {
    console.error('OTP send error:', err)
    return res.status(500).json({ error: 'Failed to send OTP: ' + err.message })
  }
})

router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body
    if (!email || !code) return res.status(400).json({ error: 'Email and code required' })

    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!otp) return res.status(400).json({ error: 'Invalid or expired code' })

    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true }
    })

    return res.json({ verified: true })
  } catch (err: any) {
    return res.status(500).json({ error: err.message })
  }
})

export default router
