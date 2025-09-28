import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, department, role } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email, password, and name are required',
        },
        { status: 400 }
      );
    }

    // Validate role if provided
    const validRoles = ['staff', 'manager', 'admin', 'auditor'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid role specified',
        },
        { status: 400 }
      );
    }

    // Attempt signup
    const result = await AuthService.signup({
      email,
      password,
      name,
      department: department || '',
      role: role || 'staff',
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 400 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
    });
  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}