'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Scale, Building2, AlertTriangle, CheckCircle2, LogOut, Plus, Eye, EyeOff } from 'lucide-react';
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

export default function DashboardPage() {
  const router = useRouter();
  const [firms, setFirms] = useState<any[]>([]);
  const [firmStats, setFirmStats] = useState<Record<string, FirmStats>>({});
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (!data.isAuthenticated) {
        router.push('/login');
        return;
      }

      fetchFirms();
    } catch (error) {
      router.push('/login');
    } finally {
      setChecking(false);
    }
  };

  const fetchFirms = async () => {
    try {
      const response = await fetch('/api/firms');
      const data = await response.json();

      setFirms(data);

      // Fetch stats for each firm
      const statsPromises = data.map(async (firm: any) => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleAddSuccess = (firmId: string) => {
    // Redirect to the new firm's detail page
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

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-base">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-base">Loading firms...</p>
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

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm px-3 py-1.5 font-medium">
                {process.env.NEXT_PUBLIC_CASEPEER_ENABLED === 'true' ? '🟢 Live' : '🟡 Demo Mode'}
              </Badge>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLogout}
                className="gap-2 h-11 px-4 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Active Firms Card */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Active Firms</CardDescription>
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-5xl font-bold text-slate-900">{activeFirms}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {firms.length - activeFirms > 0 && (
                  <span className="text-slate-500">
                    {firms.length - activeFirms} inactive {firms.length - activeFirms === 1 ? 'firm' : 'firms'}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Issues Found Card */}
          <Card className={`border-2 shadow-sm hover:shadow-md transition-shadow ${
            totalIssues > 0 ? 'border-red-300 bg-red-50/30' : ''
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Total Issues Found</CardDescription>
                <AlertTriangle className={`w-5 h-5 ${totalIssues > 0 ? 'text-red-600' : 'text-slate-400'}`} />
              </div>
              <CardTitle className="text-5xl font-bold text-slate-900">{totalIssues}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 font-medium">
                {totalIssues > 0 ? (
                  <span className="text-red-600">Across all firms</span>
                ) : (
                  <span className="text-emerald-600">All cases are compliant</span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow border-emerald-300 bg-emerald-50/30">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Average Score</CardDescription>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-5xl font-bold text-slate-900">{avgScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 font-medium">
                <span className="text-emerald-600">Overall completeness</span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Firms List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Law Firms ({displayedFirms.length})
            </h2>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowInactive(!showInactive)}
                className="gap-2 h-11 px-4"
              >
                {showInactive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showInactive ? 'Hide Inactive' : 'Show All'}
              </Button>
              <Button
                size="lg"
                onClick={() => setShowAddModal(true)}
                className="gap-2 h-11 px-4 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add New Firm
              </Button>
            </div>
          </div>

          {displayedFirms.length === 0 ? (
            <Card className="border-2 border-dashed">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedFirms.map(firm => {
                const stats = firmStats[firm.id];
                const hasIssues = stats?.latestScan
                  ? (stats.latestScan.criticalMissing + stats.latestScan.requiredMissing) > 0
                  : false;

                return (
                  <Link key={firm.id} href={`/firms/${firm.id}`}>
                    <Card className={`border-2 hover:shadow-lg transition-all cursor-pointer h-full ${
                      !firm.active ? 'opacity-60 bg-slate-50' : ''
                    } ${hasIssues ? 'border-red-200 bg-red-50/20' : ''}`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-xl text-slate-900 flex-1">{firm.name}</CardTitle>
                          {!firm.active && (
                            <Badge variant="outline" className="text-xs">Inactive</Badge>
                          )}
                        </div>
                        <CardDescription className="text-sm">
                          {stats?.latestScan ? (
                            <>
                              {stats.latestScan.casesScanned} cases scanned
                            </>
                          ) : (
                            'No scans yet'
                          )}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {stats?.latestScan ? (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Average Score</span>
                              <span className={`font-bold ${
                                stats.latestScan.averageScore >= 90 ? 'text-emerald-600' :
                                stats.latestScan.averageScore >= 70 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {Math.round(stats.latestScan.averageScore)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-slate-600">Critical Issues</span>
                              <span className={`font-bold ${
                                stats.latestScan.criticalMissing > 0 ? 'text-red-600' : 'text-emerald-600'
                              }`}>
                                {stats.latestScan.criticalMissing}
                              </span>
                            </div>
                            <div className="pt-2 border-t text-xs text-slate-500">
                              Last scanned: {stats.lastScannedAt
                                ? new Date(stats.lastScannedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })
                                : 'Never'
                              }
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-sm text-slate-500">Click to view and scan cases</p>
                          </div>
                        )}
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
