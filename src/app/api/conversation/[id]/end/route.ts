// PATCH /api/conversation/[id]/end - End a conversation and save results
// Katie's app calls this when she clicks "End Conversation"

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
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

const endConversationSchema = z.object({
  durationMinutes: z.number().min(0).optional(),
  topic: z.string().optional(),
  pointsEarned: z.number().min(0).optional(),
  transcript: z.any().optional(), // JSON transcript if available
  hadErrors: z.boolean().optional(),
  errorLog: z.any().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await authenticateRequest(request)

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: result.status }
      )
    }

    const conversationId = params.id
    const body = await request.json()
    const data = endConversationSchema.parse(body)

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { userId: true, endedAt: true }
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      )
    }

    if (conversation.userId !== result.userId) {
      return NextResponse.json(
        { error: 'Not authorized to end this conversation' },
        { status: 403 }
      )
    }

    if (conversation.endedAt) {
      return NextResponse.json(
        { error: 'Conversation already ended' },
        { status: 400 }
      )
    }

    // Update conversation with end data
    const updated = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        endedAt: new Date(),
        durationMinutes: data.durationMinutes,
        topic: data.topic,
        pointsEarned: data.pointsEarned || 0,
        transcript: data.transcript,
        hadErrors: data.hadErrors || false,
        errorLog: data.errorLog,
      },
      select: {
        id: true,
        startedAt: true,
        endedAt: true,
        durationMinutes: true,
        topic: true,
        pointsEarned: true,
      }
    })

    // Update user's total points if points were earned
    if (data.pointsEarned && data.pointsEarned > 0) {
      await prisma.user.update({
        where: { id: result.userId },
        data: {
          totalPoints: {
            increment: data.pointsEarned
          }
        }
      })
    }

    return NextResponse.json({
      message: 'Conversation ended successfully',
      conversation: updated
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('End conversation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
