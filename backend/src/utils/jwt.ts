import jwt, { SignOptions } from 'jsonwebtoken'
import { JwtPayload } from '../types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'

export class JwtHelper {
  static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload as any, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any)
  }

  static generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload as any, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as any)
  }

  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload
    } catch (error) {
      throw new Error('Token inválido ou expirado')
    }
  }

  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload
    } catch (error) {
      throw new Error('Refresh token inválido ou expirado')
    }
  }

  static generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>) {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    }
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null
    
    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') return null
    
    return parts[1]
  }

  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JwtPayload
      if (!decoded || !decoded.exp) return null
      
      return new Date(decoded.exp * 1000)
    } catch (error) {
      return null
    }
  }

  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token)
    if (!expiration) return true
    
    return expiration < new Date()
  }
}

export default JwtHelper

