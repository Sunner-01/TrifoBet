// lib/constants.ts
// Constantes centralizadas del panel administrativo (DRY: un único lugar para definirlas).

/**
 * Mapa de roles del sistema.
 * Usar estas constantes en lugar de números literales ("magic numbers") hace que
 * el código sea autoexplicativo (KISS) y que los cambios de ID de rol se propaguen
 * automáticamente a todo el proyecto.
 */
export const ROL = {
  SUPERADMIN: 1,
  MODERADOR:  3,
  SOPORTE:    5,
  CAJERO:     6,
} as const;

/**
 * Conjunto de roles con acceso al panel administrativo.
 * Derivado automáticamente de ROL para evitar duplicación (DRY).
 */
export const ROLES_CON_ACCESO_ADMIN: number[] = Object.values(ROL);
