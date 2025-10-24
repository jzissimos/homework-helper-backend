// Rate limiting middleware to prevent abuse
// Simple in-memory rate limiter (for production, use Redis)

import { NextRequest, NextResponse } from 'next/server'

// Store for tracking request counts
// Format: { [ip]: { count: number, resetTime: number } }
const requestCounts = new Map<string, { count: number; resetTime: number }>()

// Configuration
const RATE_LIMIT_CONFIG = {
  // Default limits (can be overridden per endpoint)
  DEFAULT: { requests: 100, windowMs: 60 * 1000 }, // 100 requests per minute

  // Strict limits for sensitive endpoints
  AUTH: { requests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  CONVERSATION: { requests: 10, windowMs: 60 * 60 * 1000 }, // 10 conversations per hour
  POINTS: { requests: 20, windowMs: 60 * 1000 }, // 20 requests per minute
}

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const cloudflare = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  return cloudflare || real || 'unknown'
}

/**
 * Clean up old entries to prevent memory leak
 */
function cleanupOldEntries() {
  const now = Date.now()
  for (const [ip, data] of requestCounts.entries()) {
    if (data.resetTime < now) {
      requestCounts.delete(ip)
    }
  }
}

/**
 * Rate limiting middleware
 * @param endpoint - Type of endpoint (AUTH, CONVERSATION, POINTS, or DEFAULT)
 * @returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(
  request: NextRequest,
  endpoint: keyof typeof RATE_LIMIT_CONFIG = 'DEFAULT'
): { allowed: boolean; retryAfter?: number } {
  // Clean up old entries periodically
  if (Math.random() < 0.1) { // 10% chance on each request
    cleanupOldEntries()
  }

  const ip = getClientIp(request)
  const now = Date.now()
  const config = RATE_LIMIT_CONFIG[endpoint]

  // Get or create entry for this IP
  let entry = requestCounts.get(ip)

  if (!entry || entry.resetTime < now) {
    // Create new entry or reset existing one
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    }
    requestCounts.set(ip, entry)
    return { allowed: true }
  }

  // Check if limit exceeded
  if (entry.count >= config.requests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000) // seconds
    return { allowed: false, retryAfter }
  }

  // Increment counter
  entry.count++
  return { allowed: true }
}

/**
 * Create rate limited response
 */
export function rateLimitResponse(retryAfter: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      retryAfter: `${retryAfter} seconds`
    },
    {
      status: 429,
      headers: {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + retryAfter * 1000).toISOString()
      }
    }
  )
}

/**
 * Rate limit middleware wrapper for API routes
 */
export function withRateLimit(
  handler: (request: NextRequest) => Promise<NextResponse>,
  endpoint: keyof typeof RATE_LIMIT_CONFIG = 'DEFAULT'
) {
  return async (request: NextRequest) => {
    const { allowed, retryAfter } = checkRateLimit(request, endpoint)

    if (!allowed) {
      return rateLimitResponse(retryAfter!)
    }

    return handler(request)
  }
}