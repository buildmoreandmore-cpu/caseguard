import { NextRequest, NextResponse } from 'next/server';
import { createCMSAdapter, CMSConfig, CMSProvider } from '@/lib/cms-adapters';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { provider, apiUrl, apiKey, apiSecret, orgId, endpoints } = body;

    if (!provider || !apiUrl || !apiKey) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: provider, apiUrl, apiKey' },
        { status: 400 }
      );
    }

    const config: CMSConfig = {
      provider: provider as CMSProvider,
      apiUrl,
      apiKey,
      apiSecret,
      orgId,
      endpoints,
    };

    const adapter = createCMSAdapter(config);
    const result = await adapter.testConnection();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to test connection',
      },
      { status: 500 }
    );
  }
}
