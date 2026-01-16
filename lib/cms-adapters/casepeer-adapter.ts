// CasePeer CMS Adapter
// Refactored from original casepeer-client.ts

import { Case, CaseDocument } from '@/types';
import { BaseCMSAdapter } from './base-adapter';
import { CMSConfig, CMSProvider, ConnectionTestResult } from './types';

/**
 * CasePeer API Adapter
 * Connects to CasePeer's REST API for PI case management
 */
export class CasePeerAdapter extends BaseCMSAdapter {
  readonly provider: CMSProvider = 'casepeer';

  constructor(config: CMSConfig) {
    super(config);
  }

  /**
   * Test connection to CasePeer
   */
  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const cases = await this.apiRequest<any[]>('/cases?limit=1');

      return {
        success: true,
        message: 'Successfully connected to CasePeer',
        details: {
          casesFound: Array.isArray(cases) ? cases.length : 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Fetch all cases from CasePeer
   */
  async getCases(): Promise<Case[]> {
    try {
      const data = await this.apiRequest<any[]>('/cases');
      return (data || []).map((item: any) => this.transformCase(item));
    } catch (error) {
      console.error('Error fetching CasePeer cases:', error);
      return [];
    }
  }

  /**
   * Fetch a single case by ID
   */
  async getCase(caseId: string): Promise<Case | null> {
    try {
      const data = await this.apiRequest<any>(`/cases/${caseId}`);
      return this.transformCase(data);
    } catch (error) {
      console.error(`Error fetching CasePeer case ${caseId}:`, error);
      return null;
    }
  }

  /**
   * Fetch documents for a case
   */
  async getDocuments(caseId: string): Promise<CaseDocument[]> {
    try {
      const data = await this.apiRequest<any[]>(`/cases/${caseId}/documents`);
      return (data || []).map((doc: any) => this.transformDocument(doc));
    } catch (error) {
      console.error(`Error fetching CasePeer documents for ${caseId}:`, error);
      return [];
    }
  }

  /**
   * Transform CasePeer case to our Case type
   */
  private transformCase(data: any): Case {
    return {
      id: data.id || data.case_id,
      caseNumber: data.case_number || data.caseNumber,
      clientName: data.client_name || data.clientName,
      caseType: this.mapCaseType(data.case_type || data.caseType || ''),
      currentPhase: this.mapPhase(data.current_phase || data.phase || data.status || ''),
      dateOfIncident: this.parseDate(data.incident_date || data.dateOfIncident),
      dateOpened: this.parseDate(data.opened_date || data.dateOpened),
      assignedAttorney: data.attorney || data.assignedAttorney || 'Unassigned',
      documents: data.documents || [],
    };
  }

  /**
   * Transform CasePeer document to our CaseDocument type
   */
  private transformDocument(doc: any): CaseDocument {
    return {
      id: doc.id || doc.document_id,
      fileName: doc.file_name || doc.fileName,
      uploadDate: this.parseDate(doc.upload_date || doc.uploadDate),
      fileSize: doc.file_size || doc.fileSize || 0,
      mimeType: doc.mime_type || doc.mimeType || 'application/octet-stream',
      url: doc.url || doc.download_url,
    };
  }
}
