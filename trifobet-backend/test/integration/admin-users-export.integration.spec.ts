import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { createClient } from '@supabase/supabase-js';
import request from 'supertest';
import { AdminController } from '../../src/admin/admin.controller';
import { AdminApuestasService } from '../../src/admin/admin-apuestas.service';
import { AdminDashboardService } from '../../src/admin/admin-dashboard.service';
import { AdminJuegosCasinoService } from '../../src/admin/admin-juegos-casino.service';
import { AdminUsersService } from '../../src/admin/admin-users.service';
import { AdminVerificacionService } from '../../src/admin/admin-verificacion.service';
import { AdminGuard } from '../../src/admin/guards/admin.guard';
import { createMockSupabaseClient } from '../helpers/supabase.mock';

jest.mock('@supabase/supabase-js');

describe('ADM-10 — exportación CSV HTTP', () => {
  let app: INestApplication;
  let adminToken: string;
  let userToken: string;
  let serviceSupabase: ReturnType<typeof createMockSupabaseClient>;
  let guardSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeAll(async () => {
    (createClient as jest.Mock).mockReturnValue(createMockSupabaseClient());

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        JwtModule.register({ secret: 'test-secret-for-jest' }),
      ],
      controllers: [AdminController],
      providers: [
        AdminGuard,
        AdminUsersService,
        { provide: AdminApuestasService, useValue: {} },
        { provide: AdminDashboardService, useValue: {} },
        { provide: AdminVerificacionService, useValue: {} },
        { provide: AdminJuegosCasinoService, useValue: {} },
      ],
    }).compile();

    serviceSupabase = createMockSupabaseClient();
    guardSupabase = createMockSupabaseClient();
    (moduleRef.get<AdminUsersService>(AdminUsersService) as any).supabase =
      serviceSupabase;
    (moduleRef.get<AdminGuard>(AdminGuard) as any).supabase = guardSupabase;

    const jwtService = moduleRef.get<JwtService>(JwtService);
    adminToken = jwtService.sign({ sub: 1 });
    userToken = jwtService.sign({ sub: 2 });

    app = moduleRef.createNestApplication();
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

  it('descarga el CSV completo con cabeceras correctas', async () => {
    serviceSupabase._setThenResult([
      {
        id: 1,
        nombre: 'María',
        apellido1: 'Núñez',
        apellido2: null,
        nombre_usuario: 'maria',
        correo: 'maria@example.com',
        habilitado: true,
        verificado: true,
        created_at: '2026-01-01T00:00:00.000Z',
      },
    ]);

    const response = await request(app.getHttpServer())
      .get('/admin/users/export/csv')
      .query({ search: 'maria', habilitado: 'true' })
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
    expect(response.headers['content-disposition']).toBe(
      'attachment; filename="usuarios_export.csv"',
    );
    expect(response.text.charCodeAt(0)).toBe(0xfeff);
    expect(response.text).toContain('"María Núñez"');
    expect(serviceSupabase.range).not.toHaveBeenCalled();
    expect(serviceSupabase.limit).toHaveBeenCalledWith(1001);
  });

  it('retorna 404 cuando no existen usuarios coincidentes', async () => {
    serviceSupabase._setThenResult([]);

    const response = await request(app.getHttpServer())
      .get('/admin/users/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No hay usuarios para exportar');
  });

  it('retorna 400 cuando la exportación supera 1.000 usuarios', async () => {
    serviceSupabase._setThenResult(
      Array.from({ length: 1001 }, (_, id) => ({ id: id + 1 })),
    );

    const response = await request(app.getHttpServer())
      .get('/admin/users/export/csv')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('acotar los filtros');
  });

  it('retorna 403 para un usuario sin rol administrativo', async () => {
    guardSupabase.single.mockResolvedValueOnce({
      data: { id: 2, rol_id: 2, habilitado: true },
      error: null,
    });

    const response = await request(app.getHttpServer())
      .get('/admin/users/export/csv')
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(serviceSupabase.select).not.toHaveBeenCalled();
  });
});
