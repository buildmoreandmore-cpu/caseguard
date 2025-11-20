'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    casepeerApiUrl: '',
    casepeerApiKey: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setTestResult(null); // Clear test result when form changes
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/test-casepeer-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiUrl: formData.casepeerApiUrl,
          apiKey: formData.casepeerApiKey,
        }),
      });

      const data = await response.json();
      setTestResult({
        success: response.ok,
        message: data.message || data.error || 'Unknown result',
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
    setLoading(true);

    try {
      // Create firm
      const response = await fetch('/api/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create firm');
      }

      const firm = await response.json();

      // If scan on add is enabled, trigger bulk scan
      if (scanOnAdd) {
        await fetch('/api/scan/firm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firmId: firm.id }),
        });
      }

      // Reset form and close
      setFormData({
        name: '',
        contactEmail: '',
        contactPhone: '',
        casepeerApiUrl: '',
        casepeerApiKey: '',
      });
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Firm</DialogTitle>
          <DialogDescription>
            Configure a new law firm's CasePeer integration to scan their case files.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Firm Name *</Label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="casepeerApiUrl">CasePeer API URL *</Label>
            <input
              id="casepeerApiUrl"
              name="casepeerApiUrl"
              type="url"
              required
              value={formData.casepeerApiUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="https://api.casepeer.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="casepeerApiKey">CasePeer API Key *</Label>
            <input
              id="casepeerApiKey"
              name="casepeerApiKey"
              type="password"
              required
              value={formData.casepeerApiKey}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter API key (encrypted before storage)"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleTestConnection}
              disabled={!formData.casepeerApiUrl || !formData.casepeerApiKey || testing}
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Connection'
              )}
            </Button>

            {testResult && (
              <span className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.message}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 pt-2 border-t">
            <input
              id="scanOnAdd"
              type="checkbox"
              checked={scanOnAdd}
              onChange={(e) => setScanOnAdd(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <Label htmlFor="scanOnAdd" className="text-sm text-gray-600">
              Scan all cases immediately after adding firm
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
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
