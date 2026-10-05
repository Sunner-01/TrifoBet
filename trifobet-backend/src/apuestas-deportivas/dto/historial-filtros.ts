import { BadRequestException } from '@nestjs/common';

export function parseHistoryNumber(value: string | undefined, fallback: number, name: string): number {
  if (value === undefined) return fallback;
  if (!/^\d+$/.test(value)) throw new BadRequestException(`${name} debe ser un entero`);
  const result = Number(value);
  if (!Number.isSafeInteger(result)) throw new BadRequestException(`${name} no es válido`);
  return result;
}

function startOfBoliviaDay(value: string, field: string): number {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException(`${field} debe tener formato YYYY-MM-DD`);
  }
  const utc = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(utc) || new Date(utc).toISOString().slice(0, 10) !== value) {
    throw new BadRequestException(`${field} no es una fecha válida`);
  }
  // America/La_Paz: UTC-04:00 para las fechas actuales del proyecto.
  return utc + 4 * 60 * 60 * 1000;
}

export function historyDateBounds(desde?: string, hasta?: string) {
  const start = desde === undefined ? undefined : startOfBoliviaDay(desde, 'desde');
  const end = hasta === undefined ? undefined : startOfBoliviaDay(hasta, 'hasta');
  if (start !== undefined && end !== undefined && start > end) {
    throw new BadRequestException('Desde no puede ser posterior a hasta');
  }
  return {
    from: start === undefined ? undefined : new Date(start).toISOString(),
    // Límite exclusivo del día siguiente: incluye milisegundos del último día.
    before: end === undefined ? undefined : new Date(end + 24 * 60 * 60 * 1000).toISOString(),
  };
}
