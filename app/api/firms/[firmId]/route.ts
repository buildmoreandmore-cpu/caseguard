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

    // Don't send encrypted API key to frontend
    const { casepeerApiKey, ...firmData } = firm;

    return NextResponse.json({ firm: { ...firmData, hasApiKey: true } });
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
    const { name, contactEmail, contactPhone, casepeerApiUrl, casepeerApiKey, active } =
      await request.json();

    const updateData: any = {
      name,
      contactEmail,
      contactPhone,
      casepeerApiUrl,
      active,
    };

    // Only update API key if provided (allows updating firm without changing key)
    if (casepeerApiKey) {
      updateData.casepeerApiKey = encrypt(casepeerApiKey);
    }

    const firm = await prisma.firm.update({
      where: { id: firmId },
      data: updateData,
    });

    return NextResponse.json({ firm });
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

// GET decrypted API key (for scanning purposes only)
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
      select: { casepeerApiKey: true, casepeerApiUrl: true },
    });

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
    }

    const decryptedApiKey = decrypt(firm.casepeerApiKey);

    return NextResponse.json({
      apiKey: decryptedApiKey,
      apiUrl: firm.casepeerApiUrl,
    });
  } catch (error) {
    console.error('Error decrypting API key:', error);
    return NextResponse.json(
      { error: 'Failed to decrypt API key' },
      { status: 500 }
    );
  }
}
