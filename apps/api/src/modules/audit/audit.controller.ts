import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Role, ApplicationStatus, AssetCategory } from '@prisma/client';
import { AuditService } from './audit.service';
import { Roles } from '../../common/decorators/auth.decorators';
import { SkipResponseInterceptor } from '../../common/decorators/skip-response.decorator';

@Controller('audit')
@Roles(Role.ADMIN, Role.AUDITOR)
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get('logs')
  findLogs(
    @Query('applicantId') applicantId?: string,
    @Query('applicantUsername') applicantUsername?: string,
    @Query('category') category?: AssetCategory,
    @Query('status') status?: ApplicationStatus,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return this.auditService.findLogs({
      applicantId,
      applicantUsername,
      category,
      status,
      startTime,
      endTime,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }

  @SkipResponseInterceptor()
  @Get('export')
  async export(
    @Res() res: Response,
    @Query('applicantId') applicantId?: string,
    @Query('applicantUsername') applicantUsername?: string,
    @Query('category') category?: AssetCategory,
    @Query('status') status?: ApplicationStatus,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    await this.auditService.exportExcel(
      { applicantId, applicantUsername, category, status, startTime, endTime },
      res,
    );
  }
}
