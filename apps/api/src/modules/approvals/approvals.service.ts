import { Injectable } from '@nestjs/common';
import { ApplicationStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserContext } from '../../common/decorators/current-user.decorator';
import { StateMachineService } from '../applications/state-machine.service';
import { maskApplicationItems } from '../applications/application.mapper';
import { getManagedDepartmentIds } from '../../common/authorization/manager-scope';

@Injectable()
export class ApprovalsService {
  constructor(
    private prisma: PrismaService,
    private stateMachine: StateMachineService,
  ) {}

  async findPending(user: UserContext, page = 1, pageSize = 10) {
    const managedDepartmentIds = await getManagedDepartmentIds(this.prisma, user.sub);
    const where = {
      status: ApplicationStatus.PENDING,
      applicant: { departmentId: { in: managedDepartmentIds } },
    };
    const [total, list] = await Promise.all([
      this.prisma.assetApplication.count({ where }),
      this.prisma.assetApplication.findMany({
        where,
        include: { items: true, applicant: { include: { department: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      total,
      page,
      pageSize,
      list: list.map((a) => this.toResponse(a)),
    };
  }

  async findAll(page = 1, pageSize = 10) {
    const [total, list] = await Promise.all([
      this.prisma.assetApplication.count(),
      this.prisma.assetApplication.findMany({
        include: { items: true, applicant: { include: { department: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return {
      total,
      page,
      pageSize,
      list: list.map((a) => this.toResponse(a)),
    };
  }

  async approve(id: string, user: UserContext) {
    const result = await this.stateMachine.transition(id, user, 'APPROVE');
    return this.toResponse(result!);
  }

  async reject(id: string, user: UserContext, reason: string) {
    const result = await this.stateMachine.transition(id, user, 'REJECT', reason);
    return this.toResponse(result!);
  }

  async terminate(id: string, user: UserContext) {
    const result = await this.stateMachine.transition(id, user, 'TERMINATE');
    return this.toResponse(result!);
  }

  private toResponse(app: {
    id: string;
    reason: string;
    status: ApplicationStatus;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    applicant: { id: string; username: string; department: { id: string; name: string } };
    items: { id: string; category: string; assetName: string; quantity: number; assetKey: string | null }[];
  }) {
    return {
      id: app.id,
      reason: app.reason,
      status: app.status,
      version: app.version,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      applicant: {
        id: app.applicant.id,
        username: app.applicant.username,
        departmentName: app.applicant.department.name,
      },
      items: maskApplicationItems(app.items),
    };
  }
}
