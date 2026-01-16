// Base CMS Adapter with shared functionality

import { Case, CaseDocument } from '@/types';
import { CMSAdapter, CMSConfig, CMSProvider, ConnectionTestResult } from './types';

/**
 * Abstract base class for CMS adapters
 * Provides common functionality and enforces interface
 */
export abstract class BaseCMSAdapter implements CMSAdapter {
  protected config: CMSConfig;
  abstract readonly provider: CMSProvider;

  constructor(config: CMSConfig) {
    this.config = config;
  }

  /**
   * Make an authenticated API request
   */
  protected async apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.apiUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...this.config.customHeaders,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get authentication headers for this adapter
   * Override in subclasses for different auth methods
   */
  protected getAuthHeaders(): HeadersInit {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
    };
  }

  /**
   * Test the API connection
   */
  abstract testConnection(): Promise<ConnectionTestResult>;

  /**
   * Fetch all cases
   */
  abstract getCases(): Promise<Case[]>;

  /**
   * Fetch a single case
   */
  abstract getCase(caseId: string): Promise<Case | null>;

  /**
   * Fetch documents for a case
   */
  abstract getDocuments(caseId: string): Promise<CaseDocument[]>;

  /**
   * Helper to safely parse dates
   */
  protected parseDate(value: any): Date {
    if (!value) return new Date();
    const date = new Date(value);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  /**
   * Helper to determine case phase from status/stage
   */
  protected mapPhase(status: string): Case['currentPhase'] {
    const statusLower = (status || '').toLowerCase();

    if (statusLower.includes('intake') || statusLower.includes('new') || statusLower.includes('open')) {
      return 'intake';
    }
    if (statusLower.includes('treatment') || statusLower.includes('medical') || statusLower.includes('discovery')) {
      return 'treatment';
    }
    if (statusLower.includes('demand') || statusLower.includes('negotiat')) {
      return 'demand';
    }
    if (statusLower.includes('litigation') || statusLower.includes('lawsuit') || statusLower.includes('filed')) {
      return 'litigation';
    }
    if (statusLower.includes('settlement') || statusLower.includes('settled') || statusLower.includes('closed')) {
      return 'settlement';
    }

    return 'intake'; // Default
  }

  /**
   * Helper to determine case type from description
   */
  protected mapCaseType(typeStr: string): Case['caseType'] {
    const typeLower = (typeStr || '').toLowerCase();

    if (typeLower.includes('auto') || typeLower.includes('car') || typeLower.includes('vehicle') || typeLower.includes('mva')) {
      return 'auto_accident';
    }
    if (typeLower.includes('premises') || typeLower.includes('slip') || typeLower.includes('fall') || typeLower.includes('property')) {
      return 'premises_liability';
    }
    if (typeLower.includes('medical') || typeLower.includes('malpractice') || typeLower.includes('doctor')) {
      return 'medical_malpractice';
    }
    if (typeLower.includes('product') || typeLower.includes('defect')) {
      return 'product_liability';
    }

    return 'other_pi';
  }
}
