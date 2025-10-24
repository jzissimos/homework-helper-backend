// Auth Library - JWT tokens and password hashing for Katie's account

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// JWT secret must be set in environment variables for security
const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
  throw new Error('CRITICAL: JWT_SECRET environment variable is required. Please set it in your .env file.')
}

export interface TokenPayload {
  userId: string
  email: string
  name: string
}

/**
 * Generate JWT token for user (lasts 30 days)
 * Katie can stay logged in for a month
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d'
  })
}

/**
 * Verify and decode JWT token
 * Returns user info if valid, null if invalid/expired
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Hash password with bcrypt (10 rounds)
 * Secure enough for our needs, fast enough for good UX
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

/**
 * Compare plain password with hashed password
 * Used during login
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Extract token from Authorization header
 * Supports: "Bearer token" or just "token"
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return authHeader
}
