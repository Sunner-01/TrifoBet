// lib/api.js
// Utilidades para hacer llamadas HTTP al backend

import { API_Back_Url } from './config';
import { getStoredToken, clearAuth } from './auth';

/**
 * Realiza una petición fetch con autenticación automática
 * @param {string} endpoint - Endpoint relativo (ej: '/perfil/me')
 * @param {object} options - Opciones de fetch
 * @returns {Promise<any>} Respuesta JSON
 * @throws {Error} Si la petición falla
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getStoredToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Agregar token si existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_Back_Url}${endpoint}`, config);

    // Si es 401 (no autorizado), limpiar sesión
    if (response.status === 401) {
      clearAuth();
      window.location.href = '/';
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    // Si no es OK, lanzar error con el mensaje del backend
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error en la petición' }));
      let errorMessage = error.message;
      if (Array.isArray(errorMessage)) {
        errorMessage = errorMessage.join('. ');
      }
      throw new Error(errorMessage || `Error ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// GET request helper

export const apiGet = (endpoint) => apiFetch(endpoint, { method: 'GET' });

// POST request helper
 
export const apiPost = (endpoint, data) => apiFetch(endpoint, {
  method: 'POST',
  body: JSON.stringify(data),
});

// PATCH request helper
 
export const apiPatch = (endpoint, data) => apiFetch(endpoint, {
  method: 'PATCH',
  body: JSON.stringify(data),
});

// DELETE request helper
 
export const apiDelete = (endpoint) => apiFetch(endpoint, { method: 'DELETE' });
