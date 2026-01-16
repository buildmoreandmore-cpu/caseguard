import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { createCMSAdapter, CMSConfig, CMSProvider } from '@/lib/cms-adapters';
import { AuditEngine } from '@/lib/audit-engine';

export const maxDuration = 60; // 1 minute for single case

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
