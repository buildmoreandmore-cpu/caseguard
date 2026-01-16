// Clio CMS Adapter
// API Docs: https://app.clio.com/api/v4/documentation

import { Case, CaseDocument } from '@/types';
import { BaseCMSAdapter } from './base-adapter';
import { CMSConfig, CMSProvider, ConnectionTestResult } from './types';

/**
 * Clio API Adapter
 * Connects to Clio Manage's REST API
 */
export class ClioAdapter extends BaseCMSAdapter {
  readonly provider: CMSProvider = 'clio';

  constructor(config: CMSConfig) {
    super(config);
  }

  /**
   * Test connection to Clio
   */
  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const response = await this.apiRequest<any>('/matters?limit=1');

      return {
        success: true,
        message: 'Successfully connected to Clio',
        details: {
          casesFound: response.data?.length || 0,
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
   * Fetch all matters (cases) from Clio
   */
  async getCases(): Promise<Case[]> {
    try {
      // Clio uses "matters" for cases
      const response = await this.apiRequest<any>('/matters?limit=200&fields=id,display_number,client,description,status,practice_area,open_date,close_date,responsible_attorney');
      const matters = response.data || [];

      return matters.map((matter: any) => this.transformMatter(matter));
    } catch (error) {
      console.error('Error fetching Clio matters:', error);
      return [];
    }
  }

  /**
   * Fetch a single matter by ID
   */
  async getCase(caseId: string): Promise<Case | null> {
    try {
      const response = await this.apiRequest<any>(`/matters/${caseId}?fields=id,display_number,client,description,status,practice_area,open_date,close_date,responsible_attorney`);
      return this.transformMatter(response.data);
    } catch (error) {
      console.error(`Error fetching Clio matter ${caseId}:`, error);
      return null;
    }
  }

  /**
   * Fetch documents for a matter
   */
  async getDocuments(caseId: string): Promise<CaseDocument[]> {
    try {
      const response = await this.apiRequest<any>(`/documents?matter_id=${caseId}&limit=500&fields=id,name,created_at,size,content_type`);
      const docs = response.data || [];

      return docs.map((doc: any) => this.transformDocument(doc));
    } catch (error) {
      console.error(`Error fetching Clio documents for ${caseId}:`, error);
      return [];
    }
  }

  /**
   * Transform Clio matter to our Case type
   */
  private transformMatter(matter: any): Case {
    return {
      id: String(matter.id),
      caseNumber: matter.display_number || `CLIO-${matter.id}`,
      clientName: matter.client?.name || 'Unknown Client',
      caseType: this.mapCaseType(matter.practice_area?.name || matter.description || ''),
      currentPhase: this.mapPhase(matter.status || ''),
      dateOfIncident: this.parseDate(matter.open_date), // Clio doesn't have incident date by default
      dateOpened: this.parseDate(matter.open_date),
      assignedAttorney: matter.responsible_attorney?.name || 'Unassigned',
      documents: [],
    };
  }

  /**
   * Transform Clio document to our CaseDocument type
   */
  private transformDocument(doc: any): CaseDocument {
    return {
      id: String(doc.id),
      fileName: doc.name || 'Untitled',
      uploadDate: this.parseDate(doc.created_at),
      fileSize: doc.size || 0,
      mimeType: doc.content_type || 'application/octet-stream',
    };
  }
}
