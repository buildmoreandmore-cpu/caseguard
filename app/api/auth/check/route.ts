import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { unsealData } from 'iron-session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('legal_file_auditor_session');

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false });
    }

    const sessionSecret = process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security';
    const sessionData: any = await unsealData(sessionCookie.value, { password: sessionSecret });

    const isAuthenticated = sessionData?.isAuthenticated === true;

    return NextResponse.json({ isAuthenticated });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
