import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ApplicationStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UserContext } from '../../common/decorators/current-user.decorator';
import { assertManagerOfDepartment } from '../../common/authorization/manager-scope';

export type TransitionAction = 'SUBMIT' | 'APPROVE' | 'REJECT' | 'WITHDRAW' | 'TERMINATE';

const TRANSITIONS: Record<
  ApplicationStatus,
  Partial<Record<TransitionAction, { to: ApplicationStatus; roles: Role[] }>>
> = {
  [ApplicationStatus.PENDING]: {
    APPROVE: { to: ApplicationStatus.APPROVED, roles: [Role.MANAGER] },
    REJECT: { to: ApplicationStatus.REJECTED, roles: [Role.MANAGER] },
    WITHDRAW: { to: ApplicationStatus.WITHDRAWN, roles: [Role.EMPLOYEE, Role.MANAGER, Role.ADMIN] },
    TERMINATE: { to: ApplicationStatus.TERMINATED, roles: [Role.ADMIN] },
  },
  [ApplicationStatus.APPROVED]: {},
  [ApplicationStatus.REJECTED]: {},
  [ApplicationStatus.WITHDRAWN]: {},
  [ApplicationStatus.TERMINATED]: {},
};

@Injectable()
export class StateMachineService {
  constructor(private prisma: PrismaService) {}

  async transition(
    applicationId: string,
    operator: UserContext,
    action: TransitionAction,
    reason?: string,
  ) {
    const app = await this.prisma.assetApplication.findUnique({
      where: { id: applicationId },
      include: {
        applicant: { include: { department: true } },
        items: true,
      },
    });
    if (!app) {
      throw new BadRequestException('申请单不存在');
    }

    const rule = TRANSITIONS[app.status]?.[action];
    if (!rule) {
      throw new BadRequestException(`当前状态 ${app.status} 不允许执行 ${action}`);
    }

    if (!rule.roles.includes(operator.role as Role)) {
      throw new ForbiddenException('无权执行该操作');
    }

    if (action === 'WITHDRAW' && app.applicantId !== operator.sub) {
      throw new ForbiddenException('只能撤回自己的申请单');
    }

    if ((action === 'APPROVE' || action === 'REJECT') && operator.role === Role.MANAGER) {
      await assertManagerOfDepartment(this.prisma, operator.sub, app.applicant.departmentId);
    }

    if (action === 'REJECT' && !reason?.trim()) {
      throw new BadRequestException('驳回原因不能为空');
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.assetApplication.updateMany({
        where: {
          id: app.id,
          version: app.version,
          status: app.status,
        },
        data: {
          status: rule.to,
          version: { increment: 1 },
          updatedBy: operator.username,
        },
      });

      if (updated.count === 0) {
        throw new ConflictException('单据状态已变更，请刷新后重试');
      }

      const metadata = app.items
        .filter((i) => i.assetKey)
        .map((i) => ({ assetKey: i.assetKey, category: i.category }));

      await tx.auditLog.create({
        data: {
          applicationId: app.id,
          operatorId: operator.sub,
          action,
          reason: reason ?? null,
          beforeStatus: app.status,
          afterStatus: rule.to,
          updatedBy: operator.username,
          metadata: metadata.length > 0 ? { items: metadata } : undefined,
        },
      });

      return tx.assetApplication.findUnique({
        where: { id: app.id },
        include: { items: true, applicant: { include: { department: true } } },
      });
    });
  }
}
