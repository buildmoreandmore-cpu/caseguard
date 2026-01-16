'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Scale, Building2, AlertTriangle, CheckCircle2, Plus, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AddFirmModal } from '@/components/AddFirmModal';

interface FirmStats {
  firmId: string;
  firmName: string;
  active: boolean;
  lastScannedAt: string | null;
  latestScan: {
    casesScanned: number;
    criticalMissing: number;
    requiredMissing: number;
    averageScore: number;
  } | null;
}

// Demo data for when database is not connected
function getDemoFirms() {
  return [
    {
      id: 'demo-firm-1',
      name: 'Anderson & Associates',
      contactEmail: 'admin@andersonlaw.com',
      contactPhone: '(555) 123-4567',
      cmsProvider: 'filevine',
      cmsApiUrl: 'https://api.filevine.io',
      active: true,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      lastScannedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      _count: { auditLogs: 12 }
    }
  ];
}

function getDemoStats(): Record<string, FirmStats> {
  return {
    'demo-firm-1': {
      firmId: 'demo-firm-1',
      firmName: 'Anderson & Associates',
      active: true,
      lastScannedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      latestScan: {
        casesScanned: 47,
        criticalMissing: 12,
        requiredMissing: 23,
        averageScore: 78
      }
    }
  };
}

export default function DemoPage() {
  const router = useRouter();
  const [firms, setFirms] = useState<any[]>([]);
  const [firmStats, setFirmStats] = useState<Record<string, FirmStats>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await fetch('/api/firms');
      const data = await response.json();

      // Check if we should use demo data
      const shouldUseDemoData =
        !response.ok ||
        data.error ||
        !Array.isArray(data) ||
        data.length === 0;

      if (shouldUseDemoData) {
        console.log('Using demo firms (no database or empty)');
        setFirms(getDemoFirms());
        setFirmStats(getDemoStats());
        setLoading(false);
        return;
      }

      setFirms(Array.isArray(data) ? data : []);

      // Fetch stats for each firm
      const statsPromises = (Array.isArray(data) ? data : []).map(async (firm: any) => {
        try {
          const statsResponse = await fetch(`/api/firms/${firm.id}/stats`);
          const statsData = await statsResponse.json();
          return { firmId: firm.id, stats: statsData };
        } catch (error) {
          console.error(`Error fetching stats for firm ${firm.id}:`, error);
          return { firmId: firm.id, stats: null };
        }
      });

      const statsResults = await Promise.all(statsPromises);
      const statsMap: Record<string, FirmStats> = {};
      statsResults.forEach(({ firmId, stats }) => {
        if (stats) {
          statsMap[firmId] = stats;
        }
      });

      setFirmStats(statsMap);
    } catch (error) {
      console.error('Error fetching firms:', error);
      // Fallback to demo data on error
      setFirms(getDemoFirms());
      setFirmStats(getDemoStats());
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = (firmId: string) => {
    router.push(`/firms/${firmId}`);
  };

  const displayedFirms = showInactive
    ? firms
    : firms.filter(f => f.active);

  const activeFirms = firms.filter(f => f.active).length;
  const totalIssues = Object.values(firmStats).reduce(
    (sum, stats) => sum + (stats.latestScan?.criticalMissing || 0) + (stats.latestScan?.requiredMissing || 0),
    0
  );
  const avgScore = Object.values(firmStats).length > 0
    ? Math.round(
        Object.values(firmStats).reduce((sum, stats) => sum + (stats.latestScan?.averageScore || 0), 0) /
          Object.values(firmStats).length
      )
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-base">Loading demo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <Scale className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">CaseGuard</h1>
                <p className="text-sm text-slate-600 mt-0.5">Multi-Firm Document Audit System</p>
              </div>
            </div>

            <Link href="/">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 h-11 px-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {/* Cases Scanned Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardDescription className="text-sm font-medium text-slate-500">Cases Scanned</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">
                {Object.values(firmStats).reduce((sum, stats) => sum + (stats.latestScan?.casesScanned || 0), 0)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">From connected CMS</p>
            </CardContent>
          </Card>

          {/* Documents Analyzed Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardDescription className="text-sm font-medium text-slate-500">Documents Analyzed</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">1,284</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">AI-classified files</p>
            </CardContent>
          </Card>

          {/* Issues Found Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardDescription className="text-sm font-medium text-slate-500">Missing Documents</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">{totalIssues}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">Identified gaps</p>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <CardDescription className="text-sm font-medium text-slate-500">Average Score</CardDescription>
              <CardTitle className="text-4xl font-bold text-slate-900">{avgScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500">File completeness</p>
            </CardContent>
          </Card>
        </div>

        {/* Scan Status Banner */}
        <Card className="border shadow-sm mb-8 bg-slate-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-slate-900 rounded-full"></div>
                <span className="font-medium text-slate-900">Last scan completed successfully</span>
                <span className="text-slate-500">• 1 hour ago</span>
              </div>
              <Badge variant="outline" className="text-slate-700">Filevine Connected</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Firm Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Connected Firm</h2>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAddModal(true)}
              className="gap-2 h-10 px-4"
            >
              <Plus className="w-4 h-4" />
              Add Firm
            </Button>
          </div>

          {displayedFirms.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="text-center py-16">
                <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-600 mb-2">No firms configured</p>
                <p className="text-sm text-slate-500 mb-6">Add your first law firm to start scanning case files</p>
                <Button
                  size="lg"
                  onClick={() => setShowAddModal(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Your First Firm
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayedFirms.map(firm => {
                const stats = firmStats[firm.id];

                return (
                  <Link key={firm.id} href={`/firms/${firm.id}`}>
                    <Card className="border hover:shadow-md transition-all cursor-pointer">
                      <CardContent className="py-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-6 h-6 text-slate-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">{firm.name}</h3>
                              <p className="text-sm text-slate-500">
                                {stats?.latestScan ? `${stats.latestScan.casesScanned} cases • 1,284 documents analyzed` : 'No scans yet'}
                              </p>
                            </div>
                          </div>

                          {stats?.latestScan && (
                            <div className="flex items-center gap-8 text-sm">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{Math.round(stats.latestScan.averageScore)}%</div>
                                <div className="text-slate-500">Avg Score</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{stats.latestScan.criticalMissing}</div>
                                <div className="text-slate-500">Critical</div>
                              </div>
                              <div className="text-center">
                                <div className="text-2xl font-bold text-slate-900">{stats.latestScan.requiredMissing}</div>
                                <div className="text-slate-500">Required</div>
                              </div>
                              <Button variant="outline" className="ml-4">
                                View Cases
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add Firm Modal */}
      <AddFirmModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
