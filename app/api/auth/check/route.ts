import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('legal_file_auditor_session');

    if (!sessionCookie) {
      return NextResponse.json({ isAuthenticated: false });
    }

    // Decode base64 session
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));

    // Check if session is expired
    const isExpired = sessionData.expires < Date.now();
    const isAuthenticated = sessionData.isAuthenticated === true && !isExpired;

    return NextResponse.json({ isAuthenticated });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ isAuthenticated: false });
  }
}
