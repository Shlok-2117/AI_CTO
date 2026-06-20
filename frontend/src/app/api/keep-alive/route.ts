export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://ai-cto-backend.onrender.com'
    await fetch(`${backendUrl}/health`)
    return Response.json({ status: 'pinged' })
  } catch {
    return Response.json({ status: 'failed' })
  }
}
