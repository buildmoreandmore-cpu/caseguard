import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt, decrypt } from '@/lib/crypto';

// GET single firm
export async function GET(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;

    const firm = await prisma.firm.findUnique({
      where: { id: firmId },
      include: {
        auditLogs: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }

    // Don't send encrypted API keys to frontend
    const { cmsApiKey, cmsApiSecret, casepeerApiKey, ...firmData } = firm;

    return NextResponse.json({
      firm: {
        ...firmData,
        hasApiKey: !!(cmsApiKey || casepeerApiKey),
      }
    });
  } catch (error) {
    console.error('Error fetching firm:', error);
    return NextResponse.json(
      { error: 'Failed to fetch firm' },
      { status: 500 }
    );
  }
}

// PUT update firm
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const body = await request.json();

    const {
      name,
      contactEmail,
      contactPhone,
      active,
      // Universal CMS fields
      cmsProvider,
      cmsApiUrl,
      cmsApiKey,
      cmsApiSecret,
      cmsOrgId,
      cmsEndpoints,
      // Legacy fields
      casepeerApiUrl,
      casepeerApiKey,
    } = body;

    const updateData: any = {
      name,
      contactEmail,
      contactPhone,
      active,
    };

    // Handle universal CMS fields
    if (cmsProvider !== undefined) updateData.cmsProvider = cmsProvider;
    if (cmsApiUrl !== undefined) updateData.cmsApiUrl = cmsApiUrl;
    if (cmsOrgId !== undefined) updateData.cmsOrgId = cmsOrgId;
    if (cmsEndpoints !== undefined) updateData.cmsEndpoints = cmsEndpoints;

    // Encrypt API key if provided
    if (cmsApiKey) {
      updateData.cmsApiKey = encrypt(cmsApiKey);
    }

    // Encrypt API secret if provided
    if (cmsApiSecret) {
      updateData.cmsApiSecret = encrypt(cmsApiSecret);
    }

    // Handle legacy fields for backwards compatibility
    if (casepeerApiUrl !== undefined) updateData.casepeerApiUrl = casepeerApiUrl;
    if (casepeerApiKey) {
      updateData.casepeerApiKey = encrypt(casepeerApiKey);
    }

    const firm = await prisma.firm.update({
      where: { id: firmId },
      data: updateData,
    });

    // Don't return sensitive data
    const { cmsApiKey: _, cmsApiSecret: __, casepeerApiKey: ___, ...safeData } = firm;

    return NextResponse.json({ firm: safeData });
  } catch (error) {
    console.error('Error updating firm:', error);
    return NextResponse.json(
      { error: 'Failed to update firm' },
      { status: 500 }
    );
  }
}

// DELETE firm
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;

    await prisma.firm.delete({
      where: { id: firmId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting firm:', error);
    return NextResponse.json(
      { error: 'Failed to delete firm' },
      { status: 500 }
    );
  }
}

// POST - Get decrypted API credentials (for scanning purposes only)
export async function POST(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const { action } = await request.json();

    if (action !== 'get-api-key') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const firm = await prisma.firm.findUnique({
      where: { id: firmId },
      select: {
        cmsProvider: true,
        cmsApiUrl: true,
        cmsApiKey: true,
        cmsApiSecret: true,
        cmsOrgId: true,
        cmsEndpoints: true,
        casepeerApiKey: true,
        casepeerApiUrl: true,
      },
    });

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }

    // Prefer new universal fields, fall back to legacy
    const apiKey = firm.cmsApiKey || firm.casepeerApiKey;
    const apiUrl = firm.cmsApiUrl || firm.casepeerApiUrl;

    if (!apiKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 400 });
    }

    const decryptedApiKey = decrypt(apiKey);
    const decryptedApiSecret = firm.cmsApiSecret ? decrypt(firm.cmsApiSecret) : null;

    return NextResponse.json({
      provider: firm.cmsProvider || 'casepeer',
      apiKey: decryptedApiKey,
      apiSecret: decryptedApiSecret,
      apiUrl: apiUrl,
      orgId: firm.cmsOrgId,
      endpoints: firm.cmsEndpoints,
    });
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return NextResponse.json(
      { error: 'Failed to decrypt API key' },
      { status: 500 }
    );
  }
}
