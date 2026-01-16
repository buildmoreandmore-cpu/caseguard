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
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">CaseGuard</h1>
                <p className="text-xs sm:text-sm text-slate-600 hidden sm:block">Document Audit System</p>
              </div>
            </div>

            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 h-9 px-3 sm:h-10 sm:px-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
          {/* Cases Scanned Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">Cases Scanned</CardDescription>
              <CardTitle className="text-2xl sm:text-4xl font-bold text-slate-900">
                {Object.values(firmStats).reduce((sum, stats) => sum + (stats.latestScan?.casesScanned || 0), 0)}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs sm:text-sm text-slate-500">From CMS</p>
            </CardContent>
          </Card>

          {/* Documents Analyzed Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">Documents</CardDescription>
              <CardTitle className="text-2xl sm:text-4xl font-bold text-slate-900">1,284</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs sm:text-sm text-slate-500">AI-classified</p>
            </CardContent>
          </Card>

          {/* Issues Found Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">Missing</CardDescription>
              <CardTitle className="text-2xl sm:text-4xl font-bold text-slate-900">{totalIssues}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs sm:text-sm text-slate-500">Gaps found</p>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">Avg Score</CardDescription>
              <CardTitle className="text-2xl sm:text-4xl font-bold text-slate-900">{avgScore}%</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs sm:text-sm text-slate-500">Completeness</p>
            </CardContent>
          </Card>
        </div>

        {/* Scan Status Banner */}
        <Card className="border shadow-sm mb-6 sm:mb-8 bg-slate-50">
          <CardContent className="py-3 sm:py-4 px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-slate-900 rounded-full"></div>
                <span className="text-sm sm:text-base font-medium text-slate-900">Scan completed</span>
                <span className="text-xs sm:text-sm text-slate-500">• 1 hour ago</span>
              </div>
              <Badge variant="outline" className="text-slate-700 text-xs sm:text-sm w-fit">Filevine</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Firm Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Connected Firm</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              className="gap-1.5 h-9 px-3 sm:h-10 sm:px-4"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Firm</span>
            </Button>
          </div>

          {displayedFirms.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="text-center py-12 sm:py-16 px-4">
                <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-base sm:text-lg text-slate-600 mb-2">No firms configured</p>
                <p className="text-sm text-slate-500 mb-6">Add your first law firm to start scanning</p>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Firm
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
                      <CardContent className="p-4 sm:py-6 sm:px-6">
                        {/* Mobile Layout */}
                        <div className="sm:hidden">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="w-5 h-5 text-slate-600" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base font-semibold text-slate-900 truncate">{firm.name}</h3>
                              <p className="text-xs text-slate-500">
                                {stats?.latestScan ? `${stats.latestScan.casesScanned} cases • 1,284 docs` : 'No scans yet'}
                              </p>
                            </div>
                          </div>
                          {stats?.latestScan && (
                            <>
                              <div className="grid grid-cols-3 gap-2 mb-4">
                                <div className="text-center p-2 bg-slate-50 rounded-lg">
                                  <div className="text-lg font-bold text-slate-900">{Math.round(stats.latestScan.averageScore)}%</div>
                                  <div className="text-xs text-slate-500">Score</div>
                                </div>
                                <div className="text-center p-2 bg-slate-50 rounded-lg">
                                  <div className="text-lg font-bold text-slate-900">{stats.latestScan.criticalMissing}</div>
                                  <div className="text-xs text-slate-500">Critical</div>
                                </div>
                                <div className="text-center p-2 bg-slate-50 rounded-lg">
                                  <div className="text-lg font-bold text-slate-900">{stats.latestScan.requiredMissing}</div>
                                  <div className="text-xs text-slate-500">Required</div>
                                </div>
                              </div>
                              <Button variant="outline" className="w-full" size="sm">
                                View Cases
                              </Button>
                            </>
                          )}
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex sm:items-center sm:justify-between">
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
