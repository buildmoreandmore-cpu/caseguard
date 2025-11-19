import { cookies } from 'next/headers';
import { unsealData } from 'iron-session';

export interface SessionData {
  isAuthenticated: boolean;
  loginTime?: number;
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('legal_file_auditor_session');

    if (!sessionCookie) {
      return false;
    }

    const sessionSecret = process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_for_security';
    const sessionData: any = await unsealData(sessionCookie.value, { password: sessionSecret });

    return sessionData?.isAuthenticated === true;
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
}
