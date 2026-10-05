import { Controller, Delete, Get, Param, ParseIntPipe, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CasinoFavoritosService } from './casino-favoritos.service';

@Controller('casino-favoritos')
@UseGuards(AuthGuard('jwt'))
export class CasinoFavoritosController {
  constructor(private readonly favoritos: CasinoFavoritosService) {}

  @Get('me')
  list(@Req() req) {
    return this.favoritos.list(req.user?.userId);
  }

  @Put(':id')
  add(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.favoritos.add(req.user?.userId, id);
  }

  @Delete(':id')
  remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.favoritos.remove(req.user?.userId, id);
  }
}
