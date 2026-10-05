import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../admin/guards/admin.guard';
import { ListSupportTicketsQueryDto } from './dto/list-support-tickets-query.dto';
import { UpdateTicketPriorityDto } from './dto/update-ticket-priority.dto';
import { SoporteService } from './soporte.service';

@Controller('admin/support/tickets')
@UseGuards(AdminGuard)
export class AdminSupportController {
  constructor(private readonly soporteService: SoporteService) {}

  @Get()
  getTickets(@Query() query: ListSupportTicketsQueryDto) {
    return this.soporteService.getAllTickets(query);
  }

  @Patch(':id/priority')
  updatePriority(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTicketPriorityDto,
  ) {
    return this.soporteService.updateTicketPriority(id, dto.prioridad);
  }
}
