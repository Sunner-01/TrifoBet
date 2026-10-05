// lib/auth.js
//Utilidades para manejo de autenticación JWT
/**
 * Obtiene el token almacenado en localStorage
 * @returns {string|null} Token JWT o null si no existe
 */
export const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Obtiene los datos del usuario almacenados en localStorage
 * @returns {object|null} Datos del usuario o null si no existen
 */
export const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Guarda el token y datos del usuario en localStorage
 * @param {string} token - Token JWT
 * @param {object} user - Datos del usuario
 */
export const saveAuth = (token, user) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new CustomEvent('auth-change', { detail: { user, token } }));
};

/**
 * Limpia toda la información de autenticación
 */
export const clearAuth = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('auth-change'));
};

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} true si hay token, false si no
 */
export const isAuthenticated = () => {
  return !!getStoredToken();
};
