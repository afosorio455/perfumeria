"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, UserX, Shield } from "lucide-react"

interface UserStats {
  total: number
  activos: number
  inactivos: number
  administradores: number
  supervisores: number
  vendedores: number
}

export function UsersStats() {
  const [stats, setStats] = useState<UserStats>({
    total: 0,
    activos: 0,
    inactivos: 0,
    administradores: 0,
    supervisores: 0,
    vendedores: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('role, status')

        if (!error && users) {
          const statsData = {
            total: users.length,
            activos: users.filter(u => u.status === 'activo').length,
            inactivos: users.filter(u => u.status === 'inactivo').length,
            administradores: users.filter(u => u.role === 'administrador').length,
            supervisores: users.filter(u => u.role === 'supervisor').length,
            vendedores: users.filter(u => u.role === 'vendedor').length
          }
          setStats(statsData)
        }
      } catch (error) {
        console.error('Error fetching user stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Usuarios registrados en el sistema
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
          <p className="text-xs text-muted-foreground">
            {stats.total > 0 ? `${Math.round((stats.activos / stats.total) * 100)}% del total` : '0% del total'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Administradores</CardTitle>
          <Shield className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.administradores}</div>
          <p className="text-xs text-muted-foreground">
            Acceso completo al sistema
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
          <Users className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{stats.vendedores}</div>
          <p className="text-xs text-muted-foreground">
            Acceso a ventas e inventario
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
