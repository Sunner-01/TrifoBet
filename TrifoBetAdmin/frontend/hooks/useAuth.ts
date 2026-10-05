'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface AuthUser {
  id: string
  email: string
  nombre: string
  rol: 'admin' | 'moderador'
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

  // Check auth on mount
  useEffect(() => {
    const checkAuth = () => {
      const token = sessionStorage.getItem('admin_token')
      const userData = sessionStorage.getItem('admin_user')

      if (token && userData) {
        try {
          const parsed = JSON.parse(userData)
          setUser(parsed)
        } catch (err) {
          setError('Error al parsear datos de usuario')
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
      // En producción, esto conectaría con el backend
      // Por ahora usamos validación local
      if (!email || password.length < 6) {
        throw new Error('Email y contraseña válidos requeridos')
      }

      // Simular login exitoso
      const token = 'token_' + Date.now()
      const userData: AuthUser = {
        id: '1',
        email,
        nombre: email.split('@')[0],
        rol: 'admin',
      }

      sessionStorage.setItem('admin_token', token)
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
    } catch (err) {
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
