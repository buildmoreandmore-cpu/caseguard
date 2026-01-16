import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { createCMSAdapter, CMSConfig, CMSProvider } from '@/lib/cms-adapters';
import { AuditEngine } from '@/lib/audit-engine';

export const maxDuration = 300; // 5 minutes for bulk scanning

/**
 * POST /api/scan/firm
 * Scan all cases for a specific firm
 */
export async function POST(request: Request) {
  try {
    const { firmId } = await request.json();

    if (!firmId) {
      return NextResponse.json(
        { error: 'Firm ID is required' },
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

    if (!firm.active) {
      return NextResponse.json(
        { error: 'Firm is not active' },
        { status: 400 }
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

    // Create audit log
    const auditLog = await prisma.auditLog.create({
      data: {
        firmId: firm.id,
        scanType: 'full_firm',
        status: 'in_progress',
        casesScanned: 0,
        documentsAnalyzed: 0,
        criticalMissing: 0,
        requiredMissing: 0,
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

      // Test connection first
      const connectionTest = await adapter.testConnection();
      if (!connectionTest.success) {
        throw new Error(`${firm.cmsProvider || 'CMS'} connection failed: ${connectionTest.message}`);
      }

      // Fetch all cases
      const cases = await adapter.getCases();

      if (cases.length === 0) {
        await prisma.auditLog.update({
          where: { id: auditLog.id },
          data: {
            status: 'completed',
            completedAt: new Date(),
            errorMessage: 'No cases found for this firm',
          },
        });

        return NextResponse.json({
          success: true,
          message: 'No cases found',
          auditLogId: auditLog.id,
        });
      }

      // Process each case
      const results = [];
      let totalDocuments = 0;
      let totalCriticalMissing = 0;
      let totalRequiredMissing = 0;
      let totalScore = 0;

      for (const caseData of cases) {
        try {
          // Fetch documents for this case
          const documents = await adapter.getDocuments(caseData.id);
          caseData.documents = documents;

          // Generate audit report
          const audit = AuditEngine.generateAuditReport(caseData);

          totalDocuments += documents.length;
          totalCriticalMissing += audit.checklist.filter(
            (item) => item.requirement.priority === 'critical' && item.status === 'missing'
          ).length;
          totalRequiredMissing += audit.checklist.filter(
            (item) => item.requirement.priority === 'required' && item.status === 'missing'
          ).length;
          totalScore += audit.score.overall;

          results.push({
            caseId: caseData.id,
            caseNumber: caseData.caseNumber,
            clientName: caseData.clientName,
            phase: caseData.currentPhase,
            score: audit.score.overall,
            criticalMissing: audit.checklist.filter(
              (item) => item.requirement.priority === 'critical' && item.status === 'missing'
            ).length,
            requiredMissing: audit.checklist.filter(
              (item) => item.requirement.priority === 'required' && item.status === 'missing'
            ).length,
            recommendations: audit.recommendations.slice(0, 3), // Top 3
          });
        } catch (caseError) {
          console.error(`Error processing case ${caseData.id}:`, caseError);
          results.push({
            caseId: caseData.id,
            caseNumber: caseData.caseNumber,
            clientName: caseData.clientName,
            error: 'Failed to audit case',
          });
        }
      }

      const averageScore = results.length > 0 ? totalScore / results.length : 0;

      // Update audit log
      await prisma.auditLog.update({
        where: { id: auditLog.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          casesScanned: cases.length,
          documentsAnalyzed: totalDocuments,
          criticalMissing: totalCriticalMissing,
          requiredMissing: totalRequiredMissing,
          averageScore: averageScore,
        },
      });

      // Update firm's lastScannedAt
      await prisma.firm.update({
        where: { id: firm.id },
        data: { lastScannedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        auditLogId: auditLog.id,
        summary: {
          totalCases: cases.length,
          totalDocuments,
          averageScore: Math.round(averageScore),
          criticalIssues: totalCriticalMissing,
          requiredMissing: totalRequiredMissing,
        },
        cases: results,
      });
    } catch (error) {
      // Update audit log with error
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
    console.error('Firm scan error:', error);
    return NextResponse.json(
      {
        error: 'Scan failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
