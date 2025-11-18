'use client';

import { useEffect, useState } from 'react';
import { Case, CompletenessScore } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface CaseWithScore extends Case {
  score?: number;
  criticalMissing?: number;
}

export default function DashboardPage() {
  const [cases, setCases] = useState<CaseWithScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Legal File Auditor</h1>
          <p className="text-lg text-slate-600">
            AI-Powered Case File Completeness Analysis
          </p>
          <div className="mt-4 flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              CasePeer Integration: {process.env.NEXT_PUBLIC_CASEPEER_ENABLED === 'true' ? 'Live' : 'Demo Mode'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {cases.length} Active Cases
            </Badge>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Completeness</CardDescription>
              <CardTitle className="text-3xl">
                {cases.length > 0
                  ? Math.round(
                      cases.reduce((sum, c) => sum + (c.score || 0), 0) / cases.length
                    )
                  : 0}
                %
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress
                value={
                  cases.length > 0
                    ? cases.reduce((sum, c) => sum + (c.score || 0), 0) / cases.length
                    : 0
                }
                className="h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Cases with Critical Gaps</CardDescription>
              <CardTitle className="text-3xl">
                {cases.filter(c => (c.criticalMissing || 0) > 0).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {cases.length > 0
                  ? Math.round(
                      (cases.filter(c => (c.criticalMissing || 0) > 0).length / cases.length) * 100
                    )
                  : 0}
                % of total cases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Fully Compliant Cases</CardDescription>
              <CardTitle className="text-3xl">
                {cases.filter(c => (c.score || 0) >= 95).length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                {cases.length > 0
                  ? Math.round((cases.filter(c => (c.score || 0) >= 95).length / cases.length) * 100)
                  : 0}
                % of total cases
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cases List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">Case Files</h2>

          {cases.map(caseData => (
            <Card key={caseData.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{caseData.clientName}</CardTitle>
                      <Badge variant="outline">{caseData.caseNumber}</Badge>
                      {caseData.criticalMissing && caseData.criticalMissing > 0 && (
                        <Badge variant="destructive">
                          {caseData.criticalMissing} Critical Missing
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {formatCaseType(caseData.caseType)} • {formatPhase(caseData.currentPhase)} Phase
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    {caseData.score !== undefined && (
                      <div>
                        <div className={`text-3xl font-bold ${getScoreColor(caseData.score)}`}>
                          {caseData.score}%
                        </div>
                        <Badge
                          variant={getScoreBadgeVariant(caseData.score)}
                          className="mt-2"
                        >
                          {caseData.score >= 90
                            ? 'Excellent'
                            : caseData.score >= 70
                            ? 'Good'
                            : 'Needs Attention'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>Attorney: {caseData.assignedAttorney}</p>
                    <p>
                      Opened: {new Date(caseData.dateOpened).toLocaleDateString()}
                    </p>
                    <p>{caseData.documents.length} documents on file</p>
                  </div>
                  <Link href={`/cases/${caseData.id}`}>
                    <Button>View Audit Details</Button>
                  </Link>
                </div>
                {caseData.score !== undefined && (
                  <div className="mt-4">
                    <Progress value={caseData.score} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {cases.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-slate-600">No cases found. Connect to CasePeer or add demo data.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
