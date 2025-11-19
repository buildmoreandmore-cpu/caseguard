'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Case } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Scale, FileCheck, AlertTriangle, CheckCircle2, LogOut, Settings } from 'lucide-react';

interface CaseWithScore extends Case {
  score?: number;
  criticalMissing?: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseWithScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);

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

      fetchCases();
    } catch (error) {
      router.push('/login');
    } finally {
      setChecking(false);
    }
  };

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases');
      const data = await response.json();

      // Fetch audit scores for each case
      const casesWithScores = await Promise.all(
        data.cases.map(async (caseData: Case) => {
          try {
            const auditResponse = await fetch(`/api/cases/${caseData.id}/audit`);
            const auditData = await auditResponse.json();

            return {
              ...caseData,
              score: auditData.audit.score.overall,
              criticalMissing: auditData.audit.score.criticalMissing,
            };
          } catch (error) {
            console.error(`Error fetching audit for case ${caseData.id}:`, error);
            return caseData;
          }
        })
      );

      setCases(casesWithScores);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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
          <p className="text-slate-600 text-base">Loading case files...</p>
        </div>
      </div>
    );
  }

  const avgScore = cases.length > 0
    ? Math.round(cases.reduce((sum, c) => sum + (c.score || 0), 0) / cases.length)
    : 0;
  const criticalCases = cases.filter(c => (c.criticalMissing || 0) > 0).length;
  const compliantCases = cases.filter(c => (c.score || 0) >= 95).length;

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
                <p className="text-sm text-slate-600 mt-0.5">Document Audit System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm px-3 py-1.5 font-medium">
                {process.env.NEXT_PUBLIC_CASEPEER_ENABLED === 'true' ? '🟢 Live' : '🟡 Demo Mode'}
              </Badge>
              <Link href="/admin">
                <Button variant="outline" size="lg" className="gap-2 h-11 px-4">
                  <Settings className="w-4 h-4" />
                  Manage Firms
                </Button>
              </Link>
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
        {/* Statistics - Clear, Accessible, Action-Oriented */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Average Score Card */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Average Completeness</CardDescription>
                <FileCheck className="w-5 h-5 text-blue-600" />
              </div>
              <CardTitle className="text-5xl font-bold text-slate-900">{avgScore}%</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={avgScore} className="h-3 mb-2" />
              <p className="text-sm text-slate-600">Across {cases.length} active cases</p>
            </CardContent>
          </Card>

          {/* Critical Issues Card */}
          <Card className={`border-2 shadow-sm hover:shadow-md transition-shadow ${
            criticalCases > 0 ? 'border-red-300 bg-red-50/30' : ''
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Critical Gaps Found</CardDescription>
                <AlertTriangle className={`w-5 h-5 ${criticalCases > 0 ? 'text-red-600' : 'text-slate-400'}`} />
              </div>
              <CardTitle className="text-5xl font-bold text-slate-900">{criticalCases}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 font-medium">
                {criticalCases > 0 ? (
                  <>
                    <span className="text-red-600">{criticalCases} {criticalCases === 1 ? 'case needs' : 'cases need'}</span> immediate attention
                  </>
                ) : (
                  <span className="text-emerald-600">All cases are compliant</span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Compliant Cases Card */}
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow border-emerald-300 bg-emerald-50/30">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardDescription className="text-base font-medium">Fully Compliant</CardDescription>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-5xl font-bold text-slate-900">{compliantCases}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 font-medium">
                <span className="text-emerald-600">
                  {cases.length > 0 ? Math.round((compliantCases / cases.length) * 100) : 0}%
                </span>{' '}
                of your caseload
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cases List - Clear Hierarchy, Easy to Scan */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Case Files ({cases.length})</h2>
          </div>

          {cases.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="text-center py-16">
                <FileCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-lg text-slate-600 mb-2">No cases to display</p>
                <p className="text-sm text-slate-500">Cases will appear here once you connect to CasePeer</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {cases.map(caseData => (
                <Card
                  key={caseData.id}
                  className={`border-2 hover:shadow-lg transition-all cursor-pointer ${
                    caseData.score !== undefined ? getScoreBg(caseData.score) : ''
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <CardTitle className="text-xl text-slate-900">{caseData.clientName}</CardTitle>
                          <Badge variant="outline" className="font-mono text-sm">{caseData.caseNumber}</Badge>
                          {caseData.criticalMissing && caseData.criticalMissing > 0 && (
                            <Badge variant="destructive" className="gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {caseData.criticalMissing} Critical {caseData.criticalMissing === 1 ? 'Gap' : 'Gaps'}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base">
                          {formatCaseType(caseData.caseType)} • {formatPhase(caseData.currentPhase)} Phase
                        </CardDescription>
                      </div>

                      {/* Score Display - Clear Visual Hierarchy */}
                      {caseData.score !== undefined && (
                        <div className="text-right flex-shrink-0">
                          <div className={`text-5xl font-bold leading-none mb-2 ${getScoreColor(caseData.score)}`}>
                            {caseData.score}
                            <span className="text-2xl">%</span>
                          </div>
                          <p className="text-sm font-medium text-slate-600">
                            {caseData.score >= 90
                              ? 'Excellent'
                              : caseData.score >= 70
                              ? 'Good Progress'
                              : 'Needs Work'}
                          </p>
                        </div>
                      )}
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
                          <span className="font-medium">Documents:</span> {caseData.documents.length} on file
                        </p>
                      </div>

                      {/* Action Button - 44px minimum touch target */}
                      <Link href={`/cases/${caseData.id}`}>
                        <Button size="lg" className="h-11 px-6 text-base font-medium shadow-sm">
                          View Audit Report
                        </Button>
                      </Link>
                    </div>

                    {/* Progress Bar - Clear Visual Feedback */}
                    {caseData.score !== undefined && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 font-medium">File Completeness</span>
                          <span className={`font-bold ${getScoreColor(caseData.score)}`}>
                            {caseData.score}%
                          </span>
                        </div>
                        <Progress value={caseData.score} className="h-3" />
                      </div>
                    )}
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
