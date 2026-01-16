import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

// GET all firms
export async function GET() {
  try {
    // Try to fetch from database
    try {
      const firms = await prisma.firm.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          contactEmail: true,
          contactPhone: true,
          cmsProvider: true,
          cmsApiUrl: true,
          // Legacy field for backwards compatibility
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
    const body = await request.json();

    const {
      name,
      contactEmail,
      contactPhone,
      // Universal CMS fields
      cmsProvider,
      cmsApiUrl,
      cmsApiKey,
      cmsApiSecret,
      cmsOrgId,
      cmsEndpoints,
      // Legacy CasePeer fields (for backwards compatibility)
      casepeerApiUrl,
      casepeerApiKey,
    } = body;

    // Determine which fields to use (new or legacy)
    const provider = cmsProvider || 'casepeer';
    const apiUrl = cmsApiUrl || casepeerApiUrl;
    const apiKey = cmsApiKey || casepeerApiKey;

    // Validation
    if (!name || !apiUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Name, API URL, and API Key are required' },
        { status: 400 }
      );
    }

    // Encrypt sensitive data before storing
    const encryptedApiKey = encrypt(apiKey);
    const encryptedApiSecret = cmsApiSecret ? encrypt(cmsApiSecret) : null;

    const firm = await prisma.firm.create({
      data: {
        name,
        contactEmail,
        contactPhone,
        cmsProvider: provider,
        cmsApiUrl: apiUrl,
        cmsApiKey: encryptedApiKey,
        cmsApiSecret: encryptedApiSecret,
        cmsOrgId,
        cmsEndpoints,
        // Also set legacy fields for backwards compatibility
        casepeerApiUrl: provider === 'casepeer' ? apiUrl : null,
        casepeerApiKey: provider === 'casepeer' ? encryptedApiKey : null,
        active: true,
      },
    });

    // Return without sensitive data
    return NextResponse.json({
      id: firm.id,
      name: firm.name,
      cmsProvider: firm.cmsProvider,
      active: firm.active,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating firm:', error);
    return NextResponse.json(
      { error: 'Failed to create firm' },
      { status: 500 }
    );
  }
}
