import { Case, CaseDocument, CasePeerConfig } from '@/types';

export interface ScanProgress {
  currentCase: number;
  totalCases: number;
  currentCaseName: string;
  documentsAnalyzed: number;
  status: 'fetching' | 'analyzing' | 'complete' | 'error';
  message?: string;
}

export type ProgressCallback = (progress: ScanProgress) => void;

/**
 * Enhanced CasePeer API Client with bulk scanning support
 */
export class EnhancedCasePeerClient {
  private config: CasePeerConfig;

  constructor(apiUrl: string, apiKey: string) {
    this.config = {
      apiUrl,
      apiKey,
      enabled: true,
    };
  }

  /**
   * Fetch all cases with pagination support
   */
  async getAllCases(onProgress?: ProgressCallback): Promise<Case[]> {
    const cases: Case[] = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    try {
      while (hasMore) {
        onProgress?.({
          currentCase: cases.length,
          totalCases: cases.length,
          currentCaseName: 'Fetching cases...',
          documentsAnalyzed: 0,
          status: 'fetching',
          message: `Fetching page ${page}...`,
        });

        const response = await fetch(
          `${this.config.apiUrl}/cases?page=${page}&limit=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`CasePeer API error: ${response.statusText}`);
        }

        const data = await response.json();
        const pageCases = this.transformCasePeerCases(data.cases || data);

        cases.push(...pageCases);

        // Check if there are more pages
        hasMore = pageCases.length === pageSize && data.hasMore !== false;
        page++;

        // Rate limiting - avoid overwhelming the API
        if (hasMore) {
          await this.delay(500);
        }
      }

      return cases;
    } catch (error) {
      console.error('Error fetching cases from CasePeer:', error);
      throw error;
    }
  }

  /**
   * Fetch a single case with all documents
   */
  async getCaseWithDocuments(caseId: string): Promise<Case> {
    try {
      const response = await fetch(`${this.config.apiUrl}/cases/${caseId}`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`CasePeer API error: ${response.statusText}`);
      }

      const data = await response.json();
      const caseData = this.transformCasePeerCase(data);

      // Fetch documents separately if not included
      if (!caseData.documents || caseData.documents.length === 0) {
        caseData.documents = await this.getCaseDocuments(caseId);
      }

      return caseData;
    } catch (error) {
      console.error(`Error fetching case ${caseId}:`, error);
      throw error;
    }
  }

  /**
   * Fetch documents for a specific case with pagination
   */
  async getCaseDocuments(caseId: string): Promise<CaseDocument[]> {
    const documents: CaseDocument[] = [];
    let page = 1;
    const pageSize = 50;
    let hasMore = true;

    try {
      while (hasMore) {
        const response = await fetch(
          `${this.config.apiUrl}/cases/${caseId}/documents?page=${page}&limit=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`CasePeer API error: ${response.statusText}`);
        }

        const data = await response.json();
        const pageDocuments = this.transformCasePeerDocuments(
          data.documents || data
        );

        documents.push(...pageDocuments);

        hasMore = pageDocuments.length === pageSize && data.hasMore !== false;
        page++;

        if (hasMore) {
          await this.delay(300);
        }
      }

      return documents;
    } catch (error) {
      console.error(`Error fetching documents for case ${caseId}:`, error);
      return [];
    }
  }

  /**
   * Download document content (for AI analysis)
   */
  async downloadDocument(documentUrl: string): Promise<Buffer> {
    try {
      const response = await fetch(documentUrl, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download error: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/cases?limit=1`, {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: `API returned ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        message: 'Connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  /**
   * Transform CasePeer case data to our format
   */
  private transformCasePeerCase(data: any): Case {
    return {
      id: data.id || data.case_id || data.caseId,
      caseNumber: data.case_number || data.caseNumber || 'N/A',
      clientName: data.client_name || data.clientName || 'Unknown',
      caseType: this.normalizeCaseType(data.case_type || data.caseType),
      currentPhase: this.normalizePhase(data.current_phase || data.phase || data.status),
      dateOfIncident: new Date(data.incident_date || data.dateOfIncident || data.date_of_incident || Date.now()),
      dateOpened: new Date(data.opened_date || data.dateOpened || data.date_opened || Date.now()),
      assignedAttorney: data.attorney || data.assignedAttorney || data.assigned_attorney || 'Unassigned',
      documents: data.documents ? this.transformCasePeerDocuments(data.documents) : [],
    };
  }

  private transformCasePeerCases(data: any[]): Case[] {
    return data.map((item) => this.transformCasePeerCase(item));
  }

  private transformCasePeerDocuments(data: any[]): CaseDocument[] {
    return data.map((doc) => ({
      id: doc.id || doc.document_id || doc.documentId,
      fileName: doc.file_name || doc.fileName || doc.name || 'unknown.pdf',
      uploadDate: new Date(doc.upload_date || doc.uploadDate || doc.created_at || Date.now()),
      fileSize: doc.file_size || doc.fileSize || doc.size || 0,
      mimeType: doc.mime_type || doc.mimeType || doc.content_type || 'application/pdf',
      url: doc.url || doc.download_url || doc.file_url,
    }));
  }

  /**
   * Normalize case type to our enum
   */
  private normalizeCaseType(type: string): any {
    const typeMap: Record<string, string> = {
      'auto accident': 'auto_accident',
      'car accident': 'auto_accident',
      'motor vehicle': 'auto_accident',
      'premises liability': 'premises_liability',
      'slip and fall': 'premises_liability',
      'workers comp': 'workers_compensation',
      "worker's compensation": 'workers_compensation',
      'medical malpractice': 'medical_malpractice',
      'product liability': 'product_liability',
    };

    const normalized = type.toLowerCase().trim();
    return typeMap[normalized] || 'auto_accident';
  }

  /**
   * Normalize phase to our enum
   */
  private normalizePhase(phase: string): any {
    const phaseMap: Record<string, string> = {
      'new': 'intake',
      'intake': 'intake',
      'onboarding': 'intake',
      'treatment': 'treatment',
      'treating': 'treatment',
      'medical treatment': 'treatment',
      'demand': 'demand',
      'negotiation': 'demand',
      'pre-litigation': 'demand',
      'litigation': 'litigation',
      'suit filed': 'litigation',
      'discovery': 'litigation',
      'settlement': 'settlement',
      'settled': 'settlement',
      'closed': 'settlement',
    };

    const normalized = phase.toLowerCase().trim();
    return phaseMap[normalized] || 'intake';
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
