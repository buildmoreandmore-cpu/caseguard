import { NextResponse } from 'next/server';
import { getCasePeerClient } from '@/lib/casepeer-client';

/**
 * Get all cases from CasePeer
 */
export async function GET() {
  try {
    const client = getCasePeerClient();
    const cases = await client.getCases();

    return NextResponse.json({ cases });
  } catch (error: any) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases', details: error.message },
      { status: 500 }
    );
  }
}
