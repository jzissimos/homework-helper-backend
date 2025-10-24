// POST /api/conversation - Start a new conversation with OpenAI Realtime API
// This is Katie's main voice interaction endpoint

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractToken, verifyToken } from '@/lib/auth'
import { getVoiceById } from '@/lib/voices'
import { checkRateLimit, rateLimitResponse } from '@/lib/rateLimit'

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

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      age: true,
      selectedVoice: true,
    }
  })

  if (!user) {
    return { error: 'User not found', status: 404 }
  }

  return { user }
}

// POST /api/conversation - Create ephemeral OpenAI Realtime API token
export async function POST(request: NextRequest) {
  try {
    // Check rate limit first (10 conversations per hour)
    const { allowed, retryAfter } = checkRateLimit(request, 'CONVERSATION')
    if (!allowed) {
      return rateLimitResponse(retryAfter!)
    }

    const result = await authenticateRequest(request)

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    const { user } = result

    // Check daily conversation limit (20 per day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const conversationCount = await prisma.conversation.count({
      where: {
        userId: user.id,
        startedAt: {
          gte: today
        }
      }
    })

    if (conversationCount >= 20) {
      return NextResponse.json(
        {
          error: 'Daily conversation limit reached (20 per day)',
          limitType: 'daily',
          limit: 20,
          used: conversationCount,
          resetTime: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()
        },
        { status: 429 }
      )
    }

    // Validate voice
    const voice = getVoiceById(user.selectedVoice)
    if (!voice) {
      return NextResponse.json(
        { error: 'Invalid voice configuration' },
        { status: 400 }
      )
    }

    // Create conversation record
    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        topic: null, // Will be updated after conversation
        connectionAttempts: 1,
      },
      select: {
        id: true,
        startedAt: true,
      }
    })

    // Create ephemeral token for OpenAI Realtime API
    // See: https://platform.openai.com/docs/api-reference/realtime-sessions
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: user.selectedVoice,
        // System instructions for Socratic teaching
        instructions: `You are a helpful AI tutor named Helper. You're talking with ${user.name}, who is ${user.age} years old.

Your teaching philosophy is Socratic - guide students to discover answers themselves rather than giving direct answers. Ask thoughtful questions that help them think through problems step by step.

Key principles:
- Be encouraging and patient
- Ask clarifying questions
- Break down complex problems into smaller steps
- Celebrate their reasoning process
- If they're stuck, give gentle hints, not answers
- Use age-appropriate language for a ${user.age}-year-old

When they get something right, acknowledge it warmly. When they struggle, help them find a path forward through questions.

Keep responses conversational and concise - this is voice conversation, not text.`,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)

      // Mark conversation as having errors
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          hadErrors: true,
          errorLog: { error: 'Failed to create session', details: errorData },
          endedAt: new Date(),
        }
      })

      return NextResponse.json(
        { error: 'Failed to create conversation session' },
        { status: 500 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      conversationId: conversation.id,
      sessionToken: data.client_secret.value,
      voice: user.selectedVoice,
      userName: user.name,
      userAge: user.age,
    })

  } catch (error) {
    console.error('Conversation POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
