import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function generateTokens(userId: string) {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' })
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_SECRET!, { expiresIn: '7d' })
  return { token, refreshToken }
}

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return res.status(409).json({ error: 'Email already registered' })
    }
    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, name, passwordHash }
    })
    const { token, refreshToken } = generateTokens(user.id)
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    })
    return res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Registration failed' })
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }
    const { token, refreshToken } = generateTokens(user.id)
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    })
    return res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Login failed' })
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
    }
    res.clearCookie('refreshToken')
    return res.json({ message: 'Logged out successfully' })
  } catch (err) {
    console.error('Logout error:', err)
    return res.status(500).json({ error: 'Logout failed' })
  }
}

export async function refreshTokenHandler(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.refreshToken
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' })
    }
    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } })
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET!) as { userId: string }
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET!, { expiresIn: '15m' })
    return res.json({ token: newToken })
  } catch {
    return res.status(401).json({ error: 'Invalid refresh token' })
  }
}
