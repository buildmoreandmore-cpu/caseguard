import { PrismaClient } from '@prisma/client';
import { encrypt } from '../lib/crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo data...\n');

  // Single Demo Firm with comprehensive case data
  const firm = await prisma.firm.upsert({
    where: { id: 'demo-firm-1' },
    update: {},
    create: {
      id: 'demo-firm-1',
      name: 'Anderson & Associates',
      contactEmail: 'admin@andersonlaw.com',
      contactPhone: '(555) 123-4567',
      cmsProvider: 'filevine',
      cmsApiUrl: 'https://api.filevine.io',
      cmsApiKey: encrypt('demo-api-key'),
      casepeerApiUrl: 'https://api.filevine.io',
      casepeerApiKey: encrypt('demo-api-key'),
      active: true,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  });

  // Create comprehensive scan history
  await prisma.auditLog.upsert({
    where: { id: 'demo-audit-latest' },
    update: {},
    create: {
      id: 'demo-audit-latest',
      firmId: firm.id,
      scanType: 'full_firm',
      casesScanned: 47,
      documentsAnalyzed: 1284,
      criticalMissing: 12,
      requiredMissing: 23,
      averageScore: 78,
      status: 'completed',
      startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    },
  });

  await prisma.firm.update({
    where: { id: firm.id },
    data: { lastScannedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  });

  console.log('Demo data seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
