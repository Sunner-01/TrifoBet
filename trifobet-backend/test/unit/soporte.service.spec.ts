import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SoporteService } from '../../src/soporte/soporte.service';
import { TicketPriority } from '../../src/soporte/dto/ticket-priority.enum';
import { createMockSupabaseClient } from '../helpers/supabase.mock';

jest.mock('@supabase/supabase-js');

describe('SoporteService — prioridades de tickets', () => {
  let service: SoporteService;
  let supabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    supabase = createMockSupabaseClient();
    (createClient as jest.Mock).mockReturnValue(supabase);

    service = new SoporteService({
      get: jest.fn().mockReturnValue('test-value'),
    } as unknown as ConfigService);
  });

  afterEach(() => jest.clearAllMocks());

  it('crea los tickets de jugador con prioridad normal', async () => {
    const ticket = {
      id: 10,
      usuario_id: 7,
      asunto: 'Ayuda',
      categoria: 'general',
      estado: 'abierto',
      prioridad: TicketPriority.NORMAL,
    };

    supabase.single
      .mockResolvedValueOnce({ data: ticket, error: null })
      .mockResolvedValueOnce({ data: { id: 20 }, error: null });

    await expect(service.createTicket(7, 'Ayuda', 'general')).resolves.toEqual(
      ticket,
    );

    expect(supabase.insert).toHaveBeenNthCalledWith(1, [
      expect.objectContaining({ prioridad: TicketPriority.NORMAL }),
    ]);
  });

  it('combina los filtros de estado, categoría y prioridad', async () => {
    const tickets = [{ id: 1, prioridad: TicketPriority.URGENTE }];
    supabase._setThenResult(tickets);

    await expect(
      service.getAllTickets({
        estado: 'abierto',
        categoria: 'general',
        prioridad: TicketPriority.URGENTE,
      }),
    ).resolves.toEqual(tickets);

    expect(supabase.eq).toHaveBeenCalledWith('estado', 'abierto');
    expect(supabase.eq).toHaveBeenCalledWith('categoria', 'general');
    expect(supabase.eq).toHaveBeenCalledWith(
      'prioridad',
      TicketPriority.URGENTE,
    );
  });

  it('persiste una prioridad válida y retorna el ticket actualizado', async () => {
    const updated = { id: 4, prioridad: TicketPriority.ALTA };
    supabase.single.mockResolvedValueOnce({ data: updated, error: null });

    await expect(
      service.updateTicketPriority(4, TicketPriority.ALTA),
    ).resolves.toEqual(updated);

    expect(supabase.update).toHaveBeenCalledWith({
      prioridad: TicketPriority.ALTA,
    });
    expect(supabase.eq).toHaveBeenCalledWith('id', 4);
  });

  it('propaga el error de persistencia sin devolver un ticket modificado', async () => {
    const databaseError = { message: 'database unavailable' };
    supabase.single.mockResolvedValueOnce({
      data: null,
      error: databaseError,
    });

    await expect(
      service.updateTicketPriority(4, TicketPriority.BAJA),
    ).rejects.toEqual(databaseError);
  });
});
