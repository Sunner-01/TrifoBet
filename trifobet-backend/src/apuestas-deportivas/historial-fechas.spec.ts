import { BadRequestException, UnauthorizedException, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import request from 'supertest';
import { createClient } from '@supabase/supabase-js';
import { historyDateBounds, parseHistoryNumber } from './dto/historial-filtros';
import { ApuestasQueryService } from './services/apuestas-query.service';
import { ApuestasCoreService } from './services/apuestas-core.service';
import { ApuestasDeportivasController } from './apuestas-deportivas.controller';
import { JwtStrategy } from '../auth/jwt.strategy';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

describe('TRIFO-76: límites y validación', () => {
  it('convierte un día de Bolivia en un intervalo UTC completo y exclusivo al final', () => {
    expect(historyDateBounds('2026-10-05', '2026-10-05')).toEqual({
      from: '2026-10-05T04:00:00.000Z', before: '2026-10-06T04:00:00.000Z',
    });
  });
  it('admite límites independientes y ausencia de fechas', () => {
    expect(historyDateBounds()).toEqual({ from: undefined, before: undefined });
    expect(historyDateBounds('2026-10-05').before).toBeUndefined();
    expect(historyDateBounds(undefined, '2026-10-05').from).toBeUndefined();
  });
  it.each(['2026-02-30', '2026-02-29', '05/10/2026', '', '2026-10-05T00:00:00Z'])('rechaza fecha inválida %s', (date) => {
    expect(() => historyDateBounds(date)).toThrow(BadRequestException);
  });
  it('admite un 29 de febrero válido y el cambio de año', () => {
    expect(historyDateBounds(undefined, '2024-02-29').before).toBe('2024-03-01T04:00:00.000Z');
    expect(historyDateBounds(undefined, '2026-12-31').before).toBe('2027-01-01T04:00:00.000Z');
  });
  it('rechaza un rango invertido', () => {
    expect(() => historyDateBounds('2026-10-06', '2026-10-05')).toThrow(BadRequestException);
  });
  it('no acepta números parciales ni decimales como paginación', () => {
    expect(parseHistoryNumber(undefined, 20, 'limit')).toBe(20);
    expect(() => parseHistoryNumber('20abc', 20, 'limit')).toThrow(BadRequestException);
    expect(() => parseHistoryNumber('1.5', 0, 'offset')).toThrow(BadRequestException);
  });
});

describe('TRIFO-76: historial filtrado y paginado', () => {
  let service: ApuestasQueryService;
  let queries: any[];
  const row = (id: number, time: string, user = 7, estado = 'ganada') => ({
    id, fecha_creacion: time, usuario_id: user, estado, tipo: 'simple',
    monto: '10', cuota_total: '2', ganancia_potencial: '20', fecha_procesado: null,
  });
  const rows = [
    row(1, '2026-10-05T03:59:59.999Z'),
    row(2, '2026-10-05T04:00:00.000Z'),
    row(3, '2026-10-06T03:59:59.999Z'),
    row(4, '2026-10-06T04:00:00.000Z'),
    row(5, '2026-10-05T12:00:00.000Z', 8),
    row(6, '2026-10-05T12:00:00.000Z', 7, 'pendiente'),
  ];

  beforeEach(() => {
    queries = [];
    const db = {
      from: (table: string) => {
        const predicates: ((row: any) => boolean)[] = [];
        const orders: string[] = [];
        let bounds: [number, number] | undefined;
        const q: any = {
          select: () => q,
          eq: (column: string, value: any) => { predicates.push(row => row[column] === value); return q; },
          gte: (column: string, value: string) => { predicates.push(row => row[column] >= value); return q; },
          lt: (column: string, value: string) => { predicates.push(row => row[column] < value); return q; },
          order: (column: string) => { orders.push(column); return q; },
          range: (start: number, end: number) => { bounds = [start, end]; return q; },
          then: (resolve: any, reject: any) => {
            const matching = (table === 'apuesta' ? rows : []).filter(row => predicates.every(p => p(row)));
            matching.sort((a, b) => {
              for (const column of orders) {
                if (a[column] !== b[column]) return a[column] < b[column] ? 1 : -1;
              }
              return 0;
            });
            const data = bounds ? matching.slice(bounds[0], bounds[1] + 1) : matching;
            return Promise.resolve({ data, count: matching.length, error: null }).then(resolve, reject);
          },
        };
        queries.push(q);
        return q;
      },
    };
    (createClient as jest.Mock).mockReturnValue(db);
    service = new ApuestasQueryService({ get: () => 'test-value' } as unknown as ConfigService);
  });

  it('filtra fechas y propietario antes de contar y paginar', async () => {
    const result = await service.obtenerHistorial(7, undefined, 1, 0, '2026-10-05', '2026-10-05');
    expect(result.total).toBe(3);
    expect(result.apuestas.map(a => a.id)).toEqual([3]);
    const next = await service.obtenerHistorial(7, undefined, 1, 1, '2026-10-05', '2026-10-05');
    expect(next.total).toBe(3);
    expect(next.apuestas.map(a => a.id)).toEqual([6]);
    expect(next.pagina).toBe(2);
  });
  it('combina estado y fechas; incluye inicio y último milisegundo, excluye día siguiente', async () => {
    const result = await service.obtenerHistorial(7, 'ganada', 20, 0, '2026-10-05', '2026-10-05');
    expect(result.total).toBe(2);
    expect(result.apuestas.map(a => a.id)).toEqual([3, 2]);
  });
  it('sin fechas mantiene el historial del usuario y el contrato anterior', async () => {
    const result = await service.obtenerHistorial(7);
    expect(result.total).toBe(5);
    expect(result.porPagina).toBe(20);
    expect(result.apuestas.every(a => a.usuarioId === 7)).toBe(true);
  });
  it('devuelve una lista y total vacíos cuando no hay coincidencias', async () => {
    const result = await service.obtenerHistorial(7, undefined, 20, 0, '2027-01-01');
    expect(result.apuestas).toEqual([]);
    expect(result.total).toBe(0);
  });
  it('rechaza una sesión inválida o paginación peligrosa antes de consultar', async () => {
    await expect(service.obtenerHistorial(undefined as any)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.obtenerHistorial(7, undefined, 0)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.obtenerHistorial(7, undefined, 101)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.obtenerHistorial(7, undefined, 20, -1)).rejects.toBeInstanceOf(BadRequestException);
    expect(queries).toHaveLength(0);
  });
});

describe('TRIFO-76: endpoint protegido', () => {
  let app: INestApplication;
  let jwt: JwtService;
  const queryService = { obtenerHistorial: jest.fn().mockResolvedValue({ apuestas: [], total: 0, pagina: 1, porPagina: 20 }) };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule, JwtModule.register({ secret: 'trifo-76-test-secret' })],
      controllers: [ApuestasDeportivasController],
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: { get: () => 'trifo-76-test-secret' } },
        { provide: ApuestasCoreService, useValue: {} },
        { provide: ApuestasQueryService, useValue: queryService },
      ],
    }).compile();
    app = module.createNestApplication();
    jwt = module.get(JwtService);
    await app.init();
  });
  afterAll(async () => { await app.close(); });
  beforeEach(() => jest.clearAllMocks());

  it('responde 401 sin JWT', async () => {
    await request(app.getHttpServer()).get('/apuestas-deportivas/historial?desde=2026-10-05').expect(401);
    expect(queryService.obtenerHistorial).not.toHaveBeenCalled();
  });
  it('pasa fechas y paginación, tomando propietario del JWT y no de la query', async () => {
    const token = jwt.sign({ sub: 7 });
    await request(app.getHttpServer())
      .get('/apuestas-deportivas/historial?desde=2026-10-05&hasta=2026-10-06&limit=10&offset=10&usuario_id=8')
      .set('Authorization', `Bearer ${token}`).expect(200);
    expect(queryService.obtenerHistorial).toHaveBeenCalledWith(7, undefined, 10, 10, '2026-10-05', '2026-10-06');
  });
  it('rechaza una paginación inválida por HTTP', async () => {
    const token = jwt.sign({ sub: 7 });
    await request(app.getHttpServer()).get('/apuestas-deportivas/historial?limit=20abc')
      .set('Authorization', `Bearer ${token}`).expect(400);
    expect(queryService.obtenerHistorial).not.toHaveBeenCalled();
  });
});
