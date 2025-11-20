import { NextResponse } from 'next/server';
import { EnhancedCasePeerClient } from '@/lib/casepeer-client-enhanced';

export async function POST(request: Request) {
  try {
    const { apiUrl, apiKey } = await request.json();

    if (!apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'API URL and API Key are required' },
        { status: 400 }
      );
    }

    const client = new EnhancedCasePeerClient(apiUrl, apiKey);
    const result = await client.testConnection();

    if (result.success) {
      return NextResponse.json({ success: true, message: result.message });
    } else {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to test connection' },
      { status: 500 }
    );
  }
}
