import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createClient } from '@supabase/supabase-js';
import request from 'supertest';
import { SoporteModule } from '../../src/soporte/soporte.module';
import { SoporteService } from '../../src/soporte/soporte.service';
import { AdminGuard } from '../../src/admin/guards/admin.guard';
import { AuthModule } from '../../src/auth/auth.module';
import { TicketPriority } from '../../src/soporte/dto/ticket-priority.enum';
import { createMockSupabaseClient } from '../helpers/supabase.mock';

jest.mock('@supabase/supabase-js');

describe('SOP-09 — integración HTTP', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let adminToken: string;
  let userToken: string;
  let serviceSupabase: ReturnType<typeof createMockSupabaseClient>;
  let guardSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeAll(async () => {
    (createClient as jest.Mock).mockReturnValue(createMockSupabaseClient());

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule,
        SoporteModule,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn((key: string) => {
          if (key === 'JWT_SECRET') return 'test-secret-for-jest';
          if (key === 'SUPABASE_URL') return 'http://localhost:8000';
          if (key === 'SUPABASE_ANON_KEY') return 'test-anon-key';
          return undefined;
        }),
      })
      .compile();

    serviceSupabase = createMockSupabaseClient();
    guardSupabase = createMockSupabaseClient();
    (moduleRef.get<SoporteService>(SoporteService) as any).supabase =
      serviceSupabase;
    (moduleRef.get<AdminGuard>(AdminGuard) as any).supabase = guardSupabase;

    jwtService = moduleRef.get<JwtService>(JwtService);
    adminToken = jwtService.sign(
      { sub: 1 },
      { secret: 'test-secret-for-jest' },
    );
    userToken = jwtService.sign({ sub: 2 }, { secret: 'test-secret-for-jest' });

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => app.close());

  beforeEach(() => {
    jest.clearAllMocks();
    guardSupabase.single.mockResolvedValue({
      data: { id: 1, rol_id: 1, habilitado: true },
      error: null,
    });
  });

  it('crea un ticket de jugador con prioridad normal', async () => {
    const ticket = {
      id: 12,
      usuario_id: 2,
      asunto: 'Ayuda',
      categoria: 'general',
      estado: 'abierto',
      prioridad: TicketPriority.NORMAL,
    };
    serviceSupabase.single
      .mockResolvedValueOnce({ data: ticket, error: null })
      .mockResolvedValueOnce({ data: { id: 21 }, error: null });

    const response = await request(app.getHttpServer())
      .post('/soporte/ticket')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ asunto: 'Ayuda', categoria: 'general' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(ticket);
    expect(serviceSupabase.insert).toHaveBeenNthCalledWith(1, [
      expect.objectContaining({ prioridad: TicketPriority.NORMAL }),
    ]);
  });

  it('lista tickets aplicando los tres filtros acumulativos', async () => {
    const tickets = [{ id: 8, prioridad: TicketPriority.URGENTE }];
    serviceSupabase._setThenResult(tickets);

    const response = await request(app.getHttpServer())
      .get('/admin/support/tickets')
      .query({ estado: 'abierto', categoria: 'general', prioridad: 'urgente' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(tickets);
    expect(serviceSupabase.eq).toHaveBeenCalledWith('estado', 'abierto');
    expect(serviceSupabase.eq).toHaveBeenCalledWith('categoria', 'general');
    expect(serviceSupabase.eq).toHaveBeenCalledWith('prioridad', 'urgente');
  });

  it('actualiza una prioridad válida', async () => {
    const updated = { id: 8, prioridad: TicketPriority.ALTA };
    serviceSupabase.single.mockResolvedValueOnce({
      data: updated,
      error: null,
    });

    const response = await request(app.getHttpServer())
      .patch('/admin/support/tickets/8/priority')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ prioridad: 'alta' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updated);
  });

  it('rechaza con 400 una prioridad inválida sin intentar persistirla', async () => {
    const response = await request(app.getHttpServer())
      .patch('/admin/support/tickets/8/priority')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ prioridad: 'critica' });

    expect(response.status).toBe(400);
    expect(serviceSupabase.update).not.toHaveBeenCalled();
  });

  it('responde 403 cuando un usuario no administrador intenta listar', async () => {
    guardSupabase.single.mockResolvedValueOnce({
      data: { id: 2, rol_id: 2, habilitado: true },
      error: null,
    });

    const response = await request(app.getHttpServer())
      .get('/admin/support/tickets')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('responde 403 cuando un usuario no administrador intenta modificar', async () => {
    guardSupabase.single.mockResolvedValueOnce({
      data: { id: 2, rol_id: 2, habilitado: true },
      error: null,
    });

    const response = await request(app.getHttpServer())
      .patch('/admin/support/tickets/8/priority')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ prioridad: 'urgente' });

    expect(response.status).toBe(403);
    expect(serviceSupabase.update).not.toHaveBeenCalled();
  });

  it('protege también la ruta administrativa heredada', async () => {
    guardSupabase.single.mockResolvedValueOnce({
      data: { id: 2, rol_id: 2, habilitado: true },
      error: null,
    });

    const response = await request(app.getHttpServer())
      .get('/soporte/admin/tickets')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
  });

  it('responde 500 cuando Supabase falla al actualizar', async () => {
    serviceSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'database unavailable' },
    });

    const response = await request(app.getHttpServer())
      .patch('/admin/support/tickets/8/priority')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ prioridad: 'baja' });

    expect(response.status).toBe(500);
  });
});
