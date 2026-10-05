import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TicketPriority } from './ticket-priority.enum';

export class ListSupportTicketsQueryDto {
  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsEnum(TicketPriority, {
    message: 'La prioridad debe ser baja, normal, alta o urgente',
  })
  prioridad?: TicketPriority;
}
