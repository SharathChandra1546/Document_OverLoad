import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/auth/middleware';

export async function GET(request: NextRequest) {
  return withAuth(request, async (request, user) => {
    try {
      // Return user information from the JWT payload
      return NextResponse.json({
        success: true,
        data: {
          user: {
            id: user.userId,
            email: user.email,
            role: user.role,
            department: user.department,
          },
        },
      });
    } catch (error) {
      console.error('Get user profile error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to get user profile',
        },
        { status: 500 }
      );
    }
  });
}