"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Droplets, TrendingUp, Package, AlertTriangle, Plus, FlaskConical, Beaker } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"


export function DashboardContent() {
  const [stats, setStats] = useState({
    totalPerfumes: 0,
    totalStock: 0,
    lowStock: 0,
    salesThisMonth: 0,
    revenueThisMonth: 0,
    totalFlasks: 0,
    totalAlcohol: 0,
    lowStockFlasks: 0,
    lowStockAlcohol: 0,
  })
  // const [topSelling] = useState([])
  // const [lowStockItems, setLowStockItems] = useState([])
  // const [recentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchDashboardData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDashboardData = async () => {
    try {
      // Fetch perfumes stats
      const { data: perfumes } = await supabase
        .from("perfumes")
        .select("current_stock, min_stock")
        .eq("status", "activo")

      const currentMonth = new Date().toISOString().slice(0, 7)
      const { data: sales } = await supabase.from("sales").select("total_amount").gte("sale_date", `${currentMonth}-01`)

      console.log("perfumes: ", perfumes)

      // Calculate stats
      const totalPerfumes = perfumes?.length || 0
      const totalStock = perfumes?.reduce((sum, p) => sum + p.current_stock, 0) || 0
      const lowStock = perfumes?.filter((p) => p.current_stock <= p.min_stock).length || 0
      const salesThisMonth = sales?.length || 0
      const revenueThisMonth = sales?.reduce((sum, s) => sum + s.total_amount, 0) || 0

      setStats(prevStats => ({
        ...prevStats,
        totalPerfumes: totalPerfumes,
        totalStock: totalStock,
        lowStock: lowStock,
        salesThisMonth,
        revenueThisMonth,
      }))

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-muted h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold">Bienvenido a PerfumeStock</h2>
        <p className="text-muted-foreground">Dashboard integrado con control de inventario completo</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Perfumes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPerfumes}</div>
            <p className="text-xs text-muted-foreground">Referencias activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Perfumes</CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStock.toLocaleString()} ml</div>
            <p className="text-xs text-muted-foreground">Inventario disponible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Frascos</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlasks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unidades disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alcohol</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalAlcohol / 1000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Volumen disponible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.salesThisMonth}</div>
            <p className="text-xs text-muted-foreground">${stats.revenueThisMonth.toLocaleString()} en ingresos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfumes Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Requieren reposición</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frascos Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockFlasks}</div>
            <p className="text-xs text-muted-foreground">Tipos por reponer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcohol Bajo Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.lowStockAlcohol}</div>
            <p className="text-xs text-muted-foreground">Tipos por reponer</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Inventory Alerts */}
        <div className="lg:col-span-1">
        </div>

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 del mes actual</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <div className="space-y-4">
              {topSelling.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge variant="secondary">{index + 1}</Badge>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div> */}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas ventas procesadas</CardDescription>
          </CardHeader>
          <CardContent>
            {/* <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activity.perfume_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.customer_name || "Cliente anónimo"} • {activity.quantity} x {activity.milliliters}ml
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${activity.subtotal?.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(activity.sale_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div> */}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>Operaciones frecuentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Link href="/inventory/new">
              <Button className="w-full h-20 flex flex-col space-y-2">
                <Plus className="h-6 w-6" />
                <span>Agregar Perfume</span>
              </Button>
            </Link>
            <Link href="/flasks/new">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <FlaskConical className="h-6 w-6" />
                <span>Agregar Frasco</span>
              </Button>
            </Link>
            <Link href="/sales/new">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>Nueva Venta</span>
              </Button>
            </Link>
            <Link href="/flasks/consumption">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Beaker className="h-6 w-6" />
                <span>Registrar Consumo</span>
              </Button>
            </Link>
            <Link href="/sales/dashboard">
              <Button variant="outline" className="w-full h-20 flex flex-col space-y-2">
                <Package className="h-6 w-6" />
                <span>Dashboard Ventas</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
