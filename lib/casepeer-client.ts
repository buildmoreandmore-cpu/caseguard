import { Case, CaseDocument, CasePeerConfig } from '@/types';

/**
 * CasePeer API Client
 * Supports both real API integration and mock mode for demo
 */

export class CasePeerClient {
  private config: CasePeerConfig;

  constructor(config: CasePeerConfig) {
    this.config = config;
  }

  /**
   * Fetch all cases from CasePeer
   */
  async getCases(): Promise<Case[]> {
    if (!this.config.enabled) {
      return this.getMockCases();
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/cases`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CasePeer API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformCasePeerCases(data);
    } catch (error) {
      console.error('Error fetching cases from CasePeer:', error);
      // Fallback to mock data
      return this.getMockCases();
    }
  }

  /**
   * Fetch a single case by ID
   */
  async getCase(caseId: string): Promise<Case | null> {
    if (!this.config.enabled) {
      const cases = await this.getMockCases();
      return cases.find(c => c.id === caseId) || null;
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/cases/${caseId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CasePeer API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformCasePeerCase(data);
    } catch (error) {
      console.error('Error fetching case from CasePeer:', error);
      return null;
    }
  }

  /**
   * Fetch documents for a specific case
   */
  async getCaseDocuments(caseId: string): Promise<CaseDocument[]> {
    if (!this.config.enabled) {
      const mockCase = (await this.getMockCases()).find(c => c.id === caseId);
      return mockCase?.documents || [];
    }

    try {
      const response = await fetch(`${this.config.apiUrl}/cases/${caseId}/documents`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CasePeer API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.transformCasePeerDocuments(data);
    } catch (error) {
      console.error('Error fetching documents from CasePeer:', error);
      return [];
    }
  }

  /**
   * Transform CasePeer API response to our Case type
   */
  private transformCasePeerCase(data: any): Case {
    // This would map CasePeer's actual data structure to our type
    // Placeholder implementation
    return {
      id: data.id || data.case_id,
      caseNumber: data.case_number || data.caseNumber,
      clientName: data.client_name || data.clientName,
      caseType: data.case_type || 'auto_accident',
      currentPhase: data.current_phase || data.phase || 'intake',
      dateOfIncident: new Date(data.incident_date || data.dateOfIncident),
      dateOpened: new Date(data.opened_date || data.dateOpened),
      assignedAttorney: data.attorney || data.assignedAttorney,
      documents: data.documents || [],
    };
  }

  private transformCasePeerCases(data: any[]): Case[] {
    return data.map(item => this.transformCasePeerCase(item));
  }

  private transformCasePeerDocuments(data: any[]): CaseDocument[] {
    return data.map(doc => ({
      id: doc.id || doc.document_id,
      fileName: doc.file_name || doc.fileName,
      uploadDate: new Date(doc.upload_date || doc.uploadDate),
      fileSize: doc.file_size || doc.fileSize,
      mimeType: doc.mime_type || doc.mimeType,
      url: doc.url || doc.download_url,
    }));
  }

  /**
   * Mock cases for demo purposes
   */
  private getMockCases(): Case[] {
    return [
      {
        id: 'case-001',
        caseNumber: 'PI-2024-001',
        clientName: 'Sarah Johnson',
        caseType: 'auto_accident',
        currentPhase: 'treatment',
        dateOfIncident: new Date('2024-08-15'),
        dateOpened: new Date('2024-08-20'),
        assignedAttorney: 'John Smith',
        documents: [
          {
            id: 'doc-001',
            fileName: 'client_intake_form.pdf',
            uploadDate: new Date('2024-08-20'),
            fileSize: 245000,
            mimeType: 'application/pdf',
            classifiedType: 'client_intake_form',
            aiConfidence: 0.95,
          },
          {
            id: 'doc-002',
            fileName: 'fee_agreement_signed.pdf',
            uploadDate: new Date('2024-08-20'),
            fileSize: 180000,
            mimeType: 'application/pdf',
            classifiedType: 'fee_agreement',
            aiConfidence: 0.92,
          },
          {
            id: 'doc-003',
            fileName: 'police_report_08152024.pdf',
            uploadDate: new Date('2024-08-22'),
            fileSize: 520000,
            mimeType: 'application/pdf',
            classifiedType: 'police_report',
            aiConfidence: 0.98,
          },
          {
            id: 'doc-004',
            fileName: 'accident_scene_photos.pdf',
            uploadDate: new Date('2024-08-22'),
            fileSize: 1200000,
            mimeType: 'application/pdf',
            classifiedType: 'incident_photos',
            aiConfidence: 0.89,
          },
          {
            id: 'doc-005',
            fileName: 'medical_records_emergency_room.pdf',
            uploadDate: new Date('2024-09-05'),
            fileSize: 850000,
            mimeType: 'application/pdf',
            classifiedType: 'medical_records',
            aiConfidence: 0.96,
          },
        ],
      },
      {
        id: 'case-002',
        caseNumber: 'PI-2024-002',
        clientName: 'Michael Rodriguez',
        caseType: 'premises_liability',
        currentPhase: 'demand',
        dateOfIncident: new Date('2024-06-10'),
        dateOpened: new Date('2024-06-15'),
        assignedAttorney: 'Emily Davis',
        documents: [
          {
            id: 'doc-101',
            fileName: 'intake_form_rodriguez.pdf',
            uploadDate: new Date('2024-06-15'),
            fileSize: 230000,
            mimeType: 'application/pdf',
            classifiedType: 'client_intake_form',
            aiConfidence: 0.94,
          },
          {
            id: 'doc-102',
            fileName: 'retainer_agreement.pdf',
            uploadDate: new Date('2024-06-15'),
            fileSize: 190000,
            mimeType: 'application/pdf',
            classifiedType: 'fee_agreement',
            aiConfidence: 0.91,
          },
          {
            id: 'doc-103',
            fileName: 'incident_photos_store.pdf',
            uploadDate: new Date('2024-06-16'),
            fileSize: 980000,
            mimeType: 'application/pdf',
            classifiedType: 'incident_photos',
            aiConfidence: 0.87,
          },
          {
            id: 'doc-104',
            fileName: 'medical_authorization_hipaa.pdf',
            uploadDate: new Date('2024-06-15'),
            fileSize: 120000,
            mimeType: 'application/pdf',
            classifiedType: 'medical_authorization',
            aiConfidence: 0.97,
          },
          {
            id: 'doc-105',
            fileName: 'complete_medical_records.pdf',
            uploadDate: new Date('2024-08-01'),
            fileSize: 1500000,
            mimeType: 'application/pdf',
            classifiedType: 'medical_records',
            aiConfidence: 0.95,
          },
          {
            id: 'doc-106',
            fileName: 'medical_bills_itemized.pdf',
            uploadDate: new Date('2024-08-01'),
            fileSize: 340000,
            mimeType: 'application/pdf',
            classifiedType: 'medical_bills',
            aiConfidence: 0.93,
          },
          {
            id: 'doc-107',
            fileName: 'witness_statement_manager.pdf',
            uploadDate: new Date('2024-06-20'),
            fileSize: 180000,
            mimeType: 'application/pdf',
            classifiedType: 'witness_statements',
            aiConfidence: 0.88,
          },
          {
            id: 'doc-108',
            fileName: 'demand_letter_draft.pdf',
            uploadDate: new Date('2024-10-15'),
            fileSize: 280000,
            mimeType: 'application/pdf',
            classifiedType: 'demand_letter',
            aiConfidence: 0.92,
          },
        ],
      },
      {
        id: 'case-003',
        caseNumber: 'PI-2024-003',
        clientName: 'Jennifer Martinez',
        caseType: 'auto_accident',
        currentPhase: 'intake',
        dateOfIncident: new Date('2024-10-28'),
        dateOpened: new Date('2024-11-01'),
        assignedAttorney: 'John Smith',
        documents: [
          {
            id: 'doc-201',
            fileName: 'initial_consultation_notes.pdf',
            uploadDate: new Date('2024-11-01'),
            fileSize: 150000,
            mimeType: 'application/pdf',
            classifiedType: 'other',
            aiConfidence: 0.65,
          },
        ],
      },
    ];
  }
}

/**
 * Get configured CasePeer client instance
 */
export function getCasePeerClient(): CasePeerClient {
  const config: CasePeerConfig = {
    apiUrl: process.env.CASEPEER_API_URL || '',
    apiKey: process.env.CASEPEER_API_KEY || '',
    enabled: process.env.CASEPEER_ENABLED === 'true',
  };

  return new CasePeerClient(config);
}
