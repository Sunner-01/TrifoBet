import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { CasinoFavoritosService } from './casino-favoritos.service';

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }));

describe('CasinoFavoritosService', () => {
  let service: CasinoFavoritosService;
  let db: { from: jest.Mock };

  function query(result: any) {
    const builder: any = {};
    for (const name of ['select', 'eq', 'insert', 'delete']) {
      builder[name] = jest.fn().mockReturnValue(builder);
    }
    builder.maybeSingle = jest.fn().mockResolvedValue(result);
    builder.then = (resolve: any, reject: any) => Promise.resolve(result).then(resolve, reject);
    return builder;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    db = { from: jest.fn() };
    (createClient as jest.Mock).mockReturnValue(db);
    service = new CasinoFavoritosService({
      get: (name: string) => name === 'SUPABASE_URL' ? 'https://example.supabase.co' : 'test-key',
    } as ConfigService);
  });

  it('lista únicamente los favoritos del usuario del JWT y juegos habilitados', async () => {
    const q = query({ data: [{ juego_casino_id: 9 }], error: null });
    db.from.mockReturnValue(q);
    await expect(service.list(7)).resolves.toEqual([9]);
    expect(q.eq).toHaveBeenCalledWith('usuario_id', 7);
    expect(q.eq).toHaveBeenCalledWith('juego_casino.habilitado', true);
  });

  it('rechaza una sesión sin identificador válido antes de consultar la base', async () => {
    await expect(service.list(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(db.from).not.toHaveBeenCalled();
  });

  it('no agrega un juego inexistente o deshabilitado', async () => {
    db.from.mockReturnValue(query({ data: null, error: null }));
    await expect(service.add(7, 9)).rejects.toBeInstanceOf(NotFoundException);
    expect(db.from).toHaveBeenCalledTimes(1);
  });

  it('guarda usando el propietario de la sesión', async () => {
    const insert = query({ error: null });
    db.from.mockReturnValueOnce(query({ data: { id: 9 }, error: null })).mockReturnValueOnce(insert);
    await expect(service.add(7, 9)).resolves.toEqual({ juego_casino_id: 9, favorito: true });
    expect(insert.insert).toHaveBeenCalledWith({ usuario_id: 7, juego_casino_id: 9 });
  });

  it('acepta repetir el alta sin duplicar el favorito', async () => {
    db.from.mockReturnValueOnce(query({ data: { id: 9 }, error: null }))
      .mockReturnValueOnce(query({ error: { code: '23505' } }));
    await expect(service.add(7, 9)).resolves.toEqual({ juego_casino_id: 9, favorito: true });
  });

  it('la eliminación se limita al usuario y juego solicitados, incluso si ya no existe', async () => {
    const q = query({ error: null });
    db.from.mockReturnValue(q);
    await expect(service.remove(7, 9)).resolves.toEqual({ juego_casino_id: 9, favorito: false });
    expect(q.eq).toHaveBeenCalledWith('usuario_id', 7);
    expect(q.eq).toHaveBeenCalledWith('juego_casino_id', 9);
  });

  it('no informa éxito cuando falla el almacenamiento', async () => {
    db.from.mockReturnValueOnce(query({ data: { id: 9 }, error: null }))
      .mockReturnValueOnce(query({ error: { code: '42501' } }));
    await expect(service.add(7, 9)).rejects.toBeInstanceOf(InternalServerErrorException);
  });
});
