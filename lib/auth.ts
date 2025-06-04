import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Ensure JWT secrets are properly configured
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET
  if (process.env.NODE_ENV === 'production' && !secret) {
    console.error('JWT_SECRET missing in production')
    throw new Error('JWT_SECRET must be set in production environment')
  }
  return secret || 'dev-jwt-secret-only-for-development'
}

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET
  if (process.env.NODE_ENV === 'production' && !secret) {
    console.error('JWT_REFRESH_SECRET missing in production')
    throw new Error('JWT_REFRESH_SECRET must be set in production environment')
  }
  return secret || 'dev-refresh-secret-only-for-development'
}

let JWT_SECRET: string
let JWT_REFRESH_SECRET: string

try {
  JWT_SECRET = getJWTSecret()
  JWT_REFRESH_SECRET = getRefreshSecret()
  console.log('JWT secrets initialized successfully')
} catch (error) {
  console.error('Failed to initialize JWT secrets:', error)
  // Fallback to prevent total failure
  JWT_SECRET = 'fallback-secret-for-emergency'
  JWT_REFRESH_SECRET = 'fallback-refresh-secret-for-emergency'
}

export interface JWTPayload {
  userId: string
  email: string
  subscriptionTier: string
}

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' })
}

export function generateRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload
}