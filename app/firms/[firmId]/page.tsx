'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Scale,
  ArrowLeft,
  RefreshCw,
  FileCheck,
  AlertTriangle,
  Loader2,
  Building2,
} from 'lucide-react';

interface CaseWithAudit {
  id: string;
  caseNumber: string;
  clientName: string;
  caseType: string;
  currentPhase: string;
  assignedAttorney: string;
  dateOpened: string;
  documents: any[];
  audit: {
    score: number;
    criticalMissing: number;
    requiredMissing: number;
    totalMissing: number;
  };
}

export default function FirmDetailPage() {
  const router = useRouter();
  const params = useParams();
  const firmId = params?.firmId as string;

  const [firm, setFirm] = useState<any>(null);
  const [cases, setCases] = useState<CaseWithAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState('');

  useEffect(() => {
    if (firmId) {
      fetchFirmData();
    }
  }, [firmId]);

  const fetchFirmData = async () => {
    try {
      // Fetch firm details
      const firmResponse = await fetch(`/api/firms/${firmId}`);
      const firmData = await firmResponse.json();
      setFirm(firmData);

      // Fetch cases with issues
      const casesResponse = await fetch(`/api/firms/${firmId}/cases`);
      const casesData = await casesResponse.json();
      setCases(casesData.cases || []);
    } catch (error) {
      console.error('Error fetching firm data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkScan = async () => {
    if (!firmId) return;

    setScanning(true);
    setScanProgress('Starting bulk scan...');

    try {
      const response = await fetch('/api/scan/firm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmId }),
      });

      if (!response.ok) {
        throw new Error('Scan failed');
      }

      setScanProgress('Scan completed! Refreshing data...');
      await fetchFirmData();
      setScanProgress('');
    } catch (error) {
      console.error('Scan error:', error);
      alert('Failed to scan firm cases. Please try again.');
      setScanProgress('');
    } finally {
      setScanning(false);
    }
  };

  const handleSingleCaseScan = async (caseId: string) => {
    try {
      const response = await fetch('/api/scan/case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmId, caseId }),
      });

      if (!response.ok) {
        throw new Error('Case scan failed');
      }

      // Refresh cases after scan
      await fetchFirmData();
    } catch (error) {
      console.error('Case scan error:', error);
      alert('Failed to scan case. Please try again.');
    }
  };

  const getScoreColor = (score: number) => {
    return 'text-slate-900';
  };

  const getScoreBg = (score: number) => {
    return 'bg-white border-slate-200';
  };

  const formatPhase = (phase: string) => {
    return phase
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatCaseType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-base">Loading firm data...</p>
        </div>
      </div>
    );
  }

  if (!firm) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600 mb-4">Firm not found</p>
          <Link href="/demo">
            <Button>Return to Demo</Button>
          </Link>
        </div>
      </div>
    );
  }

  const avgScore = cases.length > 0
    ? Math.round(cases.reduce((sum, c) => sum + c.audit.score, 0) / cases.length)
    : 0;
  const criticalCases = cases.filter(c => c.audit.criticalMissing > 0).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          {/* Mobile Header */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between mb-3">
              <Link href="/demo">
                <Button variant="outline" size="sm" className="gap-1.5 h-9 px-3">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={handleBulkScan}
                disabled={scanning}
                className="gap-1.5 h-9 px-3 bg-slate-900 hover:bg-slate-800"
              >
                {scanning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>{scanning ? 'Scanning' : 'Scan'}</span>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-slate-900 truncate">{firm.name}</h1>
                <p className="text-xs text-slate-600">Case Document Audit</p>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Link href="/demo">
                <Button variant="outline" size="sm" className="gap-2 h-9">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900">{firm.name}</h1>
                  <p className="text-sm text-slate-600">Case Document Audit</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleBulkScan}
              disabled={scanning}
              className="gap-2 h-10 px-4 bg-slate-900 hover:bg-slate-800"
            >
              {scanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Scan All Cases
                </>
              )}
            </Button>
          </div>
          {scanProgress && (
            <div className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600 font-medium">
              {scanProgress}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-10">
          {/* Total Cases Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">Flagged</CardDescription>
              <CardTitle className="text-2xl sm:text-4xl font-bold text-slate-900">{cases.length}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs sm:text-sm text-slate-500">Need attention</p>
            </CardContent>
          </Card>

          {/* Documents Analyzed Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">Documents</CardDescription>
              <CardTitle className="text-2xl sm:text-4xl font-bold text-slate-900">1,284</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs sm:text-sm text-slate-500">AI classified</p>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">Avg Score</CardDescription>
              <CardTitle className="text-2xl sm:text-4xl font-bold text-slate-900">{avgScore}%</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <Progress value={avgScore} className="h-1.5 sm:h-2" />
            </CardContent>
          </Card>

          {/* Critical Cases Card */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-2 sm:pb-4 p-4 sm:p-6">
              <CardDescription className="text-xs sm:text-sm font-medium text-slate-500">Critical</CardDescription>
              <CardTitle className="text-2xl sm:text-4xl font-bold text-slate-900">{criticalCases}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
              <p className="text-xs sm:text-sm text-slate-500">Urgent action</p>
            </CardContent>
          </Card>
        </div>

        {/* Cases List */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900">
              Cases ({cases.length})
            </h2>
          </div>

          {cases.length === 0 ? (
            <Card className="border border-dashed">
              <CardContent className="text-center py-12 sm:py-16 px-4">
                <FileCheck className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-base sm:text-lg text-slate-600 mb-2">No cases with missing documents</p>
                <p className="text-sm text-slate-500 mb-6">
                  All cases are compliant or no scan has been performed yet
                </p>
                <Button
                  onClick={handleBulkScan}
                  disabled={scanning}
                  className="gap-2"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Scan Cases Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {cases.map(caseData => (
                <Card
                  key={caseData.id}
                  className="border hover:shadow-md transition-all"
                >
                  <CardContent className="p-4 sm:py-5 sm:px-6">
                    {/* Mobile Layout */}
                    <div className="sm:hidden">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-slate-900 text-sm">{caseData.clientName}</span>
                            <Badge variant="outline" className="font-mono text-xs">{caseData.caseNumber}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {formatPhase(caseData.currentPhase)} • {caseData.assignedAttorney}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-slate-900">{caseData.audit.score}%</div>
                          <div className="text-xs text-slate-500">Score</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-slate-900">{caseData.audit.criticalMissing}</div>
                          <div className="text-xs text-slate-500">Critical</div>
                        </div>
                        <div className="text-center p-2 bg-slate-50 rounded-lg">
                          <div className="text-lg font-bold text-slate-900">{caseData.audit.totalMissing}</div>
                          <div className="text-xs text-slate-500">Missing</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            handleSingleCaseScan(caseData.id);
                          }}
                          className="flex-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                          Rescan
                        </Button>
                        <Link href={`/cases/${caseData.id}`} className="flex-1">
                          <Button size="sm" className="w-full">View Report</Button>
                        </Link>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:flex sm:items-center sm:justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold text-slate-900">{caseData.clientName}</span>
                          <Badge variant="outline" className="font-mono text-xs">{caseData.caseNumber}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">
                          {formatCaseType(caseData.caseType)} • {formatPhase(caseData.currentPhase)} • {caseData.assignedAttorney}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{caseData.audit.score}%</div>
                          <div className="text-xs text-slate-500">Score</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{caseData.audit.criticalMissing}</div>
                          <div className="text-xs text-slate-500">Critical</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-slate-900">{caseData.audit.totalMissing}</div>
                          <div className="text-xs text-slate-500">Missing</div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSingleCaseScan(caseData.id)}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </Button>
                          <Link href={`/cases/${caseData.id}`}>
                            <Button size="sm">View Report</Button>
                          </Link>
                        </div>
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
