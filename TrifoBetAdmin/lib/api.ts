// lib/api.ts
// Cliente centralizado para comunicación con el backend NestJS

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://trifobetbackend.onrender.com'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('admin_token')
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_token')
      sessionStorage.removeItem('admin_user')
      window.location.href = '/'
    }
    const err = await res.json().catch(() => ({ message: 'Error desconocido' }))
    throw new Error(err.message || `Error ${res.status}`)
  }

  return res.json()
}

//  Auth
export async function loginAdmin(correo: string, contrasena: string) {
  return request<{
    access_token: string
    usuario: {
      id_usuario: number
      nombre: string
      nombre_usuario: string
      correo: string
      rol_id: number
    }
  }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ correo, contrasena }),
  })
}

//  Admin: Estadísticas 
export async function getAdminStats() {
  return request<{
    totalUsuarios: number
    usuariosActivos: number
    usuariosSuspendidos: number
    saldoTotalEnCuentas: number
    nuevosUltimos7Dias: number
  }>('/admin/stats')
}

export async function getDashboardStats(range: string = '7d') {
  return request<any>(`/admin/dashboard-stats?range=${range}`)
}

//  Admin: Usuarios 
export interface UsuarioAdmin {
  id: number
  nombre: string
  apellido1: string
  apellido2: string
  nombre_usuario: string
  correo: string
  telefono: string
  pais_codigo: string
  saldo: number
  habilitado: boolean
  verificado: boolean
  foto_perfil_url: string | null
  created_at: string
  ultimo_inicio_sesion: string | null
  rol_id: number
  ci?: string
  fecha_nacimiento?: string
}

export interface UsuariosResponse {
  data: UsuarioAdmin[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getUsuarios(params?: {
  page?: number
  limit?: number
  search?: string
  habilitado?: string
  rol_id?: string
}): Promise<UsuariosResponse> {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.search) qs.set('search', params.search)
  if (params?.habilitado !== undefined) qs.set('habilitado', params.habilitado)
  if (params?.rol_id) qs.set('rol_id', params.rol_id)

  return request<UsuariosResponse>(`/admin/usuarios?${qs.toString()}`)
}

export async function getUsuario(id: number): Promise<UsuarioAdmin> {
  return request<UsuarioAdmin>(`/admin/usuarios/${id}`)
}

export async function toggleHabilitarUsuario(id: number) {
  return request<{ id: number; habilitado: boolean; mensaje: string }>(
    `/admin/usuarios/${id}/habilitar`,
    { method: 'PATCH' }
  )
}

export async function updateUsuario(id: number, data: Partial<UsuarioAdmin>) {
  return request<UsuarioAdmin>(`/admin/usuarios/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

//  Admin: Verificaciones KYC
export interface VerificacionAdmin {
  id: number
  usuario_id: number
  url_imagen_anverso: string
  url_imagen_reverso: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  notas_rechazo: string | null
  revisado_por: number | null
  fecha_subida: string
  fecha_revision: string | null
  usuario: {
    id: number
    nombre: string
    apellido1: string
    correo: string
    ci: string
    verificado: boolean
  }
}

export interface VerificacionesResponse {
  data: VerificacionAdmin[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function getVerificaciones(params?: {
  page?: number
  limit?: number
  estado?: string
}): Promise<VerificacionesResponse> {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.estado) qs.set('estado', params.estado)

  return request<VerificacionesResponse>(`/admin/verificaciones?${qs.toString()}`)
}

export async function procesarVerificacion(id: number, accion: 'aprobar' | 'rechazar', motivo?: string) {
  return request<{ message: string; id: number; estado: string }>(`/admin/verificaciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ accion, motivo }),
  })
}

//  Admin: Apuestas 

export async function getTodasApuestas(params?: {
  page?: number
  limit?: number
  search?: string
  estado?: string
}) {
  const qs = new URLSearchParams()
  if (params?.page) qs.set('page', String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  if (params?.search) qs.set('search', params.search)
  if (params?.estado) qs.set('estado', params.estado)

  return request<any>(`/admin/apuestas?${qs.toString()}`)
}

export async function getEstadisticasApuestas() {
  return request<any>('/admin/apuestas/stats')
}

//  Admin: Personal 

export async function getPersonal(params: { page?: number; limit?: number; search?: string }) {
  const q = new URLSearchParams()
  if (params.page) q.append('page', params.page.toString())
  if (params.limit) q.append('limit', params.limit.toString())
  if (params.search) q.append('search', params.search)
  return request<any>(`/admin/personal?${q.toString()}`)
}

export async function createPersonal(dto: any) {
  return request<any>('/admin/personal', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function updatePersonal(id: number, dto: any) {
  return request<any>(`/admin/personal/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  })
}

export async function toggleHabilitarPersonal(id: number) {
  return request<any>(`/admin/personal/${id}/toggle-habilitado`, { method: 'PUT' })
}

export async function resetPasswordPersonal(id: number) {
  return request<any>(`/admin/personal/${id}/reset-password`, { method: 'PUT' })
}

export async function getPersonalStats(id: number) {
  return request<any>(`/admin/personal/${id}/stats`)
}

//  Admin: Juegos Casino
export interface JuegoCasino {
  id: number;
  nombre: string;
  categoria: string;
  proveedor: string;
  rtp: number;
  habilitado: boolean;
  es_demo: boolean;
  imagen_url: string;
  descripcion: string;
  url_juego: string;
  created_at: string;
  // stats opcionales (por implementar en backend)
  jugadoresActivos?: number;
  ingresoHoy?: number;
  // stats avanzadas reales
  montoApostado?: number;
  montoRetorno?: number;
  gananciaNeta?: number;
  partidasJugadas?: number;
}

export async function getJuegosAdmin() {
  return request<JuegoCasino[]>('/admin/juegos-casino')
}

export async function getJuegosAdminStats() {
  return request<JuegoCasino[]>('/admin/juegos-casino/stats')
}

export async function createJuego(dto: any) {
  return request<JuegoCasino>('/admin/juegos-casino', {
    method: 'POST',
    body: JSON.stringify(dto),
  })
}

export async function updateJuego(id: number, dto: any) {
  return request<JuegoCasino>(`/admin/juegos-casino/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  })
}

export async function deleteJuego(id: number) {
  return request<{ message: string }>(`/admin/juegos-casino/${id}`, {
    method: 'DELETE',
  })
}
