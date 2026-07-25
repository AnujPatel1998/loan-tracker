import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const statusNames = [
    'Application Received',
    'Documents Pending',
    'Loan Processing',
    'Sanctioned',
    'Disbursed',
  ];

  for (let i = 0; i < statusNames.length; i++) {
    await prisma.applicationStatus.upsert({
      where: { name: statusNames[i] },
      update: {},
      create: { name: statusNames[i], sortOrder: i + 1 },
    });
  }
  console.log('Statuses seeded');

  const executive = await prisma.staffProfile.create({
    data: { fullName: 'Yash Patel', designation: 'Executive', phoneNumber: '9999999901' },
  });
  const hod = await prisma.staffProfile.create({
    data: { fullName: 'Hasib Shaikh', designation: 'HOD', phoneNumber: '9999999902' },
  });
  console.log('Staff profiles seeded');

  const adminPassword = 'Admin@123';
  await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: Role.admin,
    },
  });
  console.log(`Admin created — username: admin / password: ${adminPassword}`);

  const underReview = await prisma.applicationStatus.findUnique({ where: { name: 'Under Review' } });

  const customer1Password = 'Ravi@123';
  const customer1User = await prisma.user.create({
    data: {
      username: 'ravi',
      passwordHash: await bcrypt.hash(customer1Password, 10),
      role: Role.customer,
    },
  });
  await prisma.customer.create({
    data: {
      userId: customer1User.id,
      fullName: 'Ravi Shah',
      phoneNumber: '9876500001',
      firmName: 'Shah Textiles',
      loanAmount: 2500000,
      bankName: 'HDFC Bank',
      caseHandlingExecutiveId: executive.id,
      hodId: hod.id,
      currentStatusId: underReview?.id ?? 1,
      customerDeadline: new Date('2026-08-15'),
      internalDeadline: new Date('2026-08-10'),
      adminRemarks: 'Waiting on bank query response.',
    },
  });
  console.log(`Customer created — username: ravi / password: ${customer1Password}`);

  const customer2Password = 'Priya@123';
  const customer2User = await prisma.user.create({
    data: {
      username: 'priya',
      passwordHash: await bcrypt.hash(customer2Password, 10),
      role: Role.customer,
    },
  });
  await prisma.customer.create({
    data: {
      userId: customer2User.id,
      fullName: 'Priya Mehta',
      phoneNumber: '9876500002',
      firmName: 'Mehta Exports',
      loanAmount: 1800000,
      bankName: 'ICICI Bank',
      caseHandlingExecutiveId: executive.id,
      hodId: hod.id,
      currentStatusId: 1,
      customerDeadline: new Date('2026-08-20'),
      internalDeadline: new Date('2026-08-15'),
    },
  });
  console.log(`Customer created — username: priya / password: ${customer2Password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });