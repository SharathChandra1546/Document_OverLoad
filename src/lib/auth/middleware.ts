import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, extractTokenFromHeader, JWTPayload } from './jwt';
import { AuthService } from './service';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

/**
 * Authentication middleware for API routes
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  success: boolean;
  user?: JWTPayload;
  error?: string;
  response?: NextResponse;
}> {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return {
        success: false,
        error: 'No token provided',
        response: NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        ),
      };
    }

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return {
        success: false,
        error: 'Invalid token',
        response: NextResponse.json(
          { success: false, error: 'Invalid or expired token' },
          { status: 401 }
        ),
      };
    }

    // Check if session is still active
    const isSessionActive = await AuthService.validateSession(token);
    if (!isSessionActive) {
      return {
        success: false,
        error: 'Session expired',
        response: NextResponse.json(
          { success: false, error: 'Session expired or invalid' },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user: decoded,
    };
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      success: false,
      error: 'Authentication failed',
      response: NextResponse.json(
        { success: false, error: 'Authentication failed' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(allowedRoles: string[]) {
  return (user: JWTPayload): { success: boolean; error?: string; response?: NextResponse } => {
    if (!allowedRoles.includes(user.role)) {
      return {
        success: false,
        error: 'Insufficient permissions',
        response: NextResponse.json(
          { success: false, error: 'Insufficient permissions' },
          { status: 403 }
        ),
      };
    }

    return { success: true };
  };
}

/**
 * Helper function to protect API routes with authentication
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return authResult.response!;
  }

  return handler(request, authResult.user!);
}

/**
 * Helper function to protect API routes with authentication and role checking
 */
export async function withAuthAndRole(
  request: NextRequest,
  allowedRoles: string[],
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
): Promise<NextResponse> {
  const authResult = await authenticateRequest(request);
  
  if (!authResult.success) {
    return authResult.response!;
  }

  const roleCheck = requireRole(allowedRoles)(authResult.user!);
  if (!roleCheck.success) {
    return roleCheck.response!;
  }

  return handler(request, authResult.user!);
}