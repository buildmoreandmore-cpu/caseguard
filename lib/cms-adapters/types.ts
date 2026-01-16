// Universal CMS Adapter Types

import { Case, CaseDocument } from '@/types';

/**
 * Supported Case Management Systems
 */
export type CMSProvider =
  | 'casepeer'
  | 'filevine'
  | 'clio'
  | 'mycase'
  | 'practicepanther'
  | 'smokeball'
  | 'custom';

/**
 * Configuration for connecting to a CMS
 */
export interface CMSConfig {
  provider: CMSProvider;
  apiUrl: string;
  apiKey: string;
  apiSecret?: string;  // Some APIs require key + secret
  orgId?: string;      // Filevine uses org ID
  customHeaders?: Record<string, string>;
  // Custom endpoint mappings for generic adapter
  endpoints?: {
    cases?: string;
    caseById?: string;
    documents?: string;
  };
}

/**
 * Result of testing a CMS connection
 */
export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: {
    casesFound?: number;
    apiVersion?: string;
    permissions?: string[];
  };
}

/**
 * Universal interface all CMS adapters must implement
 */
export interface CMSAdapter {
  /** Provider name for this adapter */
  readonly provider: CMSProvider;

  /** Test the API connection */
  testConnection(): Promise<ConnectionTestResult>;

  /** Fetch all cases from the CMS */
  getCases(): Promise<Case[]>;

  /** Fetch a single case by ID */
  getCase(caseId: string): Promise<Case | null>;

  /** Fetch documents for a specific case */
  getDocuments(caseId: string): Promise<CaseDocument[]>;
}

/**
 * Provider display information for UI
 */
export interface CMSProviderInfo {
  id: CMSProvider;
  name: string;
  description: string;
  logo?: string;
  docsUrl: string;
  fields: CMSConfigField[];
}

/**
 * Configuration field definition for UI
 */
export interface CMSConfigField {
  key: keyof CMSConfig | string;
  label: string;
  type: 'text' | 'password' | 'url';
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

/**
 * Registry of all supported CMS providers
 */
export const CMS_PROVIDERS: CMSProviderInfo[] = [
  {
    id: 'filevine',
    name: 'Filevine',
    description: 'Connect to your Filevine account to audit case documents',
    docsUrl: 'https://developer.filevine.io/docs/v2-us',
    fields: [
      { key: 'apiUrl', label: 'API URL', type: 'url', required: true, placeholder: 'https://api.filevine.io', helpText: 'Use api.filevine.ca for Canada' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Your Filevine API Key' },
      { key: 'apiSecret', label: 'API Secret', type: 'password', required: true, placeholder: 'Your Filevine API Secret' },
      { key: 'orgId', label: 'Organization ID', type: 'text', required: true, placeholder: 'Your Filevine Org ID' },
    ],
  },
  {
    id: 'casepeer',
    name: 'CasePeer',
    description: 'Connect to your CasePeer account for PI case management',
    docsUrl: 'https://www.casepeer.com/api',
    fields: [
      { key: 'apiUrl', label: 'API URL', type: 'url', required: true, placeholder: 'https://api.casepeer.com/v1' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Your CasePeer API Key' },
    ],
  },
  {
    id: 'clio',
    name: 'Clio',
    description: 'Connect to Clio Manage for comprehensive case management',
    docsUrl: 'https://app.clio.com/api/v4/documentation',
    fields: [
      { key: 'apiUrl', label: 'API URL', type: 'url', required: true, placeholder: 'https://app.clio.com/api/v4' },
      { key: 'apiKey', label: 'Access Token', type: 'password', required: true, placeholder: 'Your Clio Access Token' },
    ],
  },
  {
    id: 'mycase',
    name: 'MyCase',
    description: 'Connect to MyCase legal practice management',
    docsUrl: 'https://www.mycase.com/api',
    fields: [
      { key: 'apiUrl', label: 'API URL', type: 'url', required: true, placeholder: 'https://api.mycase.com/v2' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Your MyCase API Key' },
    ],
  },
  {
    id: 'practicepanther',
    name: 'PracticePanther',
    description: 'Connect to PracticePanther law practice software',
    docsUrl: 'https://www.practicepanther.com/api',
    fields: [
      { key: 'apiUrl', label: 'API URL', type: 'url', required: true, placeholder: 'https://api.practicepanther.com' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Your PracticePanther API Key' },
    ],
  },
  {
    id: 'smokeball',
    name: 'Smokeball',
    description: 'Connect to Smokeball legal practice management',
    docsUrl: 'https://developer.smokeball.com',
    fields: [
      { key: 'apiUrl', label: 'API URL', type: 'url', required: true, placeholder: 'https://api.smokeball.com' },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true, placeholder: 'Your Smokeball API Key' },
    ],
  },
  {
    id: 'custom',
    name: 'Custom API',
    description: 'Connect to any case management system with a REST API',
    docsUrl: '',
    fields: [
      { key: 'apiUrl', label: 'Base API URL', type: 'url', required: true, placeholder: 'https://your-cms.com/api' },
      { key: 'apiKey', label: 'API Key / Token', type: 'password', required: true, placeholder: 'Your API authentication token' },
      { key: 'endpoints.cases', label: 'Cases Endpoint', type: 'text', required: true, placeholder: '/cases', helpText: 'Endpoint to list all cases' },
      { key: 'endpoints.caseById', label: 'Case by ID Endpoint', type: 'text', required: true, placeholder: '/cases/{id}', helpText: 'Use {id} as placeholder' },
      { key: 'endpoints.documents', label: 'Documents Endpoint', type: 'text', required: true, placeholder: '/cases/{caseId}/documents', helpText: 'Use {caseId} as placeholder' },
    ],
  },
];
