// hooks/useUsuarios.ts
import { useState, useEffect, useCallback } from 'react'
import { getUsuarios, toggleHabilitarUsuario, UsuarioAdmin, UsuariosResponse } from '@/lib/api'

export function useUsuarios() {
  const [data, setData] = useState<UsuariosResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterHabilitado, setFilterHabilitado] = useState<'' | 'true' | 'false'>('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [selectedUser, setSelectedUser] = useState<UsuarioAdmin | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getUsuarios({
        page,
        limit,
        search: searchTerm || undefined,
        habilitado: filterHabilitado || undefined,
      })
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }, [page, limit, searchTerm, filterHabilitado])

  useEffect(() => {
    fetchUsuarios()
  }, [fetchUsuarios])

  // Búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const handleToggleHabilitar = async (usuario: UsuarioAdmin) => {
    setTogglingId(usuario.id)
    try {
      await toggleHabilitarUsuario(usuario.id)
      await fetchUsuarios()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cambiar estado')
    } finally {
      setTogglingId(null)
    }
  }

  const handleEditUser = (user: UsuarioAdmin) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleSaveUser = async () => {
    setIsModalOpen(false)
    setSelectedUser(null)
    await fetchUsuarios()
  }

  return {
    data,
    loading,
    error,
    searchInput,
    setSearchInput,
    filterHabilitado,
    setFilterHabilitado,
    page,
    setPage,
    limit,
    setLimit,
    selectedUser,
    setSelectedUser,
    isModalOpen,
    setIsModalOpen,
    togglingId,
    fetchUsuarios,
    handleToggleHabilitar,
    handleEditUser,
    handleSaveUser
  }
}
