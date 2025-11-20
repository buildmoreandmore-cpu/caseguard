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
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
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
          <Link href="/">
            <Button>Return to Dashboard</Button>
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
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="lg" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{firm.name}</h1>
                  <p className="text-sm text-slate-600 mt-0.5">Case Document Audit</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="lg"
                onClick={handleBulkScan}
                disabled={scanning}
                className="gap-2 h-11 px-6 bg-blue-600 hover:bg-blue-700"
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
          </div>
          {scanProgress && (
            <div className="mt-3 text-sm text-blue-600 font-medium">
              {scanProgress}
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Cases Card */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Cases with Issues</CardDescription>
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-5xl font-bold text-slate-900">{cases.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">Requiring document attention</p>
            </CardContent>
          </Card>

          {/* Average Score Card */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Average Score</CardDescription>
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className={`text-5xl font-bold ${getScoreColor(avgScore)}`}>
                {avgScore}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={avgScore} className="h-3" />
            </CardContent>
          </Card>

          {/* Critical Cases Card */}
          <Card className={`border-2 shadow-sm ${
            criticalCases > 0 ? 'border-red-300 bg-red-50/30' : ''
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Critical Issues</CardDescription>
                <AlertTriangle className={`w-5 h-5 ${criticalCases > 0 ? 'text-red-600' : 'text-slate-400'}`} />
              </div>
              <CardTitle className="text-5xl font-bold text-slate-900">{criticalCases}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 font-medium">
                {criticalCases > 0 ? (
                  <span className="text-red-600">Cases need immediate attention</span>
                ) : (
                  <span className="text-emerald-600">No critical gaps found</span>
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cases List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              Cases ({cases.length})
            </h2>
          </div>

          {cases.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="text-center py-16">
                <FileCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-600 mb-2">No cases with missing documents</p>
                <p className="text-sm text-slate-500 mb-6">
                  All cases are compliant or no scan has been performed yet
                </p>
                <Button
                  size="lg"
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
            <div className="space-y-4">
              {cases.map(caseData => (
                <Card
                  key={caseData.id}
                  className={`border-2 hover:shadow-lg transition-all ${getScoreBg(caseData.audit.score)}`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <CardTitle className="text-xl text-slate-900">{caseData.clientName}</CardTitle>
                          <Badge variant="outline" className="font-mono text-sm">{caseData.caseNumber}</Badge>
                          {caseData.audit.criticalMissing > 0 && (
                            <Badge variant="destructive" className="gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {caseData.audit.criticalMissing} Critical {caseData.audit.criticalMissing === 1 ? 'Gap' : 'Gaps'}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {formatCaseType(caseData.caseType)} • {formatPhase(caseData.currentPhase)} Phase
                        </CardDescription>
                      </div>

                      {/* Score Display */}
                      <div className="text-right flex-shrink-0">
                        <div className={`text-5xl font-bold leading-none mb-2 ${getScoreColor(caseData.audit.score)}`}>
                          {caseData.audit.score}
                          <span className="text-2xl">%</span>
                        </div>
                        <p className="text-sm font-medium text-slate-600">
                          {caseData.audit.score >= 90
                            ? 'Excellent'
                            : caseData.audit.score >= 70
                            ? 'Good Progress'
                            : 'Needs Work'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="space-y-2 text-sm text-slate-700">
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Attorney:</span> {caseData.assignedAttorney}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Opened:</span> {new Date(caseData.dateOpened).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="flex items-center gap-2">
                          <span className="font-medium">Missing:</span>
                          <span className="text-red-600 font-bold">
                            {caseData.audit.totalMissing} document{caseData.audit.totalMissing !== 1 ? 's' : ''}
                          </span>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => handleSingleCaseScan(caseData.id)}
                          className="gap-2"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Rescan
                        </Button>
                        <Link href={`/cases/${caseData.id}`}>
                          <Button size="lg" className="px-6">
                            View Audit Report
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 font-medium">File Completeness</span>
                        <span className={`font-bold ${getScoreColor(caseData.audit.score)}`}>
                          {caseData.audit.score}%
                        </span>
                      </div>
                      <Progress value={caseData.audit.score} className="h-3" />
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
