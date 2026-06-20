import { Router } from 'express'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { register, login, logout, refreshTokenHandler } from '../controllers/auth.controller'
import { sendWelcomeEmail } from '../services/email.service'

const router = Router()
const prisma = new PrismaClient()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/refresh', refreshTokenHandler)

router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const frontendUrl = process.env.FRONTEND_URL || 'https://ai-cto-two.vercel.app'

  if (!clientId) {
    return res.redirect(`${frontendUrl}/auth/login?error=google_not_configured`)
  }

  const backendUrl = process.env.BACKEND_URL || 'https://ai-cto-backend.onrender.com'
  const redirectUri = `${backendUrl}/api/auth/google/callback`
  const scope = 'openid email profile'
  const state = crypto.randomBytes(16).toString('hex')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', scope)
  url.searchParams.set('state', state)

  return res.redirect(url.toString())
})

router.get('/google/callback', async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://ai-cto-two.vercel.app'
  const { code, error } = req.query

  if (error || !code) {
    return res.redirect(`${frontendUrl}/auth/login?error=google_cancelled`)
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const backendUrl = process.env.BACKEND_URL || 'https://ai-cto-backend.onrender.com'
    const redirectUri = `${backendUrl}/api/auth/google/callback`

    if (!clientId || !clientSecret) {
      return res.redirect(`${frontendUrl}/auth/login?error=google_not_configured`)
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    })

    const tokens = await tokenRes.json() as any

    if (!tokens.access_token) {
      console.error('No access token from Google:', tokens)
      return res.redirect(`${frontendUrl}/auth/login?error=google_failed`)
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }
    })
    const googleUser = await userRes.json() as any

    if (!googleUser.email) {
      return res.redirect(`${frontendUrl}/auth/login?error=google_no_email`)
    }

    let user = await prisma.user.findUnique({ where: { email: googleUser.email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          passwordHash: crypto.randomBytes(32).toString('hex'),
        }
      })
      sendWelcomeEmail(user.email, user.name || undefined).catch(e =>
        console.error('Welcome email failed:', e.message)
      )
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '15m' }
    )

    const userData = JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name
    })

    return res.redirect(
      `${frontendUrl}/auth/google-success?token=${token}&user=${encodeURIComponent(userData)}`
    )
  } catch (err: any) {
    console.error('Google OAuth error:', err.message)
    return res.redirect(`${frontendUrl}/auth/login?error=google_failed`)
  }
})

export default router
