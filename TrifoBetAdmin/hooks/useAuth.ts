'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/lib/api'
import { ROLES_CON_ACCESO_ADMIN } from '@/lib/constants'

export interface AuthUser {
  id: number
  correo: string
  nombre: string
  nombre_usuario: string
  rol_id: number
}

interface UseAuthReturn {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  error: string | null
}

export function useAuth(): UseAuthReturn {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar sesión guardada al montar
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('admin_token')
      const userData = sessionStorage.getItem('admin_user')

      if (token && userData) {
        try {
          const parsed = JSON.parse(userData)
          setUser(parsed)
        } catch {
          sessionStorage.removeItem('admin_token')
          sessionStorage.removeItem('admin_user')
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginAdmin(email, password)

      // Solo los roles administrativos pueden acceder al panel (KISS: la validación se explica sola)
      if (!ROLES_CON_ACCESO_ADMIN.includes(result.usuario.rol_id)) {
        throw new Error('Acceso denegado: cuenta no autorizada para el panel administrativo')
      }

      const userData: AuthUser = {
        id: result.usuario.id_usuario,
        correo: result.usuario.correo,
        nombre: result.usuario.nombre,
        nombre_usuario: result.usuario.nombre_usuario,
        rol_id: result.usuario.rol_id,
      }

      sessionStorage.setItem('admin_token', result.access_token)
      sessionStorage.setItem('admin_user', JSON.stringify(userData))
      setUser(userData)

      router.push('/dashboard')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error de autenticación'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      sessionStorage.removeItem('admin_token')
      sessionStorage.removeItem('admin_user')
      setUser(null)
      router.push('/')
    } catch {
      setError('Error al cerrar sesión')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    error,
  }
}
