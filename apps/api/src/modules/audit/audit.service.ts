import { Injectable } from '@nestjs/common';
import { ApplicationStatus, AssetCategory, Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { maskAssetKey } from '@asset-flow/shared';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditQueryDto {
  applicantId?: string;
  applicantUsername?: string;
  category?: AssetCategory;
  status?: ApplicationStatus;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  private buildWhere(query: AuditQueryDto): Prisma.AuditLogWhereInput {
    const applicationWhere: Prisma.AssetApplicationWhereInput = {};

    if (query.status) {
      applicationWhere.status = query.status;
    }
    if (query.startTime || query.endTime) {
      applicationWhere.createdAt = {};
      if (query.startTime) applicationWhere.createdAt.gte = new Date(query.startTime);
      if (query.endTime) applicationWhere.createdAt.lte = new Date(query.endTime);
    }
    if (query.applicantId) {
      applicationWhere.applicantId = query.applicantId;
    }
    if (query.applicantUsername?.trim()) {
      applicationWhere.applicant = {
        username: { contains: query.applicantUsername.trim(), mode: 'insensitive' },
      };
    }
    if (query.category) {
      applicationWhere.items = { some: { category: query.category } };
    }

    if (Object.keys(applicationWhere).length === 0) {
      return {};
    }

    return { application: applicationWhere };
  }

  async findLogs(query: AuditQueryDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = this.buildWhere(query);

    const [total, list] = await Promise.all([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        include: {
          operator: true,
          application: {
            include: {
              applicant: true,
              items: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      page,
      pageSize,
      list: list.map((log) => this.toResponse(log)),
    };
  }

  async exportExcel(query: AuditQueryDto, res: Response) {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.xlsx');

    const workbook = new ExcelJS.stream.xlsx.WorkbookWriter({ stream: res });
    const sheet = workbook.addWorksheet('审计日志');
    sheet
      .addRow([
        '操作时间',
        '操作人',
        '动作',
        '驳回原因',
        '前置状态',
        '后置状态',
        '资产Key',
        '申请人',
        '单据状态',
      ])
      .commit();

    const where = this.buildWhere(query);
    const BATCH_SIZE = 500;
    let cursor: string | undefined;

    while (true) {
      const batch = await this.prisma.auditLog.findMany({
        take: BATCH_SIZE,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        where,
        orderBy: { id: 'asc' },
        include: {
          operator: true,
          application: { include: { applicant: true } },
        },
      });

      if (batch.length === 0) break;

      for (const log of batch) {
        const metadata = log.metadata as { assetKey?: string; items?: { assetKey?: string }[] } | null;
        const rawKey =
          metadata?.assetKey ??
          metadata?.items?.find((i) => i.assetKey)?.assetKey ??
          '';
        sheet
          .addRow([
            log.createdAt.toISOString(),
            log.operator.username,
            log.action,
            log.reason ?? '',
            log.beforeStatus ?? '',
            log.afterStatus,
            maskAssetKey(rawKey),
            log.application.applicant.username,
            log.application.status,
          ])
          .commit();
      }

      cursor = batch[batch.length - 1].id;
      if (batch.length < BATCH_SIZE) break;
    }

    await workbook.commit();
  }

  private toResponse(log: {
    id: string;
    action: string;
    reason: string | null;
    beforeStatus: ApplicationStatus | null;
    afterStatus: ApplicationStatus;
    metadata: unknown;
    createdAt: Date;
    operator: { id: string; username: string };
    application: {
      id: string;
      status: ApplicationStatus;
      applicant: { id: string; username: string };
      items: { category: AssetCategory; assetKey: string | null }[];
    };
  }) {
    const metadata = log.metadata as { assetKey?: string; items?: { assetKey?: string; category: string }[] } | null;
    const rawKey =
      metadata?.assetKey ??
      metadata?.items?.find((i) => i.assetKey)?.assetKey ??
      log.application.items.find((i) => i.assetKey)?.assetKey ??
      null;

    return {
      id: log.id,
      action: log.action,
      reason: log.reason,
      beforeStatus: log.beforeStatus,
      afterStatus: log.afterStatus,
      createdAt: log.createdAt,
      operator: { id: log.operator.id, username: log.operator.username },
      applicant: {
        id: log.application.applicant.id,
        username: log.application.applicant.username,
      },
      applicationId: log.application.id,
      applicationStatus: log.application.status,
      assetKey: maskAssetKey(rawKey),
    };
  }
}
