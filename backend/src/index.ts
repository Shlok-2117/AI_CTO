import 'dotenv/config'
import app from './app'

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`AI CTO Backend running on http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
