import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ firmId: string }> }
) {
  try {
    const { firmId } = await params;

    // Get firm with audit logs
    const firm = await prisma.firm.findUnique({
      where: { id: firmId },
      include: {
        auditLogs: {
          where: { status: 'completed' },
          orderBy: { completedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!firm) {
      return NextResponse.json(
        { error: 'Firm not found' },
        { status: 404 }
      );
    }

    // Get the most recent completed scan
    const latestScan = firm.auditLogs[0];

    // Calculate aggregate statistics from recent scans
    const completedScans = firm.auditLogs.filter((log) => log.status === 'completed');
    const totalScans = completedScans.length;

    const stats = {
      firmId: firm.id,
      firmName: firm.name,
      active: firm.active,
      lastScannedAt: firm.lastScannedAt,

      // Latest scan data
      latestScan: latestScan ? {
        scanId: latestScan.id,
        scanType: latestScan.scanType,
        casesScanned: latestScan.casesScanned,
        documentsAnalyzed: latestScan.documentsAnalyzed,
        criticalMissing: latestScan.criticalMissing,
        requiredMissing: latestScan.requiredMissing,
        averageScore: latestScan.averageScore,
        completedAt: latestScan.completedAt,
      } : null,

      // Aggregate statistics from all scans
      aggregateStats: totalScans > 0 ? {
        totalScans,
        totalCasesScanned: completedScans.reduce((sum, log) => sum + (log.casesScanned || 0), 0),
        totalDocumentsAnalyzed: completedScans.reduce((sum, log) => sum + (log.documentsAnalyzed || 0), 0),
        totalCriticalIssues: completedScans.reduce((sum, log) => sum + (log.criticalMissing || 0), 0),
        totalRequiredMissing: completedScans.reduce((sum, log) => sum + (log.requiredMissing || 0), 0),
        averageScore: completedScans.reduce((sum, log) => sum + (log.averageScore || 0), 0) / totalScans,
      } : {
        totalScans: 0,
        totalCasesScanned: 0,
        totalDocumentsAnalyzed: 0,
        totalCriticalIssues: 0,
        totalRequiredMissing: 0,
        averageScore: 0,
      },

      // Recent scan history
      recentScans: firm.auditLogs.slice(0, 5).map((log) => ({
        id: log.id,
        scanType: log.scanType,
        casesScanned: log.casesScanned,
        averageScore: log.averageScore,
        status: log.status,
        startedAt: log.startedAt,
        completedAt: log.completedAt,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching firm stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch firm statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
