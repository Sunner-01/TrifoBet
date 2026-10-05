import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { AdminUsersService } from '../../src/admin/admin-users.service';
import { createMockSupabaseClient } from '../helpers/supabase.mock';

jest.mock('@supabase/supabase-js');

describe('ADM-10 — AdminUsersService CSV', () => {
  let service: AdminUsersService;
  let supabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    supabase = createMockSupabaseClient();
    (createClient as jest.Mock).mockReturnValue(supabase);
    service = new AdminUsersService({
      get: jest.fn().mockReturnValue('test-value'),
    } as unknown as ConfigService);
  });

  afterEach(() => jest.clearAllMocks());

  it('exporta únicamente los campos permitidos con BOM UTF-8', async () => {
    supabase._setThenResult([
      {
        id: 1,
        nombre: 'José',
        apellido1: 'Pérez',
        apellido2: 'López',
        nombre_usuario: 'josep',
        correo: 'jose@example.com',
        habilitado: true,
        verificado: false,
        created_at: '2026-01-02T03:04:05.000Z',
        contrasena_hash: 'NO_DEBE_EXPORTARSE',
        token: 'NO_DEBE_EXPORTARSE',
      },
    ]);

    const csv = await service.exportUsuariosCsv({});

    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain('"ID","Nombre completo","Nombre de usuario"');
    expect(csv).toContain('"José Pérez López"');
    expect(csv).toContain('"Habilitado","No verificado"');
    expect(csv).not.toContain('contrasena_hash');
    expect(csv).not.toContain('NO_DEBE_EXPORTARSE');
    expect(supabase.select).toHaveBeenCalledWith(
      'id, nombre, apellido1, apellido2, nombre_usuario, correo, habilitado, verificado, created_at',
    );
    expect(supabase.limit).toHaveBeenCalledWith(1001);
  });

  it('escapa comillas, comas y saltos de línea y neutraliza fórmulas', async () => {
    supabase._setThenResult([
      {
        id: 2,
        nombre: '=HYPERLINK("https://evil.test")',
        apellido1: 'Apellido,ConComa',
        apellido2: 'Línea\nNueva',
        nombre_usuario: '+SUM(1,1)',
        correo: '-malicioso@example.com',
        habilitado: false,
        verificado: true,
        created_at: '@fecha',
      },
    ]);

    const csv = await service.exportUsuariosCsv({});

    expect(csv).toContain(
      '"\'=HYPERLINK(""https://evil.test"") Apellido,ConComa Línea\nNueva"',
    );
    expect(csv).toContain('"\'+SUM(1,1)"');
    expect(csv).toContain('"\'-malicioso@example.com"');
    expect(csv).toContain('"\'@fecha"');
  });

  it('aplica los mismos filtros del listado', async () => {
    supabase._setThenResult([
      {
        id: 3,
        nombre: 'Ana',
        apellido1: 'Rojas',
        apellido2: null,
        nombre_usuario: 'ana',
        correo: 'ana@example.com',
        habilitado: true,
        verificado: true,
        created_at: '2026-01-01',
      },
    ]);

    await service.exportUsuariosCsv({
      search: 'ana',
      habilitado: 'true',
      rol_id: '2',
    });

    expect(supabase.or).toHaveBeenCalledWith(
      'nombre_usuario.ilike.%ana%,correo.ilike.%ana%,nombre.ilike.%ana%',
    );
    expect(supabase.eq).toHaveBeenCalledWith('habilitado', true);
    expect(supabase.eq).toHaveBeenCalledWith('rol_id', 2);
  });

  it('rechaza una exportación sin resultados', async () => {
    supabase._setThenResult([]);

    await expect(service.exportUsuariosCsv({})).rejects.toThrow(
      new NotFoundException('No hay usuarios para exportar'),
    );
  });

  it('rechaza más de 1.000 resultados', async () => {
    supabase._setThenResult(
      Array.from({ length: 1001 }, (_, id) => ({ id: id + 1 })),
    );

    await expect(service.exportUsuariosCsv({})).rejects.toThrow(
      BadRequestException,
    );
    await expect(service.exportUsuariosCsv({})).rejects.toThrow(
      'Debe acotar los filtros de búsqueda',
    );
  });

  it('permite exportar exactamente 1.000 resultados', async () => {
    supabase._setThenResult(
      Array.from({ length: 1000 }, (_, id) => ({
        id: id + 1,
        nombre: `Usuario ${id + 1}`,
        apellido1: null,
        apellido2: null,
        nombre_usuario: `usuario${id + 1}`,
        correo: `usuario${id + 1}@example.com`,
        habilitado: true,
        verificado: true,
        created_at: '2026-01-01',
      })),
    );

    const csv = await service.exportUsuariosCsv({});

    expect(csv.split('\r\n')).toHaveLength(1001);
  });
});
