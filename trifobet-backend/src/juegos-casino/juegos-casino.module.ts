import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JuegosCasinoController } from './juegos-casino.controller';
import { JuegosCasinoService } from './juegos-casino.service';
import { CasinoFavoritosController } from './casino-favoritos.controller';
import { CasinoFavoritosService } from './casino-favoritos.service';

@Module({
  imports: [ConfigModule],
  controllers: [JuegosCasinoController, CasinoFavoritosController],
  providers: [JuegosCasinoService, CasinoFavoritosService],
})
export class JuegosCasinoModule {}
