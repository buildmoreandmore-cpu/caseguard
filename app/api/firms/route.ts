import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';
import { encrypt, decrypt } from '@/lib/crypto';

// GET all firms
export async function GET() {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to fetch from database
    try {
      const firms = await prisma.firm.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          contactEmail: true,
          contactPhone: true,
          casepeerApiUrl: true,
          active: true,
          createdAt: true,
          updatedAt: true,
          lastScannedAt: true,
          _count: {
            select: { auditLogs: true }
          }
        }
      });

      return NextResponse.json(firms);
    } catch (dbError) {
      // Database error - return empty array so frontend can show demo data
      console.error('Database error, returning empty for demo mode:', dbError);
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error('Error fetching firms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch firms' },
      { status: 500 }
    );
  }
}

// POST create new firm
export async function POST(request: Request) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, contactEmail, contactPhone, casepeerApiUrl, casepeerApiKey } =
      await request.json();

    // Validation
    if (!name || !casepeerApiUrl || !casepeerApiKey) {
      return NextResponse.json(
        { error: 'Name, CasePeer API URL, and API Key are required' },
        { status: 400 }
      );
    }

    // Encrypt the API key before storing
    const encryptedApiKey = encrypt(casepeerApiKey);

    const firm = await prisma.firm.create({
      data: {
        name,
        contactEmail,
        contactPhone,
        casepeerApiUrl,
        casepeerApiKey: encryptedApiKey,
        active: true,
      },
    });

    return NextResponse.json({ firm }, { status: 201 });
  } catch (error) {
    console.error('Error creating firm:', error);
    return NextResponse.json(
      { error: 'Failed to create firm' },
      { status: 500 }
    );
  }
}
