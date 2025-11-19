import { cookies } from 'next/headers';

export interface SessionData {
  isAuthenticated: boolean;
  loginTime?: number;
  expires?: number;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('legal_file_auditor_session');

    if (!sessionCookie) {
      return false;
    }

    // Decode base64 session
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf-8'));

    // Check if session is expired
    const isExpired = sessionData.expires < Date.now();
    return sessionData.isAuthenticated === true && !isExpired;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}
