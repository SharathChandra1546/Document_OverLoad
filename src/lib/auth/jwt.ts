import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { appConfig } from '../config/database';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'staff' | 'manager' | 'admin' | 'auditor';
  department: string;
  iat: number;
  exp: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'staff' | 'manager' | 'admin' | 'auditor';
  department: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: AuthUser): string {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    department: user.department,
  };

  // Use type assertion to bypass the strict typing issue
  return (jwt as any).sign(payload, appConfig.auth.jwtSecret, {
    expiresIn: appConfig.auth.jwtExpiration,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = (jwt as any).verify(token, appConfig.auth.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Generate a hash for token storage (for logout functionality)
 */
export function generateTokenHash(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}