import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ApplicationStatus, AssetCategory, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0 && process.env.FORCE_SEED !== 'true') {
    console.log('Seed skipped: database already initialized');
    return;
  }

  await prisma.auditLog.deleteMany();
  await prisma.applicationItem.deleteMany();
  await prisma.assetApplication.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const passwordHash = await bcrypt.hash('123456', 10);

  const rdDept = await prisma.department.create({
    data: { name: '研发部', updatedBy: 'seed' },
  });
  const mktDept = await prisma.department.create({
    data: { name: '市场部', updatedBy: 'seed' },
  });

  const managerA = await prisma.user.create({
    data: {
      username: 'manager_a',
      passwordHash,
      role: Role.MANAGER,
      departmentId: rdDept.id,
      updatedBy: 'seed',
    },
  });
  const managerB = await prisma.user.create({
    data: {
      username: 'manager_b',
      passwordHash,
      role: Role.MANAGER,
      departmentId: mktDept.id,
      updatedBy: 'seed',
    },
  });

  await prisma.department.update({
    where: { id: rdDept.id },
    data: { managerId: managerA.id },
  });
  await prisma.department.update({
    where: { id: mktDept.id },
    data: { managerId: managerB.id },
  });

  const employeeA = await prisma.user.create({
    data: {
      username: 'employee_a',
      passwordHash,
      role: Role.EMPLOYEE,
      departmentId: rdDept.id,
      updatedBy: 'seed',
    },
  });
  const employeeB = await prisma.user.create({
    data: {
      username: 'employee_b',
      passwordHash,
      role: Role.EMPLOYEE,
      departmentId: mktDept.id,
      updatedBy: 'seed',
    },
  });
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash,
      role: Role.ADMIN,
      departmentId: rdDept.id,
      updatedBy: 'seed',
    },
  });
  const auditor = await prisma.user.create({
    data: {
      username: 'auditor',
      passwordHash,
      role: Role.AUDITOR,
      departmentId: rdDept.id,
      updatedBy: 'seed',
    },
  });

  const statuses: ApplicationStatus[] = [
    ApplicationStatus.PENDING,
    ApplicationStatus.APPROVED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
    ApplicationStatus.TERMINATED,
    ApplicationStatus.PENDING,
    ApplicationStatus.PENDING,
    ApplicationStatus.APPROVED,
  ];

  const applications: { id: string }[] = [];
  for (let i = 0; i < statuses.length; i++) {
    const applicant = i % 2 === 0 ? employeeA : employeeB;
    const app = await prisma.assetApplication.create({
      data: {
        applicantId: applicant.id,
        reason: `测试申请单 ${i + 1}`,
        status: statuses[i],
        updatedBy: applicant.username,
        items: {
          create: [
            {
              category: i % 3 === 0 ? AssetCategory.SENSITIVE_DATA : AssetCategory.ELECTRONIC_DEVICE,
              assetName: `资产-${i + 1}`,
              quantity: i + 1,
              assetKey: i % 3 === 0 ? `SECRET_KEY_2026_${String.fromCharCode(65 + i)}` : null,
            },
          ],
        },
      },
    });
    applications.push(app);

    await prisma.auditLog.create({
      data: {
        applicationId: app.id,
        operatorId: applicant.id,
        action: 'SUBMIT',
        beforeStatus: null,
        afterStatus: ApplicationStatus.PENDING,
        metadata: { assetKey: i % 3 === 0 ? `SECRET_KEY_2026_${String.fromCharCode(65 + i)}` : null },
      },
    });
  }

  // Bulk insert 50,000 audit logs for export testing
  const BATCH_SIZE = 1000;
  const TOTAL_LOGS = 50000;
  const baseApp = applications[0];

  for (let offset = 0; offset < TOTAL_LOGS; offset += BATCH_SIZE) {
    const batch = Array.from({ length: Math.min(BATCH_SIZE, TOTAL_LOGS - offset) }, (_, idx) => {
      const n = offset + idx;
      return {
        applicationId: applications[n % applications.length].id,
        operatorId: n % 2 === 0 ? employeeA.id : managerA.id,
        action: n % 5 === 0 ? 'REJECT' : 'APPROVE',
        reason: n % 5 === 0 ? `驳回原因-${n}` : null,
        beforeStatus: ApplicationStatus.PENDING,
        afterStatus: n % 5 === 0 ? ApplicationStatus.REJECTED : ApplicationStatus.APPROVED,
        metadata: {
          assetKey: `SECRET_KEY_2026_${String.fromCharCode(65 + (n % 26))}`,
        },
        createdAt: new Date(Date.now() - n * 60_000),
      };
    });
    await prisma.auditLog.createMany({ data: batch });
  }

  console.log('Seed completed:', {
    departments: 2,
    users: 6,
    applications: applications.length,
    auditLogs: TOTAL_LOGS + applications.length,
    testAccounts: ['employee_a', 'manager_a', 'manager_b', 'admin', 'auditor'],
    password: '123456',
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
