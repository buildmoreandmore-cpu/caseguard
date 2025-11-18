import { NextRequest, NextResponse } from 'next/server';
import { getCasePeerClient } from '@/lib/casepeer-client';
import { AuditEngine } from '@/lib/audit-engine';

/**
 * Generate audit report for a specific case
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const client = getCasePeerClient();
    const caseData = await client.getCase(caseId);

    if (!caseData) {
      return NextResponse.json(
        { error: 'Case not found' },
        { status: 404 }
      );
    }

    const auditReport = AuditEngine.generateAuditReport(caseData);

    return NextResponse.json({ audit: auditReport });
  } catch (error: any) {
    console.error('Error generating audit:', error);
    return NextResponse.json(
      { error: 'Failed to generate audit', details: error.message },
      { status: 500 }
    );
  }
}
