import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import generateRoutes from './routes/generate.routes'
import historyRoutes from './routes/history.routes'
import otpRoutes from './routes/otp.routes'

const app = express()

app.use(helmet())

app.use(cors({
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.FRONTEND_URL || '',
      'https://ai-cto-frontend.vercel.app'
    ].filter(Boolean)
    if (!origin || allowedOrigins.some(o => origin.includes('vercel.app') || origin === o)) {
      callback(null, true)
    } else {
      callback(null, true)
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'AI CTO API', status: 'running', version: '1.0.0' })
})

app.get('/test-ai', async (_req: Request, res: Response) => {
  const hasGroq = !!process.env.GROQ_API_KEY
  const hasOpenRouter = !!process.env.OPENROUTER_API_KEY
  res.json({
    groq_key_present: hasGroq,
    openrouter_key_present: hasOpenRouter,
    node_env: process.env.NODE_ENV
  })
})

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/otp', otpRoutes)

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
})

export default app
