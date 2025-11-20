import { PrismaClient } from '@prisma/client';
import { encrypt } from '../lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo firms...');

  // Demo Firm 1: Smith & Associates (Active, with some issues)
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
    },
  });

  // Demo Firm 2: Johnson Legal Group (Active, good compliance)
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
    },
  });

  // Demo Firm 3: Martinez & Partners (Inactive)
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
    },
  });

  // Create demo audit logs for Firm 1
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
      startedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000), // 30 mins later
    },
  });

  // Update firm1 lastScannedAt
  await prisma.firm.update({
    where: { id: firm1.id },
    data: { lastScannedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
  });

  // Create demo audit logs for Firm 2
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
      startedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 mins later
    },
  });

  // Update firm2 lastScannedAt
  await prisma.firm.update({
    where: { id: firm2.id },
    data: { lastScannedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  });

  console.log('✅ Demo firms seeded successfully!');
  console.log('Firms created:');
  console.log(`- ${firm1.name} (Active)`);
  console.log(`- ${firm2.name} (Active)`);
  console.log(`- ${firm3.name} (Inactive)`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
