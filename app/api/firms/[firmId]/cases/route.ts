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
        id: 'case-001',
        caseNumber: '2024-PI-1001',
        clientName: 'Sarah Martinez',
        caseType: 'personal_injury',
        currentPhase: 'settlement',
        assignedAttorney: 'John Anderson',
        dateOpened: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 65, criticalMissing: 3, requiredMissing: 5, totalMissing: 8 }
      },
      {
        id: 'case-002',
        caseNumber: '2024-PI-1002',
        clientName: 'Michael Johnson',
        caseType: 'personal_injury',
        currentPhase: 'discovery',
        assignedAttorney: 'John Anderson',
        dateOpened: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 72, criticalMissing: 2, requiredMissing: 4, totalMissing: 6 }
      },
      {
        id: 'case-003',
        caseNumber: '2024-WC-1003',
        clientName: 'Robert Davis',
        caseType: 'workers_compensation',
        currentPhase: 'pre_litigation',
        assignedAttorney: 'Maria Garcia',
        dateOpened: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 78, criticalMissing: 1, requiredMissing: 3, totalMissing: 4 }
      },
      {
        id: 'case-004',
        caseNumber: '2024-PI-1004',
        clientName: 'Emily Wilson',
        caseType: 'personal_injury',
        currentPhase: 'litigation',
        assignedAttorney: 'John Anderson',
        dateOpened: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 68, criticalMissing: 2, requiredMissing: 5, totalMissing: 7 }
      },
      {
        id: 'case-005',
        caseNumber: '2024-PI-1005',
        clientName: 'David Brown',
        caseType: 'personal_injury',
        currentPhase: 'settlement',
        assignedAttorney: 'Maria Garcia',
        dateOpened: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 82, criticalMissing: 0, requiredMissing: 3, totalMissing: 3 }
      },
      {
        id: 'case-006',
        caseNumber: '2024-PI-1006',
        clientName: 'Jennifer Lopez',
        caseType: 'personal_injury',
        currentPhase: 'treatment',
        assignedAttorney: 'John Anderson',
        dateOpened: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 55, criticalMissing: 4, requiredMissing: 6, totalMissing: 10 }
      },
      {
        id: 'case-007',
        caseNumber: '2024-PI-1007',
        clientName: 'James Williams',
        caseType: 'personal_injury',
        currentPhase: 'demand',
        assignedAttorney: 'Maria Garcia',
        dateOpened: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 88, criticalMissing: 0, requiredMissing: 2, totalMissing: 2 }
      },
      {
        id: 'case-008',
        caseNumber: '2024-WC-1008',
        clientName: 'Patricia Miller',
        caseType: 'workers_compensation',
        currentPhase: 'treatment',
        assignedAttorney: 'John Anderson',
        dateOpened: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 45, criticalMissing: 5, requiredMissing: 7, totalMissing: 12 }
      },
      {
        id: 'case-009',
        caseNumber: '2024-PI-1009',
        clientName: 'Christopher Garcia',
        caseType: 'personal_injury',
        currentPhase: 'intake',
        assignedAttorney: 'Maria Garcia',
        dateOpened: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 35, criticalMissing: 6, requiredMissing: 8, totalMissing: 14 }
      },
      {
        id: 'case-010',
        caseNumber: '2024-PI-1010',
        clientName: 'Amanda Thompson',
        caseType: 'personal_injury',
        currentPhase: 'settlement',
        assignedAttorney: 'John Anderson',
        dateOpened: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 92, criticalMissing: 0, requiredMissing: 1, totalMissing: 1 }
      },
      {
        id: 'case-011',
        caseNumber: '2024-PI-1011',
        clientName: 'Daniel Rodriguez',
        caseType: 'personal_injury',
        currentPhase: 'litigation',
        assignedAttorney: 'Maria Garcia',
        dateOpened: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 76, criticalMissing: 1, requiredMissing: 4, totalMissing: 5 }
      },
      {
        id: 'case-012',
        caseNumber: '2024-WC-1012',
        clientName: 'Nancy Taylor',
        caseType: 'workers_compensation',
        currentPhase: 'demand',
        assignedAttorney: 'John Anderson',
        dateOpened: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [],
        audit: { score: 84, criticalMissing: 0, requiredMissing: 2, totalMissing: 2 }
      }
    ]
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
      totalCasesInCMS: 47,
      documentsAnalyzed: 1284,
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
