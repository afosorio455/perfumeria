"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Trash2, UserCheck, UserX, Loader2 } from "lucide-react"

interface User {
  id: number
  nombre: string
  email: string
  role: string
  status: string
  created_at: string
}

export function UsersList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingUser, setUpdatingUser] = useState<number | null>(null)
  const supabase = createClient()

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        setError("Error al cargar usuarios")
        console.error('Error fetching users:', error)
      } else {
        setUsers(data || [])
      }
    } catch (error) {
      setError("Error inesperado al cargar usuarios")
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleStatusChange = async (userId: number, newStatus: string) => {
    setUpdatingUser(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', userId)

      if (error) {
        setError("Error al actualizar el estado del usuario")
      } else {
        // Actualizar la lista local
        setUsers(users.map(user => 
          user.id === userId ? { ...user, status: newStatus } : user
        ))
      }
    } catch (error) {
      setError("Error inesperado al actualizar usuario")
      console.error('Error:', error)
    } finally {
      setUpdatingUser(null)
    }
  }

  const handleRoleChange = async (userId: number, newRole: string) => {
    setUpdatingUser(userId)
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        setError("Error al actualizar el rol del usuario")
      } else {
        // Actualizar la lista local
        setUsers(users.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
      }
    } catch (error) {
      setError("Error inesperado al actualizar usuario")
      console.error('Error:', error)
    } finally {
      setUpdatingUser(null)
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario? Esta acción no se puede deshacer.")) {
      return
    }

    setUpdatingUser(userId)
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        setError("Error al eliminar el usuario")
      } else {
        // Remover de la lista local
        setUsers(users.filter(user => user.id !== userId))
      }
    } catch (error) {
      setError("Error inesperado al eliminar usuario")
      console.error('Error:', error)
    } finally {
      setUpdatingUser(null)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'destructive'
      case 'supervisor':
        return 'default'
      case 'vendedor':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    return status === 'activo' ? 'default' : 'secondary'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Cargando usuarios...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de Creación</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No hay usuarios registrados
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.nombre}</div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value)}
                      disabled={updatingUser === user.id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendedor">Vendedor</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="administrador">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.status}
                      onValueChange={(value) => handleStatusChange(user.id, value)}
                      disabled={updatingUser === user.id}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="inactivo">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(user.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={updatingUser === user.id}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {updatingUser && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Actualizando usuario...</span>
        </div>
      )}
    </div>
  )
}
