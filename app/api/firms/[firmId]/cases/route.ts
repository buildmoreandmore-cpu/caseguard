import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { EnhancedCasePeerClient } from '@/lib/casepeer-client-enhanced';
import { AuditEngine } from '@/lib/audit-engine';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get firm from database
    const firm = await prisma.firm.findUnique({
      where: { id: firmId },
    });

    if (!firm) {
      return NextResponse.json(
        { error: 'Firm not found' },
        { status: 404 }
      );
    }

    // Decrypt API credentials
    const apiKey = decrypt(firm.casepeerApiKey);
    const apiUrl = firm.casepeerApiUrl;

    // Create CasePeer client
    const client = new EnhancedCasePeerClient(apiUrl, apiKey);

    // Test connection first
    const connectionTest = await client.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: 'Failed to connect to CasePeer API', details: connectionTest.message },
        { status: 503 }
      );
    }

    // Fetch all cases from CasePeer
    const allCases = await client.getAllCases();

    // Generate audit reports for each case to check for missing documents
    const casesWithAudits = await Promise.all(
      allCases.map(async (caseData) => {
        const caseWithDocs = await client.getCaseWithDocuments(caseData.id);
        const audit = AuditEngine.generateAuditReport(caseWithDocs);

        return {
          ...caseData,
          audit: {
            score: audit.score.overall,
            criticalMissing: audit.score.criticalMissing,
            requiredMissing: audit.score.requiredMissing,
            totalMissing: audit.score.criticalMissing + audit.score.requiredMissing,
          }
        };
      })
    );

    // Filter to only cases with missing documents (score < 100%)
    const casesWithIssues = casesWithAudits.filter(
      (c) => c.audit.totalMissing > 0 || c.audit.score < 100
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCases = casesWithIssues.slice(startIndex, endIndex);

    return NextResponse.json({
      cases: paginatedCases,
      pagination: {
        page,
        limit,
        total: casesWithIssues.length,
        totalPages: Math.ceil(casesWithIssues.length / limit),
        hasMore: endIndex < casesWithIssues.length,
      },
      summary: {
        totalCasesInCasePeer: allCases.length,
        casesWithIssues: casesWithIssues.length,
        averageScore: casesWithIssues.reduce((sum, c) => sum + c.audit.score, 0) / casesWithIssues.length || 100,
      }
    });
  } catch (error) {
    console.error('Error fetching firm cases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
