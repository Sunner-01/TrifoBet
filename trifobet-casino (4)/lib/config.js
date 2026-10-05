// lib/config.js
/**
 * Configuración centralizada de la aplicación
 * Las variables de entorno deben estar definidas en .env.local
 */

export const API_Back_Url = process.env.API_Back_Url || process.env.NEXT_PUBLIC_API_Back_Url || 'http://localhost:3000';

// Validación en desarrollo
if (process.env.NODE_ENV === 'development' && !process.env.API_Back_Url && !process.env.NEXT_PUBLIC_API_Back_Url) {
  console.warn('⚠️ API_Back_Url no está configurada. Usando valor por defecto: http://localhost:3000');
  console.warn('📝 Crea un archivo .env.local con: API_Back_Url=http://localhost:3000');
}
