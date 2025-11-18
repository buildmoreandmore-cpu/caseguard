import { DocumentRequirement, DocumentType, CasePhase } from '@/types';

/**
 * Personal Injury Document Requirements by Phase
 * Based on industry best practices for PI case management
 */

export const DOCUMENT_REQUIREMENTS: DocumentRequirement[] = [
  // INTAKE PHASE - Critical Documents
  {
    type: 'client_intake_form',
    name: 'Client Intake Form',
    description: 'Initial client information and incident details',
    priority: 'critical',
    phases: ['intake'],
    requiredForPhaseCompletion: true,
  },
  {
    type: 'fee_agreement',
    name: 'Fee Agreement / Retainer',
    description: 'Signed attorney-client fee agreement',
    priority: 'critical',
    phases: ['intake'],
    requiredForPhaseCompletion: true,
  },
  {
    type: 'medical_authorization',
    name: 'Medical Authorization (HIPAA)',
    description: 'Authorization to obtain medical records',
    priority: 'critical',
    phases: ['intake'],
    requiredForPhaseCompletion: true,
  },
  {
    type: 'police_report',
    name: 'Police/Incident Report',
    description: 'Official incident report if applicable',
    priority: 'required',
    phases: ['intake', 'treatment'],
    requiredForPhaseCompletion: false,
  },
  {
    type: 'incident_photos',
    name: 'Incident Scene Photos',
    description: 'Photos of accident scene, vehicles, or location',
    priority: 'required',
    phases: ['intake', 'treatment'],
    requiredForPhaseCompletion: false,
  },

  // TREATMENT PHASE
  {
    type: 'medical_records',
    name: 'Medical Records',
    description: 'Complete medical treatment records',
    priority: 'critical',
    phases: ['treatment', 'demand', 'litigation'],
    requiredForPhaseCompletion: true,
  },
  {
    type: 'medical_bills',
    name: 'Medical Bills/Invoices',
    description: 'Itemized medical billing statements',
    priority: 'critical',
    phases: ['treatment', 'demand', 'litigation'],
    requiredForPhaseCompletion: true,
  },
  {
    type: 'employment_records',
    name: 'Employment Records',
    description: 'Employment verification and wage information',
    priority: 'required',
    phases: ['treatment', 'demand'],
    requiredForPhaseCompletion: false,
  },
  {
    type: 'wage_loss_documentation',
    name: 'Wage Loss Documentation',
    description: 'Pay stubs, tax returns, employer letters',
    priority: 'required',
    phases: ['treatment', 'demand', 'litigation'],
    requiredForPhaseCompletion: false,
  },
  {
    type: 'witness_statements',
    name: 'Witness Statements',
    description: 'Recorded or written witness accounts',
    priority: 'recommended',
    phases: ['intake', 'treatment', 'demand'],
    requiredForPhaseCompletion: false,
  },

  // DEMAND PHASE
  {
    type: 'property_damage_estimate',
    name: 'Property Damage Estimate',
    description: 'Repair estimates or total loss valuation',
    priority: 'required',
    phases: ['demand', 'litigation'],
    requiredForPhaseCompletion: false,
  },
  {
    type: 'insurance_correspondence',
    name: 'Insurance Correspondence',
    description: 'All communications with insurance companies',
    priority: 'recommended',
    phases: ['treatment', 'demand', 'litigation'],
    requiredForPhaseCompletion: false,
  },
  {
    type: 'demand_letter',
    name: 'Demand Letter',
    description: 'Formal settlement demand to insurance carrier',
    priority: 'critical',
    phases: ['demand'],
    requiredForPhaseCompletion: true,
  },

  // LITIGATION PHASE
  {
    type: 'complaint',
    name: 'Complaint/Petition',
    description: 'Filed court complaint initiating lawsuit',
    priority: 'critical',
    phases: ['litigation'],
    requiredForPhaseCompletion: true,
  },
  {
    type: 'discovery_requests',
    name: 'Discovery Requests',
    description: 'Interrogatories, requests for production, admissions',
    priority: 'required',
    phases: ['litigation'],
    requiredForPhaseCompletion: false,
  },
  {
    type: 'discovery_responses',
    name: 'Discovery Responses',
    description: 'Client and defendant responses to discovery',
    priority: 'required',
    phases: ['litigation'],
    requiredForPhaseCompletion: false,
  },
  {
    type: 'expert_reports',
    name: 'Expert Reports',
    description: 'Medical, vocational, or accident reconstruction expert reports',
    priority: 'recommended',
    phases: ['litigation'],
    requiredForPhaseCompletion: false,
  },

  // SETTLEMENT PHASE
  {
    type: 'settlement_agreement',
    name: 'Settlement Agreement',
    description: 'Executed settlement and release documents',
    priority: 'critical',
    phases: ['settlement'],
    requiredForPhaseCompletion: true,
  },
];

/**
 * Get document requirements for a specific case phase
 */
export function getRequirementsForPhase(phase: CasePhase): DocumentRequirement[] {
  return DOCUMENT_REQUIREMENTS.filter(req => req.phases.includes(phase));
}

/**
 * Get critical requirements for a phase (must-haves)
 */
export function getCriticalRequirements(phase: CasePhase): DocumentRequirement[] {
  return getRequirementsForPhase(phase).filter(req => req.priority === 'critical');
}

/**
 * Get all requirements up to and including the current phase
 */
export function getCumulativeRequirements(currentPhase: CasePhase): DocumentRequirement[] {
  const phaseOrder: CasePhase[] = ['intake', 'treatment', 'demand', 'litigation', 'settlement'];
  const currentIndex = phaseOrder.indexOf(currentPhase);

  const relevantPhases = phaseOrder.slice(0, currentIndex + 1);

  return DOCUMENT_REQUIREMENTS.filter(req =>
    req.phases.some(phase => relevantPhases.includes(phase))
  );
}
