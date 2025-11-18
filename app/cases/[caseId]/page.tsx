'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuditReport } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function CaseAuditPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAudit();
  }, [caseId]);

  const fetchAudit = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/audit`);
      const data = await response.json();
      setAudit(data.audit);
    } catch (error) {
      console.error('Error fetching audit:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'missing':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'incomplete':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'required':
        return <Badge variant="secondary">Required</Badge>;
      case 'recommended':
        return <Badge variant="outline">Recommended</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const formatPhase = (phase: string) => {
    return phase.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Generating audit report...</p>
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <p className="text-slate-600 mb-4">Audit report not found</p>
            <Button onClick={() => router.push('/')}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                {audit.case.clientName}
              </h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{audit.case.caseNumber}</Badge>
                <Badge variant="outline">{formatPhase(audit.case.currentPhase)}</Badge>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {audit.score.overall}%
              </div>
              <p className="text-slate-600">Overall Completeness</p>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Critical Missing</CardDescription>
              <CardTitle className="text-2xl text-red-600">
                {audit.score.criticalMissing}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Required Missing</CardDescription>
              <CardTitle className="text-2xl text-yellow-600">
                {audit.score.requiredMissing}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Recommended Missing</CardDescription>
              <CardTitle className="text-2xl text-slate-600">
                {audit.score.recommendedMissing}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Phase Status</CardDescription>
              <CardTitle className="text-lg">
                {audit.phaseReadiness.currentPhaseComplete ? (
                  <span className="text-green-600">Complete</span>
                ) : (
                  <span className="text-yellow-600">In Progress</span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* AI Recommendations */}
        {audit.recommendations.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Smart insights to improve case file completeness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audit.recommendations.map((rec, idx) => (
                  <Alert key={idx}>
                    <AlertDescription className="text-sm">{rec}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Phase Readiness */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Phase Readiness Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Phase Complete:</span>
                {audit.phaseReadiness.currentPhaseComplete ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="secondary">No</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Ready for Next Phase:</span>
                {audit.phaseReadiness.readyForNextPhase ? (
                  <Badge variant="default">Yes</Badge>
                ) : (
                  <Badge variant="destructive">No</Badge>
                )}
              </div>
              {audit.phaseReadiness.blockers.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Blockers:</p>
                  <ul className="space-y-1">
                    {audit.phaseReadiness.blockers.map((blocker, idx) => (
                      <li key={idx} className="text-sm text-red-600">
                        • {blocker}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Document Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Document Checklist</CardTitle>
            <CardDescription>
              Complete document requirements for {formatPhase(audit.case.currentPhase)} phase
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Status</TableHead>
                  <TableHead>Document</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Files</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {audit.checklist.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{getStatusIcon(item.status)}</TableCell>
                    <TableCell className="font-medium">
                      {item.requirement.name}
                    </TableCell>
                    <TableCell>{getPriorityBadge(item.requirement.priority)}</TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {item.requirement.description}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.matchedDocuments.length > 0 ? (
                        <Badge variant="outline">
                          {item.matchedDocuments.length} file(s)
                        </Badge>
                      ) : (
                        <span className="text-sm text-slate-400">None</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Phase Score Breakdown */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Completeness by Phase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(audit.score.byPhase).map(([phase, score]) => (
                <div key={phase}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{formatPhase(phase)}</span>
                    <span className="text-sm font-semibold">{score}%</span>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
