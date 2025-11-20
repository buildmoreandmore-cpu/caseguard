import { PrismaClient } from '@prisma/client';
import { encrypt } from '../lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo firms and audit history...\n');

  // Demo Firm 1: Smith & Associates (Recently added, needs first scan)
  console.log('📁 Creating Smith & Associates Law Firm...');
  const firm1 = await prisma.firm.upsert({
    where: { id: 'demo-firm-1' },
    update: {},
    create: {
      id: 'demo-firm-1',
      name: 'Smith & Associates Law Firm',
      contactEmail: 'admin@smithlaw.com',
      contactPhone: '(555) 123-4567',
      casepeerApiUrl: 'https://demo.casepeer.com/api',
      casepeerApiKey: encrypt('demo-api-key-smith'),
      active: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  });
  console.log('   ✓ Firm created 3 hours ago');
  console.log('   ✓ Status: Active');
  console.log('   ✓ 15 clients with case files\n');

  // Create initial scan for Firm 1 (just completed)
  console.log('🔍 Running initial scan for Smith & Associates...');
  await prisma.auditLog.upsert({
    where: { id: 'demo-audit-1' },
    update: {},
    create: {
      id: 'demo-audit-1',
      firmId: firm1.id,
      scanType: 'full_firm',
      casesScanned: 15,
      documentsAnalyzed: 247,
      criticalMissing: 8,
      requiredMissing: 12,
      averageScore: 76.5,
      status: 'completed',
      startedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
      completedAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
    },
  });

  await prisma.firm.update({
    where: { id: firm1.id },
    data: { lastScannedAt: new Date(Date.now() - 10 * 60 * 1000) },
  });
  console.log('   ✓ Scan completed 10 minutes ago');
  console.log('   ✓ Found 8 critical issues');
  console.log('   ✓ Found 12 required documents missing');
  console.log('   ✓ Average compliance: 76.5%\n');

  // Demo Firm 2: Johnson Legal Group (Established, excellent compliance)
  console.log('📁 Creating Johnson Legal Group...');
  const firm2 = await prisma.firm.upsert({
    where: { id: 'demo-firm-2' },
    update: {},
    create: {
      id: 'demo-firm-2',
      name: 'Johnson Legal Group',
      contactEmail: 'contact@johnsonlegal.com',
      contactPhone: '(555) 234-5678',
      casepeerApiUrl: 'https://demo.casepeer.com/api',
      casepeerApiKey: encrypt('demo-api-key-johnson'),
      active: true,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
  });
  console.log('   ✓ Firm added 30 days ago');
  console.log('   ✓ Status: Active');
  console.log('   ✓ 22 clients with case files\n');

  // Create multiple scans for Firm 2 (showing improvement over time)
  console.log('🔍 Creating scan history for Johnson Legal Group...');

  // First scan (30 days ago)
  await prisma.auditLog.upsert({
    where: { id: 'demo-audit-2-initial' },
    update: {},
    create: {
      id: 'demo-audit-2-initial',
      firmId: firm2.id,
      scanType: 'full_firm',
      casesScanned: 22,
      documentsAnalyzed: 389,
      criticalMissing: 12,
      requiredMissing: 18,
      averageScore: 73.8,
      status: 'completed',
      startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    },
  });
  console.log('   ✓ Initial scan (30 days ago): 73.8% compliance');

  // Second scan (15 days ago - improvement)
  await prisma.auditLog.upsert({
    where: { id: 'demo-audit-2-followup' },
    update: {},
    create: {
      id: 'demo-audit-2-followup',
      firmId: firm2.id,
      scanType: 'full_firm',
      casesScanned: 22,
      documentsAnalyzed: 389,
      criticalMissing: 5,
      requiredMissing: 8,
      averageScore: 85.2,
      status: 'completed',
      startedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000 + 40 * 60 * 1000),
    },
  });
  console.log('   ✓ Follow-up scan (15 days ago): 85.2% compliance (+11.4%)');

  // Latest scan (1 day ago - excellent)
  await prisma.auditLog.upsert({
    where: { id: 'demo-audit-2' },
    update: {},
    create: {
      id: 'demo-audit-2',
      firmId: firm2.id,
      scanType: 'full_firm',
      casesScanned: 22,
      documentsAnalyzed: 389,
      criticalMissing: 2,
      requiredMissing: 5,
      averageScore: 92.3,
      status: 'completed',
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
    },
  });
  console.log('   ✓ Latest scan (1 day ago): 92.3% compliance (+7.1%)');
  console.log('   ✓ Only 2 critical issues remaining\n');

  await prisma.firm.update({
    where: { id: firm2.id },
    data: { lastScannedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  });

  // Demo Firm 3: Martinez & Partners (Inactive - client churned)
  console.log('📁 Creating Martinez & Partners LLP...');
  const firm3 = await prisma.firm.upsert({
    where: { id: 'demo-firm-3' },
    update: {},
    create: {
      id: 'demo-firm-3',
      name: 'Martinez & Partners LLP',
      contactEmail: 'info@martinezpartners.com',
      contactPhone: '(555) 345-6789',
      casepeerApiUrl: 'https://demo.casepeer.com/api',
      casepeerApiKey: encrypt('demo-api-key-martinez'),
      active: false,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    },
  });
  console.log('   ✓ Firm added 90 days ago');
  console.log('   ✓ Status: Inactive (churned)');
  console.log('   ✓ Last scan: 45 days ago\n');

  // Create historical scan for inactive firm
  await prisma.auditLog.upsert({
    where: { id: 'demo-audit-3' },
    update: {},
    create: {
      id: 'demo-audit-3',
      firmId: firm3.id,
      scanType: 'full_firm',
      casesScanned: 8,
      documentsAnalyzed: 142,
      criticalMissing: 15,
      requiredMissing: 22,
      averageScore: 58.3,
      status: 'completed',
      startedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000 + 20 * 60 * 1000),
    },
  });

  await prisma.firm.update({
    where: { id: firm3.id },
    data: { lastScannedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000) },
  });

  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ Demo database seeded successfully!\n');
  console.log('📊 Summary:');
  console.log('   • 3 law firms created');
  console.log('   • 2 active, 1 inactive');
  console.log('   • 6 audit scans recorded');
  console.log('   • 45 total cases');
  console.log('   • 778 total documents analyzed\n');
  console.log('🎯 Demo Scenario:');
  console.log('   1. Smith & Associates: Just added, first scan complete');
  console.log('   2. Johnson Legal Group: Established client, improving over time');
  console.log('   3. Martinez & Partners: Inactive client for reference\n');
  console.log('🔑 Login at: https://legal-file-auditor.vercel.app');
  console.log('   Password: CaseGuard2025\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
