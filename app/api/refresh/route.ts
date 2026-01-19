import { NextResponse } from 'next/server'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60000 // 1 minute

export async function POST(request: Request) {
  // Get client identifier (in production, use proper IP detection)
  const clientId = request.headers.get('x-forwarded-for') || 'anonymous'

  // Check rate limit
  const lastRequest = rateLimitMap.get(clientId)
  const now = Date.now()

  if (lastRequest && now - lastRequest < RATE_LIMIT_WINDOW) {
    return NextResponse.json(
      { error: 'Rate limited. Try again later.' },
      { status: 429 }
    )
  }

  // Update rate limit
  rateLimitMap.set(clientId, now)

  // Clean up old entries (simple garbage collection)
  for (const [key, timestamp] of rateLimitMap.entries()) {
    if (now - timestamp > RATE_LIMIT_WINDOW * 10) {
      rateLimitMap.delete(key)
    }
  }

  // In a real implementation, this would trigger the scraper
  // For now, we just return success since scraping happens via GitHub Actions
  return NextResponse.json(
    {
      message: 'Refresh request queued. Data updates hourly via scheduled jobs.',
      queued_at: new Date().toISOString(),
    },
    { status: 202 }
  )
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to trigger refresh.' },
    { status: 405 }
  )
}
