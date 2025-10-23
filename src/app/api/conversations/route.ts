// GET /api/conversations - Get Katie's conversation history
// Shows past conversations with topics, durations, and points

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, verifyToken } from '@/lib/auth'

// Authenticate user
async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const token = extractToken(authHeader)

  if (!token) {
    return { error: 'No token provided', status: 401 }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 }
  }

  return { userId: payload.userId }
}

export async function GET(request: NextRequest) {
  try {
    const result = await authenticateRequest(request)

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    // Get query params for pagination
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Fetch conversations
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: result.userId,
        endedAt: { not: null } // Only show completed conversations
      },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        durationMinutes: true,
        topic: true,
        pointsEarned: true,
        hadErrors: true,
      },
      orderBy: {
        startedAt: 'desc' // Most recent first
      },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const total = await prisma.conversation.count({
      where: {
        userId: result.userId,
        endedAt: { not: null }
      }
    })

    return NextResponse.json({
      conversations,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      }
    })

  } catch (error) {
    console.error('Conversations GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
