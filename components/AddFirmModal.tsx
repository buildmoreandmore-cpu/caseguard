'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, ChevronDown, ExternalLink } from 'lucide-react';
import { CMS_PROVIDERS, CMSProvider, CMSProviderInfo } from '@/lib/cms-adapters/types';

interface AddFirmModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (firmId: string) => void;
}

export function AddFirmModal({ open, onClose, onSuccess }: AddFirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [scanOnAdd, setScanOnAdd] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<CMSProviderInfo | null>(null);
  const [showProviderSelect, setShowProviderSelect] = useState(false);

  const [formData, setFormData] = useState<Record<string, string>>({
    name: '',
    contactEmail: '',
    contactPhone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setTestResult(null);
  };

  const handleProviderSelect = (provider: CMSProviderInfo) => {
    setSelectedProvider(provider);
    setShowProviderSelect(false);
    setTestResult(null);

    // Set default API URL if available
    const defaultUrls: Record<string, string> = {
      filevine: 'https://api.filevine.io',
      casepeer: 'https://api.casepeer.com/v1',
      clio: 'https://app.clio.com/api/v4',
    };

    if (defaultUrls[provider.id]) {
      setFormData(prev => ({ ...prev, apiUrl: defaultUrls[provider.id] }));
    }
  };

  const handleTestConnection = async () => {
    if (!selectedProvider) return;

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider.id,
          apiUrl: formData.apiUrl,
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret,
          orgId: formData.orgId,
          endpoints: selectedProvider.id === 'custom' ? {
            cases: formData['endpoints.cases'],
            caseById: formData['endpoints.caseById'],
            documents: formData['endpoints.documents'],
          } : undefined,
        }),
      });

      const data = await response.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? 'Connection successful!' : 'Connection failed'),
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test connection',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider) return;

    setLoading(true);

    try {
      const response = await fetch('/api/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
          cmsProvider: selectedProvider.id,
          cmsApiUrl: formData.apiUrl,
          cmsApiKey: formData.apiKey,
          cmsApiSecret: formData.apiSecret,
          cmsOrgId: formData.orgId,
          cmsEndpoints: selectedProvider.id === 'custom' ? {
            cases: formData['endpoints.cases'],
            caseById: formData['endpoints.caseById'],
            documents: formData['endpoints.documents'],
          } : undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create firm');
      }

      const firm = await response.json();

      if (scanOnAdd) {
        await fetch('/api/scan/firm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firmId: firm.id }),
        });
      }

      // Reset form
      setFormData({ name: '', contactEmail: '', contactPhone: '' });
      setSelectedProvider(null);
      setTestResult(null);
      setScanOnAdd(false);
      onSuccess(firm.id);
      onClose();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to create firm');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    if (!formData.name || !selectedProvider) return false;

    // Check all required fields for selected provider
    for (const field of selectedProvider.fields) {
      if (field.required && !formData[field.key]) {
        return false;
      }
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Firm</DialogTitle>
          <DialogDescription>
            Connect a law firm's case management system to audit their case files for missing documents.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Firm Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Firm Information</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Firm Name *</Label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Smith & Associates Law Firm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@firm.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </div>

          {/* CMS Selection */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-slate-900">Case Management System</h3>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProviderSelect(!showProviderSelect)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl flex items-center justify-between hover:border-blue-300 transition-colors bg-white"
              >
                {selectedProvider ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {selectedProvider.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-slate-900">{selectedProvider.name}</p>
                      <p className="text-sm text-slate-500">{selectedProvider.description}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500">Select your case management software...</span>
                )}
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showProviderSelect ? 'rotate-180' : ''}`} />
              </button>

              {showProviderSelect && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-xl overflow-hidden">
                  {CMS_PROVIDERS.map((provider) => (
                    <button
                      key={provider.id}
                      type="button"
                      onClick={() => handleProviderSelect(provider)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left border-b last:border-b-0"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center">
                        <span className="font-bold text-sm text-slate-600">
                          {provider.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{provider.name}</p>
                        <p className="text-sm text-slate-500">{provider.description}</p>
                      </div>
                      {provider.id === 'custom' && (
                        <Badge variant="outline" className="text-xs">Any API</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dynamic CMS Fields */}
          {selectedProvider && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{selectedProvider.name} Configuration</h3>
                {selectedProvider.docsUrl && (
                  <a
                    href={selectedProvider.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    API Docs <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {selectedProvider.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label} {field.required && '*'}
                  </Label>
                  <input
                    id={field.key}
                    name={field.key}
                    type={field.type}
                    required={field.required}
                    value={formData[field.key] || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={field.placeholder}
                  />
                  {field.helpText && (
                    <p className="text-xs text-slate-500">{field.helpText}</p>
                  )}
                </div>
              ))}

              {/* Test Connection */}
              <div className="flex items-center gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={!formData.apiUrl || !formData.apiKey || testing}
                  className="gap-2"
                >
                  {testing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>

                {testResult && (
                  <div className={`flex items-center gap-2 text-sm ${testResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Options */}
          <div className="flex items-center space-x-2 pt-4 border-t">
            <input
              id="scanOnAdd"
              type="checkbox"
              checked={scanOnAdd}
              onChange={(e) => setScanOnAdd(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="scanOnAdd" className="text-sm text-slate-600">
              Scan all cases immediately after adding firm
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !isFormValid()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {scanOnAdd ? 'Adding & Scanning...' : 'Adding...'}
                </>
              ) : (
                scanOnAdd ? 'Add & Scan Now' : 'Add Firm'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
