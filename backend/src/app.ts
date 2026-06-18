import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes'
import generateRoutes from './routes/generate.routes'
import historyRoutes from './routes/history.routes'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(cookieParser())
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'))
}

app.use('/api/auth', authRoutes)
app.use('/api/generate', generateRoutes)
app.use('/api/history', historyRoutes)

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() })
})

app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' })
})

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.message)
  res.status(500).json({ error: 'Internal server error' })
})

export default app
