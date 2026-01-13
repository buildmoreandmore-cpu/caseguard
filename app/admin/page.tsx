'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { ArrowLeft, Building2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';

interface Firm {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  casepeerApiUrl: string;
  active: boolean;
  createdAt: string;
  lastScannedAt?: string;
  _count?: {
    auditLogs: number;
  };
}

export default function AdminPage() {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactEmail: '',
    contactPhone: '',
    casepeerApiUrl: '',
    casepeerApiKey: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await fetch('/api/firms');
      const data = await response.json();
      setFirms(data.firms || []);
    } catch (error) {
      console.error('Error fetching firms:', error);
      setError('Failed to load firms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create firm');
      }

      setSuccess('Firm created successfully!');
      setFormData({
        name: '',
        contactEmail: '',
        contactPhone: '',
        casepeerApiUrl: '',
        casepeerApiKey: '',
      });
      setShowForm(false);
      fetchFirms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleDelete = async (firmId: string) => {
    if (!confirm('Are you sure you want to delete this firm? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/firms/${firmId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete firm');
      }

      setSuccess('Firm deleted successfully');
      fetchFirms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete firm');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo">
                <Button variant="outline" size="lg" className="gap-2 h-11 px-4">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Demo
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Firm Management</h1>
                <p className="text-sm text-slate-600 mt-0.5">Configure law firm integrations</p>
              </div>
            </div>

            {!showForm && (
              <Button
                size="lg"
                onClick={() => setShowForm(true)}
                className="gap-2 h-11 px-6"
              >
                <Plus className="w-4 h-4" />
                Add New Firm
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-emerald-300 bg-emerald-50">
            <AlertDescription className="text-emerald-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Add Firm Form */}
        {showForm && (
          <Card className="mb-8 border-2">
            <CardHeader>
              <CardTitle>Add New Firm</CardTitle>
              <CardDescription>
                Enter the law firm's details and CasePeer API credentials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Firm Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Smith & Associates"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      placeholder="contact@firmname.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="casepeerApiUrl">CasePeer API URL *</Label>
                    <Input
                      id="casepeerApiUrl"
                      value={formData.casepeerApiUrl}
                      onChange={(e) => setFormData({ ...formData, casepeerApiUrl: e.target.value })}
                      placeholder="https://api.casepeer.com/v1"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="casepeerApiKey">CasePeer API Key *</Label>
                  <div className="relative">
                    <Input
                      id="casepeerApiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.casepeerApiKey}
                      onChange={(e) => setFormData({ ...formData, casepeerApiKey: e.target.value })}
                      placeholder="Enter API key (will be encrypted)"
                      className="pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">
                    API key will be encrypted before storage using AES-256-GCM encryption
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Button type="submit" size="lg" className="h-11 px-6">
                    Create Firm
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setShowForm(false);
                      setFormData({
                        name: '',
                        contactEmail: '',
                        contactPhone: '',
                        casepeerApiUrl: '',
                        casepeerApiKey: '',
                      });
                    }}
                    className="h-11 px-6"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Firms List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">
            Configured Firms ({firms.length})
          </h2>

          {firms.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="text-center py-16">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-600 mb-2">No firms configured</p>
                <p className="text-sm text-slate-500 mb-6">
                  Add your first law firm to start scanning case files
                </p>
                <Button onClick={() => setShowForm(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add First Firm
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {firms.map((firm) => (
                <Card key={firm.id} className="border-2 hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-xl">{firm.name}</CardTitle>
                          <Badge variant={firm.active ? 'default' : 'secondary'}>
                            {firm.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {(firm.contactEmail || firm.contactPhone) && (
                          <CardDescription className="text-base">
                            {firm.contactEmail && <span>{firm.contactEmail}</span>}
                            {firm.contactEmail && firm.contactPhone && <span> • </span>}
                            {firm.contactPhone && <span>{firm.contactPhone}</span>}
                          </CardDescription>
                        )}
                      </div>

                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleDelete(firm.id)}
                        className="gap-2 h-11 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">API Endpoint:</span>
                        <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {firm.casepeerApiUrl}
                        </code>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Total Scans:</span>
                        <span>{firm._count?.auditLogs || 0}</span>
                      </div>
                      {firm.lastScannedAt && (
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Last Scan:</span>
                          <span>
                            {new Date(firm.lastScannedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Created:</span>
                        <span>
                          {new Date(firm.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
