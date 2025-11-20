import { NextRequest, NextResponse } from 'next/server';
import { getCasePeerClient } from '@/lib/casepeer-client';
import { AuditEngine } from '@/lib/audit-engine';

// Demo audit reports for demo cases
function getDemoAuditReport(caseId: string) {
  const demoAudits: Record<string, any> = {
    'case-smith-001': {
      caseId: 'case-smith-001',
      case: {
        id: 'case-smith-001',
        caseNumber: '2024-PI-1234',
        clientName: 'Sarah Martinez',
        caseType: 'personal_injury',
        currentPhase: 'settlement',
        assignedAttorney: 'John Smith',
        dateOpened: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        documents: [
          { id: '1', name: 'Client Intake Form', uploadedAt: new Date().toISOString() },
          { id: '2', name: 'Signed Retainer Agreement', uploadedAt: new Date().toISOString() },
          { id: '3', name: 'Insurance Claim Letter', uploadedAt: new Date().toISOString() },
        ]
      },
      checklist: [
        { name: 'Client Intake Form', status: 'present', importance: 'critical' },
        { name: 'Signed Retainer Agreement', status: 'present', importance: 'critical' },
        { name: 'Police Report', status: 'missing', importance: 'critical' },
        { name: 'Medical Records', status: 'missing', importance: 'critical' },
        { name: 'Witness Statements', status: 'missing', importance: 'critical' },
        { name: 'Accident Scene Photos', status: 'incomplete', importance: 'required' },
        { name: 'Insurance Policy', status: 'incomplete', importance: 'required' },
        { name: 'Lost Wage Documentation', status: 'missing', importance: 'required' },
        { name: 'Medical Bills', status: 'incomplete', importance: 'required' },
        { name: 'Demand Letter', status: 'incomplete', importance: 'required' },
      ],
      score: {
        overall: 65,
        criticalMissing: 3,
        requiredMissing: 5,
        recommendedMissing: 2,
        byPhase: {
          intake: 85,
          investigation: 45,
          treatment: 60,
          demand: 50,
          litigation: 0,
          settlement: 70
        }
      },
      recommendations: [
        'URGENT: Obtain police report immediately - required for case prosecution',
        'URGENT: Request complete medical records from all treating physicians',
        'URGENT: Interview and document all witnesses while memories are fresh',
        'Collect all accident scene photographs and diagrams',
        'Gather complete lost wage documentation from employer'
      ],
      phaseReadiness: {
        currentPhase: 'settlement',
        canProceed: false,
        blockers: [
          'Missing critical police report',
          'Incomplete medical documentation',
          'No witness statements on file'
        ]
      },
      generatedAt: new Date().toISOString()
    },
    'case-smith-002': {
      caseId: 'case-smith-002',
      case: {
        id: 'case-smith-002',
        caseNumber: '2024-PI-1235',
        clientName: 'Michael Johnson',
        caseType: 'personal_injury',
        currentPhase: 'discovery',
        assignedAttorney: 'John Smith',
        dateOpened: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        documents: []
      },
      checklist: [
        { name: 'Client Intake Form', status: 'present', importance: 'critical' },
        { name: 'Signed Retainer Agreement', status: 'present', importance: 'critical' },
        { name: 'Police Report', status: 'present', importance: 'critical' },
        { name: 'Medical Records', status: 'incomplete', importance: 'critical' },
        { name: 'Witness Statements', status: 'missing', importance: 'critical' },
        { name: 'Accident Scene Photos', status: 'present', importance: 'required' },
        { name: 'Insurance Policy', status: 'present', importance: 'required' },
        { name: 'Lost Wage Documentation', status: 'missing', importance: 'required' },
        { name: 'Medical Bills', status: 'incomplete', importance: 'required' },
        { name: 'Demand Letter', status: 'missing', importance: 'required' },
      ],
      score: {
        overall: 72,
        criticalMissing: 2,
        requiredMissing: 4,
        recommendedMissing: 1,
        byPhase: {
          intake: 90,
          investigation: 80,
          treatment: 65,
          demand: 40,
          litigation: 0,
          settlement: 0
        }
      },
      recommendations: [
        'Complete medical records collection from all providers',
        'Interview and document witness testimony',
        'Obtain lost wage documentation from employer',
        'Finalize medical bills compilation'
      ],
      phaseReadiness: {
        currentPhase: 'discovery',
        canProceed: false,
        blockers: [
          'Incomplete medical records',
          'Missing witness statements'
        ]
      },
      generatedAt: new Date().toISOString()
    },
    'case-johnson-001': {
      caseId: 'case-johnson-001',
      case: {
        id: 'case-johnson-001',
        caseNumber: '2024-PI-5001',
        clientName: 'Amanda Thompson',
        caseType: 'personal_injury',
        currentPhase: 'settlement',
        assignedAttorney: 'Mark Johnson',
        dateOpened: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        documents: []
      },
      checklist: [
        { name: 'Client Intake Form', status: 'present', importance: 'critical' },
        { name: 'Signed Retainer Agreement', status: 'present', importance: 'critical' },
        { name: 'Police Report', status: 'present', importance: 'critical' },
        { name: 'Medical Records', status: 'present', importance: 'critical' },
        { name: 'Witness Statements', status: 'present', importance: 'critical' },
        { name: 'Accident Scene Photos', status: 'present', importance: 'required' },
        { name: 'Insurance Policy', status: 'present', importance: 'required' },
        { name: 'Lost Wage Documentation', status: 'present', importance: 'required' },
        { name: 'Medical Bills', status: 'present', importance: 'required' },
        { name: 'Demand Letter', status: 'present', importance: 'required' },
        { name: 'Settlement Proposal', status: 'incomplete', importance: 'critical' },
      ],
      score: {
        overall: 88,
        criticalMissing: 1,
        requiredMissing: 2,
        recommendedMissing: 0,
        byPhase: {
          intake: 100,
          investigation: 100,
          treatment: 100,
          demand: 95,
          litigation: 0,
          settlement: 75
        }
      },
      recommendations: [
        'Finalize settlement proposal documentation',
        'Review and prepare final settlement documents',
        'Schedule settlement conference'
      ],
      phaseReadiness: {
        currentPhase: 'settlement',
        canProceed: true,
        blockers: []
      },
      generatedAt: new Date().toISOString()
    }
  };

  return demoAudits[caseId] || null;
}

/**
 * Generate audit report for a specific case
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;

    // Check if this is a demo case
    if (caseId.startsWith('case-')) {
      const demoAudit = getDemoAuditReport(caseId);
      if (demoAudit) {
        return NextResponse.json({ audit: demoAudit });
      }
      return NextResponse.json(
        { error: 'Demo case not found' },
        { status: 404 }
      );
    }

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
