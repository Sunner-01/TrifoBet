import { Module } from '@nestjs/common';
import { SoporteService } from './soporte.service';
import { SoporteController } from './soporte.controller';
import { SoporteGateway } from './soporte.gateway';
import { JwtModule } from '@nestjs/jwt';
import { AdminSupportController } from './admin-support.controller';
import { AdminGuard } from '../admin/guards/admin.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [SoporteController, AdminSupportController],
  providers: [SoporteService, SoporteGateway, AdminGuard],
  exports: [SoporteService, SoporteGateway],
})
export class SoporteModule {}
