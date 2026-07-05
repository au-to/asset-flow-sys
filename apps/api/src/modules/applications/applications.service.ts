import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserContext } from '../../common/decorators/current-user.decorator';
import { CreateApplicationDto } from './dto/create-application.dto';
import { enrichItemsWithKeys, maskApplicationItems } from './application.mapper';
import { StateMachineService } from './state-machine.service';

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private stateMachine: StateMachineService,
  ) {}

  async create(dto: CreateApplicationDto, user: UserContext) {
    const items = enrichItemsWithKeys(dto.items).map((item) => ({
      ...item,
      updatedBy: user.username,
    }));

    const app = await this.prisma.$transaction(async (tx) => {
      const created = await tx.assetApplication.create({
        data: {
          applicantId: user.sub,
          reason: dto.reason,
          status: ApplicationStatus.PENDING,
          updatedBy: user.username,
          items: { create: items },
        },
        include: { items: true, applicant: { include: { department: true } } },
      });

      await tx.auditLog.create({
        data: {
          applicationId: created.id,
          operatorId: user.sub,
          action: 'SUBMIT',
          beforeStatus: null,
          afterStatus: ApplicationStatus.PENDING,
          metadata: {
            items: created.items.map((i) => ({
              assetKey: i.assetKey,
              category: i.category,
            })),
          },
        },
      });

      return created;
    });

    return this.toResponse(app);
  }

  async findMine(user: UserContext, page = 1, pageSize = 10) {
    const where = { applicantId: user.sub };
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

  async findOne(id: string, user: UserContext) {
    const app = await this.prisma.assetApplication.findUnique({
      where: { id },
      include: { items: true, applicant: { include: { department: true } } },
    });
    if (!app) {
      throw new NotFoundException('申请单不存在');
    }
    await this.assertCanView(app, user);
    return this.toResponse(app);
  }

  async withdraw(id: string, user: UserContext) {
    const result = await this.stateMachine.transition(id, user, 'WITHDRAW');
    return this.toResponse(result!);
  }

  private async assertCanView(
    app: { applicantId: string; applicant: { departmentId: string } },
    user: UserContext,
  ) {
    if (user.role === Role.ADMIN || user.role === Role.AUDITOR) return;
    if (user.role === Role.MANAGER) {
      const department = await this.prisma.department.findUnique({
        where: { id: app.applicant.departmentId },
        select: { managerId: true },
      });
      if (department?.managerId === user.sub) return;
    }
    if (app.applicantId === user.sub) return;
    throw new ForbiddenException('无权查看该申请单');
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
