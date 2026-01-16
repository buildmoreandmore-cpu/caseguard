// Custom/Generic CMS Adapter
// Works with any REST API that exposes cases and documents

import { Case, CaseDocument } from '@/types';
import { BaseCMSAdapter } from './base-adapter';
import { CMSConfig, CMSProvider, ConnectionTestResult } from './types';

/**
 * Custom API Adapter
 * Connects to any case management system with configurable endpoints
 *
 * Expected API Response Formats:
 *
 * Cases endpoint should return array of objects with fields like:
 * - id, caseId, case_id
 * - caseNumber, case_number, number
 * - clientName, client_name, client.name
 * - status, phase, stage
 * - dateOpened, opened_date, created_at
 *
 * Documents endpoint should return array of objects with fields like:
 * - id, documentId, document_id
 * - fileName, file_name, name
 * - uploadDate, upload_date, created_at
 * - fileSize, file_size, size
 * - mimeType, mime_type, content_type
 */
export class CustomAdapter extends BaseCMSAdapter {
  readonly provider: CMSProvider = 'custom';

  constructor(config: CMSConfig) {
    super(config);

    // Set default endpoints if not provided
    if (!this.config.endpoints) {
      this.config.endpoints = {
        cases: '/cases',
        caseById: '/cases/{id}',
        documents: '/cases/{caseId}/documents',
      };
    }
  }

  /**
   * Test connection to the custom API
   */
  async testConnection(): Promise<ConnectionTestResult> {
    try {
      const endpoint = this.config.endpoints?.cases || '/cases';
      const response = await this.apiRequest<any>(endpoint + '?limit=1');

      // Handle both array and object responses
      const data = Array.isArray(response) ? response : (response.data || response.items || response.results || []);

      return {
        success: true,
        message: 'Successfully connected to API',
        details: {
          casesFound: data.length,
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
   * Fetch all cases from the API
   */
  async getCases(): Promise<Case[]> {
    try {
      const endpoint = this.config.endpoints?.cases || '/cases';
      const response = await this.apiRequest<any>(endpoint);

      // Handle various response formats
      const data = Array.isArray(response)
        ? response
        : (response.data || response.items || response.results || response.cases || []);

      return data.map((item: any) => this.transformCase(item));
    } catch (error) {
      console.error('Error fetching cases from custom API:', error);
      return [];
    }
  }

  /**
   * Fetch a single case by ID
   */
  async getCase(caseId: string): Promise<Case | null> {
    try {
      const endpointTemplate = this.config.endpoints?.caseById || '/cases/{id}';
      const endpoint = endpointTemplate.replace('{id}', caseId);

      const response = await this.apiRequest<any>(endpoint);
      const data = response.data || response;

      return this.transformCase(data);
    } catch (error) {
      console.error(`Error fetching case ${caseId} from custom API:`, error);
      return null;
    }
  }

  /**
   * Fetch documents for a case
   */
  async getDocuments(caseId: string): Promise<CaseDocument[]> {
    try {
      const endpointTemplate = this.config.endpoints?.documents || '/cases/{caseId}/documents';
      const endpoint = endpointTemplate.replace('{caseId}', caseId).replace('{id}', caseId);

      const response = await this.apiRequest<any>(endpoint);

      // Handle various response formats
      const data = Array.isArray(response)
        ? response
        : (response.data || response.items || response.results || response.documents || []);

      return data.map((doc: any) => this.transformDocument(doc));
    } catch (error) {
      console.error(`Error fetching documents for case ${caseId}:`, error);
      return [];
    }
  }

  /**
   * Transform API response to our Case type
   * Handles various common field naming conventions
   */
  private transformCase(data: any): Case {
    // Extract ID from various possible field names
    const id = data.id || data.caseId || data.case_id || data.projectId || data.matterId || '';

    // Extract case number
    const caseNumber = data.caseNumber || data.case_number || data.number ||
                       data.fileNumber || data.file_number || data.display_number ||
                       `CASE-${id}`;

    // Extract client name from various structures
    const clientName = data.clientName || data.client_name ||
                       data.client?.name || data.contact?.name ||
                       data.plaintiff || data.claimant || 'Unknown Client';

    // Extract status/phase
    const status = data.status || data.phase || data.stage ||
                   data.currentPhase || data.current_phase || '';

    // Extract case type
    const caseType = data.caseType || data.case_type || data.type ||
                     data.practiceArea || data.practice_area ||
                     data.category || '';

    // Extract dates
    const dateOpened = data.dateOpened || data.date_opened || data.openedDate ||
                       data.opened_date || data.createdAt || data.created_at ||
                       data.openDate || data.open_date;

    const dateOfIncident = data.dateOfIncident || data.date_of_incident ||
                           data.incidentDate || data.incident_date ||
                           data.dateOfLoss || data.date_of_loss ||
                           data.accidentDate || dateOpened;

    // Extract attorney
    const attorney = data.assignedAttorney || data.assigned_attorney ||
                     data.attorney || data.responsibleAttorney ||
                     data.responsible_attorney?.name || data.attorney?.name ||
                     data.leadAttorney || 'Unassigned';

    return {
      id: String(id),
      caseNumber: String(caseNumber),
      clientName: String(clientName),
      caseType: this.mapCaseType(caseType),
      currentPhase: this.mapPhase(status),
      dateOfIncident: this.parseDate(dateOfIncident),
      dateOpened: this.parseDate(dateOpened),
      assignedAttorney: String(attorney),
      documents: [],
    };
  }

  /**
   * Transform API response to our CaseDocument type
   * Handles various common field naming conventions
   */
  private transformDocument(doc: any): CaseDocument {
    // Extract ID
    const id = doc.id || doc.documentId || doc.document_id || doc.fileId || doc.file_id || '';

    // Extract filename
    const fileName = doc.fileName || doc.file_name || doc.filename ||
                     doc.name || doc.title || 'Untitled';

    // Extract upload date
    const uploadDate = doc.uploadDate || doc.upload_date || doc.uploadedAt ||
                       doc.createdAt || doc.created_at || doc.dateCreated ||
                       doc.date_created;

    // Extract file size
    const fileSize = doc.fileSize || doc.file_size || doc.size ||
                     doc.bytes || doc.contentLength || 0;

    // Extract mime type
    const mimeType = doc.mimeType || doc.mime_type || doc.contentType ||
                     doc.content_type || doc.type || 'application/octet-stream';

    // Extract URL
    const url = doc.url || doc.downloadUrl || doc.download_url ||
                doc.fileUrl || doc.file_url;

    return {
      id: String(id),
      fileName: String(fileName),
      uploadDate: this.parseDate(uploadDate),
      fileSize: Number(fileSize) || 0,
      mimeType: String(mimeType),
      url: url ? String(url) : undefined,
    };
  }
}
