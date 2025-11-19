import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sealData } from 'iron-session';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create session data
    const sessionData = {
      isAuthenticated: true,
      loginTime: Date.now(),
    };

    // Seal the session data
    const sessionSecret = process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security';
    const sealed = await sealData(sessionData, { password: sessionSecret });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('legal_file_auditor_session', sealed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
