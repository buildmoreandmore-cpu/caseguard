// Filevine CMS Adapter
// API Docs: https://developer.filevine.io/docs/v2-us

import { Case, CaseDocument } from '@/types';
import { BaseCMSAdapter } from './base-adapter';
import { CMSConfig, CMSProvider, ConnectionTestResult } from './types';

/**
 * Filevine API Adapter
 * Connects to Filevine's REST API to fetch projects (cases) and documents
 */
export class FilevineAdapter extends BaseCMSAdapter {
  readonly provider: CMSProvider = 'filevine';

  constructor(config: CMSConfig) {
    super(config);
  }

  /**
   * Filevine uses a specific auth header format
   */
  protected getAuthHeaders(): HeadersInit {
    // Filevine API v2 uses x-fv-apikey and x-fv-apisecret headers
    // Or Bearer token depending on auth method
    if (this.config.apiSecret) {
      return {
        'x-fv-apikey': this.config.apiKey,
        'x-fv-apisecret': this.config.apiSecret,
        'x-fv-orgid': this.config.orgId || '',
      };
    }
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'x-fv-orgid': this.config.orgId || '',
    };
  }

  /**
   * Test connection to Filevine
   */
  async testConnection(): Promise<ConnectionTestResult> {
    try {
      // Try to fetch a limited set of projects to verify connection
      const response = await this.apiRequest<any>('/core/projects?limit=1');

      return {
        success: true,
        message: 'Successfully connected to Filevine',
        details: {
          casesFound: response.count || response.items?.length || 0,
          apiVersion: 'v2',
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
   * Fetch all projects (cases) from Filevine
   */
  async getCases(): Promise<Case[]> {
    try {
      // Filevine uses /core/projects for cases
      const response = await this.apiRequest<any>('/core/projects?limit=100');
      const projects = response.items || response.data || response || [];

      return projects.map((project: any) => this.transformProject(project));
    } catch (error) {
      console.error('Error fetching Filevine projects:', error);
      return [];
    }
  }

  /**
   * Fetch a single project by ID
   */
  async getCase(caseId: string): Promise<Case | null> {
    try {
      const project = await this.apiRequest<any>(`/core/projects/${caseId}`);
      return this.transformProject(project);
    } catch (error) {
      console.error(`Error fetching Filevine project ${caseId}:`, error);
      return null;
    }
  }

  /**
   * Fetch documents for a project
   */
  async getDocuments(caseId: string): Promise<CaseDocument[]> {
    try {
      // Filevine documents endpoint
      const response = await this.apiRequest<any>(`/core/projects/${caseId}/documents?limit=500`);
      const docs = response.items || response.data || response || [];

      return docs.map((doc: any) => this.transformDocument(doc));
    } catch (error) {
      console.error(`Error fetching Filevine documents for ${caseId}:`, error);
      return [];
    }
  }

  /**
   * Transform Filevine project to our Case type
   */
  private transformProject(project: any): Case {
    // Filevine project structure varies, handle common field names
    const clientName = project.clientName
      || project.client?.name
      || project.contacts?.[0]?.name
      || project.projectName
      || 'Unknown Client';

    return {
      id: String(project.projectId || project.id),
      caseNumber: project.caseNumber || project.projectNumber || project.fileNumber || `FV-${project.projectId || project.id}`,
      clientName,
      caseType: this.mapCaseType(project.projectType?.name || project.caseType || project.practiceArea || ''),
      currentPhase: this.mapPhase(project.phase?.name || project.status || project.stage || ''),
      dateOfIncident: this.parseDate(project.incidentDate || project.dateOfLoss || project.dateOfIncident),
      dateOpened: this.parseDate(project.createdAt || project.dateOpened || project.openedDate),
      assignedAttorney: project.assignedAttorney?.name || project.attorney || project.leadAttorney || 'Unassigned',
      documents: [], // Documents fetched separately
    };
  }

  /**
   * Transform Filevine document to our CaseDocument type
   */
  private transformDocument(doc: any): CaseDocument {
    return {
      id: String(doc.documentId || doc.id),
      fileName: doc.filename || doc.fileName || doc.name || 'Untitled',
      uploadDate: this.parseDate(doc.createdAt || doc.uploadDate || doc.dateCreated),
      fileSize: doc.size || doc.fileSize || 0,
      mimeType: doc.mimeType || doc.contentType || 'application/octet-stream',
      url: doc.downloadUrl || doc.url,
    };
  }
}
