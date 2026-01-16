import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { createCMSAdapter, CMSConfig, CMSProvider } from '@/lib/cms-adapters';
import { AuditEngine } from '@/lib/audit-engine';

export const maxDuration = 60; // 1 minute for single case

// Demo case data for demo firms
const demoCaseData: Record<string, any> = {
  'case-001': { id: 'case-001', caseNumber: '2024-PI-1001', clientName: 'Sarah Martinez', caseType: 'personal_injury', currentPhase: 'settlement', score: 65, criticalMissing: 3, requiredMissing: 5 },
  'case-002': { id: 'case-002', caseNumber: '2024-PI-1002', clientName: 'Michael Johnson', caseType: 'personal_injury', currentPhase: 'discovery', score: 72, criticalMissing: 2, requiredMissing: 4 },
  'case-003': { id: 'case-003', caseNumber: '2024-WC-1003', clientName: 'Robert Davis', caseType: 'workers_compensation', currentPhase: 'pre_litigation', score: 78, criticalMissing: 1, requiredMissing: 3 },
  'case-004': { id: 'case-004', caseNumber: '2024-PI-1004', clientName: 'Emily Wilson', caseType: 'personal_injury', currentPhase: 'litigation', score: 68, criticalMissing: 2, requiredMissing: 5 },
  'case-005': { id: 'case-005', caseNumber: '2024-PI-1005', clientName: 'David Brown', caseType: 'personal_injury', currentPhase: 'settlement', score: 82, criticalMissing: 0, requiredMissing: 3 },
  'case-006': { id: 'case-006', caseNumber: '2024-PI-1006', clientName: 'Jennifer Lopez', caseType: 'personal_injury', currentPhase: 'treatment', score: 55, criticalMissing: 4, requiredMissing: 6 },
  'case-007': { id: 'case-007', caseNumber: '2024-PI-1007', clientName: 'James Williams', caseType: 'personal_injury', currentPhase: 'demand', score: 88, criticalMissing: 0, requiredMissing: 2 },
  'case-008': { id: 'case-008', caseNumber: '2024-WC-1008', clientName: 'Patricia Miller', caseType: 'workers_compensation', currentPhase: 'treatment', score: 45, criticalMissing: 5, requiredMissing: 7 },
  'case-009': { id: 'case-009', caseNumber: '2024-PI-1009', clientName: 'Christopher Garcia', caseType: 'personal_injury', currentPhase: 'intake', score: 35, criticalMissing: 6, requiredMissing: 8 },
  'case-010': { id: 'case-010', caseNumber: '2024-PI-1010', clientName: 'Amanda Thompson', caseType: 'personal_injury', currentPhase: 'settlement', score: 92, criticalMissing: 0, requiredMissing: 1 },
  'case-011': { id: 'case-011', caseNumber: '2024-PI-1011', clientName: 'Daniel Rodriguez', caseType: 'personal_injury', currentPhase: 'litigation', score: 76, criticalMissing: 1, requiredMissing: 4 },
  'case-012': { id: 'case-012', caseNumber: '2024-WC-1012', clientName: 'Nancy Taylor', caseType: 'workers_compensation', currentPhase: 'demand', score: 84, criticalMissing: 0, requiredMissing: 2 },
};

/**
 * POST /api/scan/case
 * Scan a single case
 */
export async function POST(request: Request) {
  try {
    const { firmId, caseId } = await request.json();

    if (!firmId || !caseId) {
      return NextResponse.json(
        { error: 'Firm ID and Case ID are required' },
        { status: 400 }
      );
    }

    // Handle demo firms - return mock scan results
    if (firmId.startsWith('demo-firm-')) {
      await new Promise(resolve => setTimeout(resolve, 800));

      const caseData = demoCaseData[caseId];
      if (!caseData) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        auditLogId: 'demo-audit-' + Date.now(),
        case: {
          caseId: caseData.id,
          caseNumber: caseData.caseNumber,
          clientName: caseData.clientName,
          phase: caseData.currentPhase,
        },
        audit: {
          score: { overall: caseData.score, criticalMissing: caseData.criticalMissing, requiredMissing: caseData.requiredMissing },
          checklist: [],
          recommendations: ['Request missing medical records', 'Obtain signed authorization forms'],
        },
      });
    }

    // Get firm credentials
    const firm = await prisma.firm.findUnique({
      where: { id: firmId },
    });

    if (!firm) {
      return NextResponse.json({ error: 'Firm not found' }, { status: 404 });
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

    // Create audit log
    const auditLog = await prisma.auditLog.create({
      data: {
        firmId: firm.id,
        scanType: 'single_case',
        status: 'in_progress',
      },
    });

    try {
      // Decrypt API credentials and create universal adapter
      const decryptedApiKey = decrypt(apiKey);
      const decryptedApiSecret = firm.cmsApiSecret ? decrypt(firm.cmsApiSecret) : undefined;

      const config: CMSConfig = {
        provider: (firm.cmsProvider || 'casepeer') as CMSProvider,
        apiUrl: apiUrl,
        apiKey: decryptedApiKey,
        apiSecret: decryptedApiSecret,
        orgId: firm.cmsOrgId || undefined,
        endpoints: firm.cmsEndpoints as CMSConfig['endpoints'] || undefined,
      };

      const adapter = createCMSAdapter(config);

      // Fetch case
      const caseData = await adapter.getCase(caseId);

      if (!caseData) {
        throw new Error('Case not found');
      }

      // Fetch documents for this case
      const documents = await adapter.getDocuments(caseId);
      caseData.documents = documents;

      // Generate audit report
      const audit = AuditEngine.generateAuditReport(caseData);

      const criticalMissing = audit.checklist.filter(
        (item) => item.requirement.priority === 'critical' && item.status === 'missing'
      ).length;
      const requiredMissing = audit.checklist.filter(
        (item) => item.requirement.priority === 'required' && item.status === 'missing'
      ).length;

      // Update audit log
      await prisma.auditLog.update({
        where: { id: auditLog.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          casesScanned: 1,
          documentsAnalyzed: caseData.documents.length,
          criticalMissing,
          requiredMissing,
          averageScore: audit.score.overall,
        },
      });

      return NextResponse.json({
        success: true,
        auditLogId: auditLog.id,
        case: {
          caseId: caseData.id,
          caseNumber: caseData.caseNumber,
          clientName: caseData.clientName,
          phase: caseData.currentPhase,
        },
        audit,
      });
    } catch (error) {
      await prisma.auditLog.update({
        where: { id: auditLog.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('Case scan error:', error);
    return NextResponse.json(
      {
        error: 'Scan failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
