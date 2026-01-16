// CMS Adapter Factory
// Creates the appropriate adapter based on provider type

import { CMSAdapter, CMSConfig, CMSProvider } from './types';
import { FilevineAdapter } from './filevine-adapter';
import { CasePeerAdapter } from './casepeer-adapter';
import { ClioAdapter } from './clio-adapter';
import { CustomAdapter } from './custom-adapter';

/**
 * Factory function to create the appropriate CMS adapter
 */
export function createCMSAdapter(config: CMSConfig): CMSAdapter {
  switch (config.provider) {
    case 'filevine':
      return new FilevineAdapter(config);

    case 'casepeer':
      return new CasePeerAdapter(config);

    case 'clio':
      return new ClioAdapter(config);

    case 'mycase':
    case 'practicepanther':
    case 'smokeball':
      // These use similar REST patterns, use custom adapter with provider-specific defaults
      return new CustomAdapter({
        ...config,
        endpoints: getDefaultEndpoints(config.provider),
      });

    case 'custom':
    default:
      return new CustomAdapter(config);
  }
}

/**
 * Get default endpoint configurations for known providers
 */
function getDefaultEndpoints(provider: CMSProvider): CMSConfig['endpoints'] {
  switch (provider) {
    case 'mycase':
      return {
        cases: '/cases',
        caseById: '/cases/{id}',
        documents: '/cases/{caseId}/documents',
      };

    case 'practicepanther':
      return {
        cases: '/matters',
        caseById: '/matters/{id}',
        documents: '/matters/{caseId}/documents',
      };

    case 'smokeball':
      return {
        cases: '/matters',
        caseById: '/matters/{id}',
        documents: '/matters/{caseId}/files',
      };

    default:
      return {
        cases: '/cases',
        caseById: '/cases/{id}',
        documents: '/cases/{caseId}/documents',
      };
  }
}

/**
 * Create adapter from firm database record
 */
export function createAdapterFromFirm(firm: {
  cmsProvider: string;
  cmsApiUrl: string;
  cmsApiKey: string;
  cmsApiSecret?: string | null;
  cmsOrgId?: string | null;
  cmsEndpoints?: any;
}): CMSAdapter {
  const config: CMSConfig = {
    provider: (firm.cmsProvider || 'custom') as CMSProvider,
    apiUrl: firm.cmsApiUrl,
    apiKey: firm.cmsApiKey,
    apiSecret: firm.cmsApiSecret || undefined,
    orgId: firm.cmsOrgId || undefined,
    endpoints: firm.cmsEndpoints || undefined,
  };

  return createCMSAdapter(config);
}

/**
 * Test if a CMS configuration is valid
 */
export async function testCMSConnection(config: CMSConfig): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const adapter = createCMSAdapter(config);
    return await adapter.testConnection();
  } catch (error) {
    return {
      success: false,
      message: `Failed to create adapter: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
