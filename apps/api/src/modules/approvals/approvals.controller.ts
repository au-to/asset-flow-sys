import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ApprovalsService } from './approvals.service';
import { RejectDto } from './dto/reject.dto';
import { Roles } from '../../common/decorators/auth.decorators';
import { CurrentUser, UserContext } from '../../common/decorators/current-user.decorator';

@Controller('approvals')
export class ApprovalsController {
  constructor(private approvalsService: ApprovalsService) {}

  @Roles(Role.MANAGER)
  @Get('pending')
  findPending(
    @CurrentUser() user: UserContext,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    return this.approvalsService.findPending(user, Number(page), Number(pageSize));
  }

  @Roles(Role.ADMIN)
  @Get('all')
  findAll(@Query('page') page = '1', @Query('pageSize') pageSize = '10') {
    return this.approvalsService.findAll(Number(page), Number(pageSize));
  }

  @Roles(Role.MANAGER)
  @Post(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.approvalsService.approve(id, user);
  }

  @Roles(Role.MANAGER)
  @Post(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectDto,
    @CurrentUser() user: UserContext,
  ) {
    return this.approvalsService.reject(id, user, dto.reason);
  }

  @Roles(Role.ADMIN)
  @Post(':id/terminate')
  terminate(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.approvalsService.terminate(id, user);
  }
}
