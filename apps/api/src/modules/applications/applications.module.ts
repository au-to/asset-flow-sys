import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { StateMachineService } from './state-machine.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService, StateMachineService],
  exports: [ApplicationsService, StateMachineService],
})
export class ApplicationsModule {}
