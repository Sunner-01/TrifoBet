import {
  Injectable, InternalServerErrorException, NotFoundException,
  ServiceUnavailableException, UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class CasinoFavoritosService {
  private client?: SupabaseClient;

  constructor(private readonly config: ConfigService) {}

  private db(): SupabaseClient {
    if (!this.client) {
      const url = this.config.get<string>('SUPABASE_URL');
      const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || this.config.get<string>('SUPABASE_ANON_KEY');
      if (!url || !key) {
        throw new ServiceUnavailableException('El servicio de favoritos no está configurado');
      }
      this.client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return this.client;
  }

  private userId(value: unknown): number {
    const id = Number(value);
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new UnauthorizedException('Sesión inválida');
    }
    return id;
  }

  async list(value: unknown) {
    const usuarioId = this.userId(value);
    const { data, error } = await this.db()
      .from('favorito_casino')
      .select('juego_casino_id, juego_casino!inner(id, habilitado)')
      .eq('usuario_id', usuarioId)
      .eq('juego_casino.habilitado', true);
    if (error) throw new InternalServerErrorException('No se pudieron cargar tus favoritos');
    return (data ?? []).map((row) => Number(row.juego_casino_id));
  }

  async add(value: unknown, gameId: number) {
    const usuarioId = this.userId(value);
    const db = this.db();
    const { data: game, error: gameError } = await db
      .from('juego_casino').select('id').eq('id', gameId)
      .eq('habilitado', true).maybeSingle();
    if (gameError) throw new InternalServerErrorException('No se pudo consultar el juego');
    if (!game) throw new NotFoundException('El juego no existe o no está habilitado');

    const { error } = await db.from('favorito_casino').insert({
      usuario_id: usuarioId, juego_casino_id: gameId,
    });
    // La clave compuesta garantiza que repetir la operación no duplique filas.
    if (error && error.code !== '23505') {
      throw new InternalServerErrorException('No se pudo guardar el favorito');
    }
    return { juego_casino_id: gameId, favorito: true };
  }

  async remove(value: unknown, gameId: number) {
    const usuarioId = this.userId(value);
    const { error } = await this.db().from('favorito_casino').delete()
      .eq('usuario_id', usuarioId).eq('juego_casino_id', gameId);
    if (error) throw new InternalServerErrorException('No se pudo quitar el favorito');
    return { juego_casino_id: gameId, favorito: false };
  }
}
