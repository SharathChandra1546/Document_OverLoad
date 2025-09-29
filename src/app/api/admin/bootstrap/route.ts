import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/service';
import { postgres } from '@/lib/database/postgres';

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: 'Disabled in production' }, { status: 403 });
    }

    const secret = request.headers.get('x-bootstrap-secret') || '';
    const expected = process.env.ADMIN_BOOTSTRAP_SECRET || '';
    if (!expected || secret !== expected) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const email: string = (body.email || process.env.ADMIN_EMAIL || 'admin@local').toLowerCase();
    const password: string = body.password || process.env.ADMIN_PASSWORD || 'ChangeMe!1234';
    const name: string = body.name || process.env.ADMIN_NAME || 'Administrator';
    const department: string = body.department || 'Administration';

    // Try creating an admin via AuthService
    const result = await AuthService.signup({ email, password, name, department, role: 'admin' });
    if (result.success) {
      return NextResponse.json({ success: true, data: { user: result.user } }, { status: 200 });
    }

    // If user exists, promote to admin and activate
    if ((result.error || '').toLowerCase().includes('already exists')) {
      await postgres.query(
        `UPDATE users SET role = 'admin', is_active = true, name = COALESCE(name, $2), department = COALESCE(department, $3)
         WHERE email = $1`,
        [email, name, department]
      );
      const promoted = await postgres.query(
        `SELECT id, email, name, role, department FROM users WHERE email = $1`,
        [email]
      );
      return NextResponse.json({ success: true, data: { user: promoted.rows[0] } }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: result.error || 'Bootstrap failed' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal error' }, { status: 500 });
  }
}



