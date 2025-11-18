// Core types for the Legal File Auditor

export type CasePhase = 'intake' | 'treatment' | 'demand' | 'litigation' | 'settlement';

export type DocumentType =
  | 'client_intake_form'
  | 'fee_agreement'
  | 'medical_authorization'
  | 'police_report'
  | 'incident_photos'
  | 'witness_statements'
  | 'medical_records'
  | 'medical_bills'
  | 'employment_records'
  | 'wage_loss_documentation'
  | 'property_damage_estimate'
  | 'insurance_correspondence'
  | 'demand_letter'
  | 'complaint'
  | 'discovery_requests'
  | 'discovery_responses'
  | 'expert_reports'
  | 'settlement_agreement'
  | 'other';

export type DocumentPriority = 'critical' | 'required' | 'recommended' | 'optional';

export interface DocumentRequirement {
  type: DocumentType;
  name: string;
  description: string;
  priority: DocumentPriority;
  phases: CasePhase[];
  requiredForPhaseCompletion: boolean;
}

export interface CaseDocument {
  id: string;
  fileName: string;
  uploadDate: Date;
  fileSize: number;
  mimeType: string;
  classifiedType?: DocumentType;
  aiConfidence?: number;
  extractedData?: Record<string, any>;
  url?: string;
}

export interface Case {
  id: string;
  caseNumber: string;
  clientName: string;
  caseType: 'auto_accident' | 'premises_liability' | 'medical_malpractice' | 'product_liability' | 'other_pi';
  currentPhase: CasePhase;
  dateOfIncident: Date;
  dateOpened: Date;
  assignedAttorney: string;
  documents: CaseDocument[];
  customRequirements?: DocumentRequirement[];
}

export interface DocumentChecklistItem {
  requirement: DocumentRequirement;
  status: 'present' | 'missing' | 'incomplete';
  matchedDocuments: CaseDocument[];
}

export interface CompletenessScore {
  overall: number; // 0-100
  byPhase: Record<CasePhase, number>;
  criticalMissing: number;
  requiredMissing: number;
  recommendedMissing: number;
}

export interface AuditReport {
  caseId: string;
  case: Case;
  checklist: DocumentChecklistItem[];
  score: CompletenessScore;
  recommendations: string[];
  phaseReadiness: {
    currentPhaseComplete: boolean;
    readyForNextPhase: boolean;
    blockers: string[];
  };
  generatedAt: Date;
}

export interface CasePeerConfig {
  apiUrl: string;
  apiKey: string;
  enabled: boolean;
}

export interface AIAnalysisResult {
  documentType: DocumentType;
  confidence: number;
  extractedData: Record<string, any>;
  summary: string;
}
