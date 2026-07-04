import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { CurrentUser, UserContext } from '../../common/decorators/current-user.decorator';

@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post()
  create(@Body() dto: CreateApplicationDto, @CurrentUser() user: UserContext) {
    return this.applicationsService.create(dto, user);
  }

  @Get('mine')
  findMine(
    @CurrentUser() user: UserContext,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
  ) {
    return this.applicationsService.findMine(user, Number(page), Number(pageSize));
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.applicationsService.findOne(id, user);
  }

  @Post(':id/withdraw')
  withdraw(@Param('id') id: string, @CurrentUser() user: UserContext) {
    return this.applicationsService.withdraw(id, user);
  }
}
