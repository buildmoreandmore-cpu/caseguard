import { NextRequest, NextResponse } from 'next/server';
import { getCasePeerClient } from '@/lib/casepeer-client';
import { AuditEngine } from '@/lib/audit-engine';

// Demo case metadata
const demoCases: Record<string, { clientName: string; caseNumber: string; caseType: string; currentPhase: string; assignedAttorney: string; score: number; criticalMissing: number; requiredMissing: number }> = {
  'case-001': { clientName: 'Sarah Martinez', caseNumber: '2024-PI-1001', caseType: 'personal_injury', currentPhase: 'settlement', assignedAttorney: 'John Anderson', score: 65, criticalMissing: 3, requiredMissing: 5 },
  'case-002': { clientName: 'Michael Johnson', caseNumber: '2024-PI-1002', caseType: 'personal_injury', currentPhase: 'discovery', assignedAttorney: 'John Anderson', score: 72, criticalMissing: 2, requiredMissing: 4 },
  'case-003': { clientName: 'Robert Davis', caseNumber: '2024-WC-1003', caseType: 'workers_compensation', currentPhase: 'pre_litigation', assignedAttorney: 'Maria Garcia', score: 78, criticalMissing: 1, requiredMissing: 3 },
  'case-004': { clientName: 'Emily Wilson', caseNumber: '2024-PI-1004', caseType: 'personal_injury', currentPhase: 'litigation', assignedAttorney: 'John Anderson', score: 68, criticalMissing: 2, requiredMissing: 5 },
  'case-005': { clientName: 'David Brown', caseNumber: '2024-PI-1005', caseType: 'personal_injury', currentPhase: 'settlement', assignedAttorney: 'Maria Garcia', score: 82, criticalMissing: 0, requiredMissing: 3 },
  'case-006': { clientName: 'Jennifer Lopez', caseNumber: '2024-PI-1006', caseType: 'personal_injury', currentPhase: 'treatment', assignedAttorney: 'John Anderson', score: 55, criticalMissing: 4, requiredMissing: 6 },
  'case-007': { clientName: 'James Williams', caseNumber: '2024-PI-1007', caseType: 'personal_injury', currentPhase: 'demand', assignedAttorney: 'Maria Garcia', score: 88, criticalMissing: 0, requiredMissing: 2 },
  'case-008': { clientName: 'Patricia Miller', caseNumber: '2024-WC-1008', caseType: 'workers_compensation', currentPhase: 'treatment', assignedAttorney: 'John Anderson', score: 45, criticalMissing: 5, requiredMissing: 7 },
  'case-009': { clientName: 'Christopher Garcia', caseNumber: '2024-PI-1009', caseType: 'personal_injury', currentPhase: 'intake', assignedAttorney: 'Maria Garcia', score: 35, criticalMissing: 6, requiredMissing: 8 },
  'case-010': { clientName: 'Amanda Thompson', caseNumber: '2024-PI-1010', caseType: 'personal_injury', currentPhase: 'settlement', assignedAttorney: 'John Anderson', score: 92, criticalMissing: 0, requiredMissing: 1 },
  'case-011': { clientName: 'Daniel Rodriguez', caseNumber: '2024-PI-1011', caseType: 'personal_injury', currentPhase: 'litigation', assignedAttorney: 'Maria Garcia', score: 76, criticalMissing: 1, requiredMissing: 4 },
  'case-012': { clientName: 'Nancy Taylor', caseNumber: '2024-WC-1012', caseType: 'workers_compensation', currentPhase: 'demand', assignedAttorney: 'John Anderson', score: 84, criticalMissing: 0, requiredMissing: 2 },
};

// Generate a demo audit report dynamically based on case metadata
function getDemoAuditReport(caseId: string) {
  const caseInfo = demoCases[caseId];
  if (!caseInfo) return null;

  const { clientName, caseNumber, caseType, currentPhase, assignedAttorney, score, criticalMissing, requiredMissing } = caseInfo;

  // Generate checklist based on score
  const checklist = [
    { status: score > 30 ? 'present' : 'missing', requirement: { name: 'Client Intake Form', priority: 'critical', description: 'Initial client information and case details' }, matchedDocuments: score > 30 ? [{ id: '1', name: 'Intake_Form.pdf' }] : [] },
    { status: score > 40 ? 'present' : 'missing', requirement: { name: 'Signed Retainer Agreement', priority: 'critical', description: 'Attorney-client representation agreement' }, matchedDocuments: score > 40 ? [{ id: '2', name: 'Retainer.pdf' }] : [] },
    { status: criticalMissing > 2 ? 'missing' : 'present', requirement: { name: 'Police Report', priority: 'critical', description: 'Official accident report from law enforcement' }, matchedDocuments: criticalMissing > 2 ? [] : [{ id: '3', name: 'Police_Report.pdf' }] },
    { status: criticalMissing > 1 ? 'incomplete' : 'present', requirement: { name: 'Medical Records', priority: 'critical', description: 'Complete treatment records from all providers' }, matchedDocuments: [{ id: '4', name: 'Medical_Records.pdf' }] },
    { status: criticalMissing > 0 ? 'missing' : 'present', requirement: { name: 'Witness Statements', priority: 'critical', description: 'Signed statements from all witnesses' }, matchedDocuments: criticalMissing > 0 ? [] : [{ id: '5', name: 'Witness_Statement.pdf' }] },
    { status: requiredMissing > 4 ? 'missing' : 'present', requirement: { name: 'Accident Scene Photos', priority: 'required', description: 'Photographic evidence of accident scene' }, matchedDocuments: requiredMissing > 4 ? [] : [{ id: '6', name: 'Photos.zip' }] },
    { status: requiredMissing > 3 ? 'incomplete' : 'present', requirement: { name: 'Insurance Policy', priority: 'required', description: 'Full insurance policy documentation' }, matchedDocuments: [{ id: '7', name: 'Insurance.pdf' }] },
    { status: requiredMissing > 2 ? 'missing' : 'present', requirement: { name: 'Lost Wage Documentation', priority: 'required', description: 'Employer verification of lost income' }, matchedDocuments: requiredMissing > 2 ? [] : [{ id: '8', name: 'Wage_Letter.pdf' }] },
    { status: requiredMissing > 1 ? 'incomplete' : 'present', requirement: { name: 'Medical Bills', priority: 'required', description: 'Itemized billing from all medical providers' }, matchedDocuments: [{ id: '9', name: 'Bills.pdf' }] },
    { status: requiredMissing > 0 ? 'missing' : 'present', requirement: { name: 'Demand Letter', priority: 'required', description: 'Formal settlement demand to insurance' }, matchedDocuments: requiredMissing > 0 ? [] : [{ id: '10', name: 'Demand.pdf' }] },
  ];

  const recommendations = [];
  if (criticalMissing > 0) recommendations.push('URGENT: Obtain missing critical documents immediately');
  if (criticalMissing > 2) recommendations.push('Request police report from law enforcement');
  if (criticalMissing > 1) recommendations.push('Complete medical records collection from all providers');
  if (requiredMissing > 3) recommendations.push('Gather accident scene documentation and photos');
  if (requiredMissing > 2) recommendations.push('Obtain lost wage verification from employer');
  if (requiredMissing > 0) recommendations.push('Prepare and finalize demand letter');
  if (recommendations.length === 0) recommendations.push('Case file is well-documented. Continue monitoring for updates.');

  return {
    caseId,
    case: {
      id: caseId,
      caseNumber,
      clientName,
      caseType,
      currentPhase,
      assignedAttorney,
      dateOpened: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      documents: []
    },
    checklist,
    score: {
      overall: score,
      criticalMissing,
      requiredMissing,
      recommendedMissing: Math.max(0, Math.floor((100 - score) / 10) - criticalMissing - requiredMissing),
      byPhase: {
        intake: Math.min(100, score + 20),
        investigation: Math.min(100, score + 10),
        treatment: score,
        demand: Math.max(0, score - 10),
        litigation: currentPhase === 'litigation' ? score : 0,
        settlement: currentPhase === 'settlement' ? score : 0
      }
    },
    recommendations,
    phaseReadiness: {
      currentPhase,
      currentPhaseComplete: criticalMissing === 0,
      readyForNextPhase: criticalMissing === 0 && requiredMissing <= 2,
      blockers: criticalMissing > 0
        ? ['Missing critical documents', 'Incomplete case file']
        : requiredMissing > 2
        ? ['Some required documents still needed']
        : []
    },
    generatedAt: new Date().toISOString()
  };
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
