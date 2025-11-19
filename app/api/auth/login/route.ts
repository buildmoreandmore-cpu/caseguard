import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    const adminPassword = process.env.ADMIN_PASSWORD;

    console.log('Login attempt:', {
      hasPassword: !!password,
      hasAdminPassword: !!adminPassword,
      passwordLength: password?.length,
      adminPasswordLength: adminPassword?.length,
      nodeEnv: process.env.NODE_ENV
    });

    if (!adminPassword) {
      console.error('ADMIN_PASSWORD not set in environment');
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

    // Create a simple session token (not production JWT, but works for demo)
    const sessionData = JSON.stringify({
      isAuthenticated: true,
      loginTime: Date.now(),
      expires: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    });

    // Simple base64 encoding (iron-session alternative for Next.js 16)
    const sessionToken = Buffer.from(sessionData).toString('base64');

    // Create response with cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set('legal_file_auditor_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
