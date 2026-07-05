import { ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../modules/prisma/prisma.service';

export async function getManagedDepartmentIds(
  prisma: PrismaService,
  managerId: string,
): Promise<string[]> {
  const departments = await prisma.department.findMany({
    where: { managerId },
    select: { id: true },
  });
  return departments.map((d) => d.id);
}

export async function assertManagerOfDepartment(
  prisma: PrismaService,
  managerId: string,
  departmentId: string,
): Promise<void> {
  const department = await prisma.department.findUnique({
    where: { id: departmentId },
    select: { managerId: true },
  });
  if (!department || department.managerId !== managerId) {
    throw new ForbiddenException('无权审批其他部门的申请单');
  }
}
