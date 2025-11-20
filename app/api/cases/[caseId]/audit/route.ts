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
        {
          status: 'present',
          requirement: { name: 'Client Intake Form', priority: 'critical', description: 'Initial client information and case details' },
          matchedDocuments: [{ id: '1', name: 'Client Intake Form.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Signed Retainer Agreement', priority: 'critical', description: 'Attorney-client representation agreement' },
          matchedDocuments: [{ id: '2', name: 'Retainer Agreement.pdf' }]
        },
        {
          status: 'missing',
          requirement: { name: 'Police Report', priority: 'critical', description: 'Official accident report from law enforcement' },
          matchedDocuments: []
        },
        {
          status: 'missing',
          requirement: { name: 'Medical Records', priority: 'critical', description: 'Complete treatment records from all providers' },
          matchedDocuments: []
        },
        {
          status: 'missing',
          requirement: { name: 'Witness Statements', priority: 'critical', description: 'Signed statements from all witnesses' },
          matchedDocuments: []
        },
        {
          status: 'incomplete',
          requirement: { name: 'Accident Scene Photos', priority: 'required', description: 'Photographic evidence of accident scene' },
          matchedDocuments: [{ id: '3', name: 'Photo1.jpg' }]
        },
        {
          status: 'incomplete',
          requirement: { name: 'Insurance Policy', priority: 'required', description: 'Full insurance policy documentation' },
          matchedDocuments: [{ id: '4', name: 'Policy_Partial.pdf' }]
        },
        {
          status: 'missing',
          requirement: { name: 'Lost Wage Documentation', priority: 'required', description: 'Employer verification of lost income' },
          matchedDocuments: []
        },
        {
          status: 'incomplete',
          requirement: { name: 'Medical Bills', priority: 'required', description: 'Itemized billing from all medical providers' },
          matchedDocuments: [{ id: '5', name: 'Bills_Jan.pdf' }]
        },
        {
          status: 'incomplete',
          requirement: { name: 'Demand Letter', priority: 'required', description: 'Formal settlement demand to insurance' },
          matchedDocuments: [{ id: '6', name: 'Demand_Draft.docx' }]
        },
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
        currentPhaseComplete: false,
        readyForNextPhase: false,
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
        {
          status: 'present',
          requirement: { name: 'Client Intake Form', priority: 'critical', description: 'Initial client information and case details' },
          matchedDocuments: [{ id: '1', name: 'Client Intake Form.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Signed Retainer Agreement', priority: 'critical', description: 'Attorney-client representation agreement' },
          matchedDocuments: [{ id: '2', name: 'Retainer Agreement.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Police Report', priority: 'critical', description: 'Official accident report from law enforcement' },
          matchedDocuments: [{ id: '3', name: 'Police_Report_123.pdf' }]
        },
        {
          status: 'incomplete',
          requirement: { name: 'Medical Records', priority: 'critical', description: 'Complete treatment records from all providers' },
          matchedDocuments: [{ id: '4', name: 'Medical_Records_ER.pdf' }]
        },
        {
          status: 'missing',
          requirement: { name: 'Witness Statements', priority: 'critical', description: 'Signed statements from all witnesses' },
          matchedDocuments: []
        },
        {
          status: 'present',
          requirement: { name: 'Accident Scene Photos', priority: 'required', description: 'Photographic evidence of accident scene' },
          matchedDocuments: [{ id: '5', name: 'Scene_Photos.zip' }]
        },
        {
          status: 'present',
          requirement: { name: 'Insurance Policy', priority: 'required', description: 'Full insurance policy documentation' },
          matchedDocuments: [{ id: '6', name: 'Insurance_Policy.pdf' }]
        },
        {
          status: 'missing',
          requirement: { name: 'Lost Wage Documentation', priority: 'required', description: 'Employer verification of lost income' },
          matchedDocuments: []
        },
        {
          status: 'incomplete',
          requirement: { name: 'Medical Bills', priority: 'required', description: 'Itemized billing from all medical providers' },
          matchedDocuments: [{ id: '7', name: 'Bills_Q1.pdf' }]
        },
        {
          status: 'missing',
          requirement: { name: 'Demand Letter', priority: 'required', description: 'Formal settlement demand to insurance' },
          matchedDocuments: []
        },
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
        currentPhaseComplete: false,
        readyForNextPhase: false,
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
        {
          status: 'present',
          requirement: { name: 'Client Intake Form', priority: 'critical', description: 'Initial client information and case details' },
          matchedDocuments: [{ id: '1', name: 'Client Intake Form.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Signed Retainer Agreement', priority: 'critical', description: 'Attorney-client representation agreement' },
          matchedDocuments: [{ id: '2', name: 'Retainer Agreement.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Police Report', priority: 'critical', description: 'Official accident report from law enforcement' },
          matchedDocuments: [{ id: '3', name: 'Police_Report_456.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Medical Records', priority: 'critical', description: 'Complete treatment records from all providers' },
          matchedDocuments: [{ id: '4', name: 'Medical_Records_Complete.pdf' }, { id: '5', name: 'PT_Records.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Witness Statements', priority: 'critical', description: 'Signed statements from all witnesses' },
          matchedDocuments: [{ id: '6', name: 'Witness1.pdf' }, { id: '7', name: 'Witness2.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Accident Scene Photos', priority: 'required', description: 'Photographic evidence of accident scene' },
          matchedDocuments: [{ id: '8', name: 'Scene_Photos_Complete.zip' }]
        },
        {
          status: 'present',
          requirement: { name: 'Insurance Policy', priority: 'required', description: 'Full insurance policy documentation' },
          matchedDocuments: [{ id: '9', name: 'Insurance_Policy_Full.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Lost Wage Documentation', priority: 'required', description: 'Employer verification of lost income' },
          matchedDocuments: [{ id: '10', name: 'Employer_Letter.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Medical Bills', priority: 'required', description: 'Itemized billing from all medical providers' },
          matchedDocuments: [{ id: '11', name: 'Bills_Complete.pdf' }]
        },
        {
          status: 'present',
          requirement: { name: 'Demand Letter', priority: 'required', description: 'Formal settlement demand to insurance' },
          matchedDocuments: [{ id: '12', name: 'Demand_Letter_Final.pdf' }]
        },
        {
          status: 'incomplete',
          requirement: { name: 'Settlement Proposal', priority: 'critical', description: 'Proposed settlement terms and documentation' },
          matchedDocuments: [{ id: '13', name: 'Settlement_Draft.docx' }]
        },
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
        currentPhaseComplete: false,
        readyForNextPhase: true,
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
