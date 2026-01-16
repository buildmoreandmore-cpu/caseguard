import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { createCMSAdapter, CMSConfig, CMSProvider } from '@/lib/cms-adapters';
import { AuditEngine } from '@/lib/audit-engine';

// Demo cases for when database is not connected
function getDemoCases(firmId: string, page: number, limit: number) {
  const demoCases: Record<string, any[]> = {
    'demo-firm-1': [
      {
        id: 'case-smith-001',
        caseNumber: '2024-PI-1234',
        clientName: 'Sarah Martinez',
        caseType: 'personal_injury',
        currentPhase: 'settlement',
        assignedAttorney: 'John Smith',
        dateOpened: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 65, criticalMissing: 3, requiredMissing: 5, totalMissing: 8 }
      },
      {
        id: 'case-smith-002',
        caseNumber: '2024-PI-1235',
        clientName: 'Michael Johnson',
        caseType: 'personal_injury',
        currentPhase: 'discovery',
        assignedAttorney: 'John Smith',
        dateOpened: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 72, criticalMissing: 2, requiredMissing: 4, totalMissing: 6 }
      },
      {
        id: 'case-smith-003',
        caseNumber: '2024-WC-789',
        clientName: 'Robert Davis',
        caseType: 'workers_compensation',
        currentPhase: 'pre_litigation',
        assignedAttorney: 'Jane Doe',
        dateOpened: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 78, criticalMissing: 1, requiredMissing: 3, totalMissing: 4 }
      },
      {
        id: 'case-smith-004',
        caseNumber: '2024-PI-1236',
        clientName: 'Emily Wilson',
        caseType: 'personal_injury',
        currentPhase: 'litigation',
        assignedAttorney: 'John Smith',
        dateOpened: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 68, criticalMissing: 2, requiredMissing: 5, totalMissing: 7 }
      },
      {
        id: 'case-smith-005',
        caseNumber: '2024-PI-1237',
        clientName: 'David Brown',
        caseType: 'personal_injury',
        currentPhase: 'settlement',
        assignedAttorney: 'Jane Doe',
        dateOpened: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 82, criticalMissing: 0, requiredMissing: 3, totalMissing: 3 }
      }
    ],
    'demo-firm-2': [
      {
        id: 'case-johnson-001',
        caseNumber: '2024-PI-5001',
        clientName: 'Amanda Thompson',
        caseType: 'personal_injury',
        currentPhase: 'settlement',
        assignedAttorney: 'Mark Johnson',
        dateOpened: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 88, criticalMissing: 1, requiredMissing: 2, totalMissing: 3 }
      },
      {
        id: 'case-johnson-002',
        caseNumber: '2024-WC-5002',
        clientName: 'Christopher Lee',
        caseType: 'workers_compensation',
        currentPhase: 'pre_litigation',
        assignedAttorney: 'Sarah Johnson',
        dateOpened: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 94, criticalMissing: 0, requiredMissing: 1, totalMissing: 1 }
      }
    ],
    'demo-firm-3': []
  };

  const cases = demoCases[firmId] || [];
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCases = cases.slice(startIndex, endIndex);

  return {
    cases: paginatedCases,
    pagination: {
      page,
      limit,
      total: cases.length,
      totalPages: Math.ceil(cases.length / limit),
      hasMore: endIndex < cases.length,
    },
    summary: {
      totalCasesInCasePeer: firmId === 'demo-firm-1' ? 15 : firmId === 'demo-firm-2' ? 22 : 8,
      casesWithIssues: cases.length,
      averageScore: cases.reduce((sum, c) => sum + c.audit.score, 0) / cases.length || 0,
    }
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Check if this is a demo firm ID
    if (firmId.startsWith('demo-firm-')) {
      return NextResponse.json(getDemoCases(firmId, page, limit));
    }

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

    // Get API credentials - prefer new universal fields, fall back to legacy
    const apiKey = firm.cmsApiKey || firm.casepeerApiKey;
    const apiUrl = firm.cmsApiUrl || firm.casepeerApiUrl;

    if (!apiKey || !apiUrl) {
      return NextResponse.json(
        { error: 'Firm API credentials not configured' },
        { status: 400 }
      );
    }

    // Decrypt API credentials
    const decryptedApiKey = decrypt(apiKey);
    const decryptedApiSecret = firm.cmsApiSecret ? decrypt(firm.cmsApiSecret) : undefined;

    // Create universal CMS adapter
    const config: CMSConfig = {
      provider: (firm.cmsProvider || 'casepeer') as CMSProvider,
      apiUrl: apiUrl,
      apiKey: decryptedApiKey,
      apiSecret: decryptedApiSecret,
      orgId: firm.cmsOrgId || undefined,
      endpoints: firm.cmsEndpoints as CMSConfig['endpoints'] || undefined,
    };

    const adapter = createCMSAdapter(config);

    // Test connection first
    const connectionTest = await adapter.testConnection();
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `Failed to connect to ${firm.cmsProvider || 'CMS'} API`, details: connectionTest.message },
        { status: 503 }
      );
    }

    // Fetch all cases from CMS
    const allCases = await adapter.getCases();

    // Generate audit reports for each case to check for missing documents
    const casesWithAudits = await Promise.all(
      allCases.map(async (caseData) => {
        // Fetch documents for this case
        const documents = await adapter.getDocuments(caseData.id);
        const caseWithDocs = { ...caseData, documents };
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
        totalCasesInCMS: allCases.length,
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
