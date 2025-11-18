import {
  Case,
  AuditReport,
  DocumentChecklistItem,
  CompletenessScore,
  CasePhase,
  DocumentType,
  CaseDocument
} from '@/types';
import {
  getCumulativeRequirements,
  getRequirementsForPhase,
  DOCUMENT_REQUIREMENTS
} from './document-requirements';

/**
 * Main audit engine for analyzing case file completeness
 */
export class AuditEngine {
  /**
   * Generate a complete audit report for a case
   */
  static generateAuditReport(caseData: Case): AuditReport {
    const checklist = this.buildChecklist(caseData);
    const score = this.calculateCompletenessScore(caseData, checklist);
    const recommendations = this.generateRecommendations(caseData, checklist);
    const phaseReadiness = this.assessPhaseReadiness(caseData, checklist);

    return {
      caseId: caseData.id,
      case: caseData,
      checklist,
      score,
      recommendations,
      phaseReadiness,
      generatedAt: new Date(),
    };
  }

  /**
   * Build document checklist for the case
   */
  private static buildChecklist(caseData: Case): DocumentChecklistItem[] {
    const requirements = getCumulativeRequirements(caseData.currentPhase);

    return requirements.map(req => {
      const matchedDocuments = this.findMatchingDocuments(caseData.documents, req.type);
      const status = this.determineStatus(matchedDocuments, req);

      return {
        requirement: req,
        status,
        matchedDocuments,
      };
    });
  }

  /**
   * Find documents that match a specific requirement type
   */
  private static findMatchingDocuments(
    documents: CaseDocument[],
    type: DocumentType
  ): CaseDocument[] {
    return documents.filter(doc => doc.classifiedType === type);
  }

  /**
   * Determine the status of a document requirement
   */
  private static determineStatus(
    matchedDocuments: CaseDocument[],
    requirement: any
  ): 'present' | 'missing' | 'incomplete' {
    if (matchedDocuments.length === 0) {
      return 'missing';
    }

    // Check confidence threshold - if AI is not confident, mark as incomplete
    const hasLowConfidence = matchedDocuments.some(doc =>
      doc.aiConfidence !== undefined && doc.aiConfidence < 0.75
    );

    if (hasLowConfidence && requirement.priority === 'critical') {
      return 'incomplete';
    }

    return 'present';
  }

  /**
   * Calculate overall completeness score
   */
  private static calculateCompletenessScore(
    caseData: Case,
    checklist: DocumentChecklistItem[]
  ): CompletenessScore {
    const phaseOrder: CasePhase[] = ['intake', 'treatment', 'demand', 'litigation', 'settlement'];

    // Calculate by phase
    const byPhase: Record<CasePhase, number> = {} as Record<CasePhase, number>;

    phaseOrder.forEach(phase => {
      const phaseRequirements = getRequirementsForPhase(phase);
      const phaseChecklistItems = checklist.filter(item =>
        phaseRequirements.some(req => req.type === item.requirement.type)
      );

      const totalWeight = this.calculateTotalWeight(phaseChecklistItems);
      const achievedWeight = this.calculateAchievedWeight(phaseChecklistItems);

      byPhase[phase] = totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 100;
    });

    // Calculate overall score (weighted by current phase)
    const currentPhaseIndex = phaseOrder.indexOf(caseData.currentPhase);
    const relevantPhases = phaseOrder.slice(0, currentPhaseIndex + 1);

    const overallScore = relevantPhases.length > 0
      ? Math.round(
          relevantPhases.reduce((sum, phase) => sum + byPhase[phase], 0) / relevantPhases.length
        )
      : 0;

    // Count missing documents by priority
    const criticalMissing = checklist.filter(
      item => item.status === 'missing' && item.requirement.priority === 'critical'
    ).length;

    const requiredMissing = checklist.filter(
      item => item.status === 'missing' && item.requirement.priority === 'required'
    ).length;

    const recommendedMissing = checklist.filter(
      item => item.status === 'missing' && item.requirement.priority === 'recommended'
    ).length;

    return {
      overall: overallScore,
      byPhase,
      criticalMissing,
      requiredMissing,
      recommendedMissing,
    };
  }

  /**
   * Calculate total weight for checklist items
   */
  private static calculateTotalWeight(items: DocumentChecklistItem[]): number {
    return items.reduce((sum, item) => {
      switch (item.requirement.priority) {
        case 'critical': return sum + 10;
        case 'required': return sum + 5;
        case 'recommended': return sum + 2;
        case 'optional': return sum + 1;
        default: return sum;
      }
    }, 0);
  }

  /**
   * Calculate achieved weight (present documents only)
   */
  private static calculateAchievedWeight(items: DocumentChecklistItem[]): number {
    return items.reduce((sum, item) => {
      if (item.status !== 'present') return sum;

      switch (item.requirement.priority) {
        case 'critical': return sum + 10;
        case 'required': return sum + 5;
        case 'recommended': return sum + 2;
        case 'optional': return sum + 1;
        default: return sum;
      }
    }, 0);
  }

  /**
   * Generate AI-powered recommendations
   */
  private static generateRecommendations(
    caseData: Case,
    checklist: DocumentChecklistItem[]
  ): string[] {
    const recommendations: string[] = [];

    // Critical missing documents
    const criticalMissing = checklist.filter(
      item => item.status === 'missing' && item.requirement.priority === 'critical'
    );

    if (criticalMissing.length > 0) {
      recommendations.push(
        `🚨 URGENT: ${criticalMissing.length} critical document(s) missing: ${criticalMissing.map(i => i.requirement.name).join(', ')}`
      );
    }

    // Phase-specific recommendations
    const phaseRecommendations = this.getPhaseSpecificRecommendations(caseData, checklist);
    recommendations.push(...phaseRecommendations);

    // Case age recommendations
    const daysOpen = Math.floor(
      (new Date().getTime() - caseData.dateOpened.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysOpen > 90 && caseData.currentPhase === 'intake') {
      recommendations.push(
        `⏰ Case has been in intake phase for ${daysOpen} days. Consider advancing to treatment phase.`
      );
    }

    // Document quality recommendations
    const lowConfidenceDocs = caseData.documents.filter(
      doc => doc.aiConfidence !== undefined && doc.aiConfidence < 0.75
    );

    if (lowConfidenceDocs.length > 0) {
      recommendations.push(
        `⚠️ ${lowConfidenceDocs.length} document(s) need manual review due to low AI confidence.`
      );
    }

    return recommendations;
  }

  /**
   * Get phase-specific recommendations
   */
  private static getPhaseSpecificRecommendations(
    caseData: Case,
    checklist: DocumentChecklistItem[]
  ): string[] {
    const recommendations: string[] = [];

    switch (caseData.currentPhase) {
      case 'intake':
        if (!checklist.find(i => i.requirement.type === 'medical_authorization')?.matchedDocuments.length) {
          recommendations.push('📋 Obtain signed medical authorization to request treatment records.');
        }
        if (!checklist.find(i => i.requirement.type === 'police_report')?.matchedDocuments.length) {
          recommendations.push('🚔 Request official police report if not already obtained.');
        }
        break;

      case 'treatment':
        const hasMedicalRecords = checklist.find(i => i.requirement.type === 'medical_records')?.matchedDocuments.length;
        if (!hasMedicalRecords) {
          recommendations.push('🏥 Begin collecting medical records as treatment progresses.');
        }
        break;

      case 'demand':
        const demandReqs = ['medical_records', 'medical_bills', 'wage_loss_documentation'];
        const missingDemandDocs = demandReqs.filter(
          type => !checklist.find(i => i.requirement.type === type)?.matchedDocuments.length
        );
        if (missingDemandDocs.length === 0) {
          recommendations.push('✅ File appears ready for demand letter preparation.');
        } else {
          recommendations.push(
            `📝 Complete demand package by obtaining: ${missingDemandDocs.join(', ')}`
          );
        }
        break;

      case 'litigation':
        if (!checklist.find(i => i.requirement.type === 'complaint')?.matchedDocuments.length) {
          recommendations.push('⚖️ Draft and file complaint to initiate litigation.');
        }
        break;
    }

    return recommendations;
  }

  /**
   * Assess readiness for current and next phase
   */
  private static assessPhaseReadiness(
    caseData: Case,
    checklist: DocumentChecklistItem[]
  ): AuditReport['phaseReadiness'] {
    const phaseOrder: CasePhase[] = ['intake', 'treatment', 'demand', 'litigation', 'settlement'];
    const currentPhaseReqs = getRequirementsForPhase(caseData.currentPhase);

    // Check if all required docs for current phase are present
    const currentPhaseChecklist = checklist.filter(item =>
      currentPhaseReqs.some(req => req.type === item.requirement.type && req.requiredForPhaseCompletion)
    );

    const currentPhaseMissing = currentPhaseChecklist.filter(item => item.status === 'missing');
    const currentPhaseComplete = currentPhaseMissing.length === 0;

    // Check readiness for next phase
    const currentIndex = phaseOrder.indexOf(caseData.currentPhase);
    const nextPhase = phaseOrder[currentIndex + 1];

    let readyForNextPhase = false;
    const blockers: string[] = [];

    if (currentPhaseComplete && nextPhase) {
      readyForNextPhase = true;
    } else if (!currentPhaseComplete) {
      currentPhaseMissing.forEach(item => {
        blockers.push(`Missing: ${item.requirement.name}`);
      });
    }

    return {
      currentPhaseComplete,
      readyForNextPhase,
      blockers,
    };
  }
}
