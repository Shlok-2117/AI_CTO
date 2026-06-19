import 'dotenv/config'
import app from './app'

const PORT = parseInt(process.env.PORT || '5000', 10)

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`AI CTO Backend running on port ${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`Health: http://localhost:${PORT}/health`)
})

server.on('error', (err: any) => {
  console.error('Server error:', err)
  process.exit(1)
})

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

export default server
