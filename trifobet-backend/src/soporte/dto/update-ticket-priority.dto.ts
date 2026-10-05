import { IsEnum } from 'class-validator';
import { TicketPriority } from './ticket-priority.enum';

export class UpdateTicketPriorityDto {
  @IsEnum(TicketPriority, {
    message: 'La prioridad debe ser baja, normal, alta o urgente',
  })
  prioridad: TicketPriority;
}
