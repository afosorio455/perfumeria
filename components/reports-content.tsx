"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react"

export function ReportsContent() {
  // Datos de ejemplo para reportes
  const topSellingProducts = [
    { name: "Chanel No. 5", sold: 450, revenue: 2250, percentage: 100 },
    { name: "Dior Sauvage", sold: 380, revenue: 1710, percentage: 84 },
    { name: "Tom Ford Black Orchid", sold: 320, revenue: 1920, percentage: 71 },
    { name: "Creed Aventus", sold: 280, revenue: 2240, percentage: 62 },
    { name: "Bleu de Chanel", sold: 250, revenue: 1125, percentage: 56 },
  ]

  const categoryPerformance = [
    { category: "Floral", sales: 1200, percentage: 35 },
    { category: "Woody", sales: 980, percentage: 28 },
    { category: "Oriental", sales: 650, percentage: 19 },
    { category: "Fresh", sales: 420, percentage: 12 },
    { category: "Fruity", sales: 210, percentage: 6 },
  ]

  const monthlyTrends = [
    { month: "Enero", sales: 15750, growth: 12 },
    { month: "Diciembre", sales: 14200, growth: 8 },
    { month: "Noviembre", sales: 13100, growth: -3 },
    { month: "Octubre", sales: 13500, growth: 15 },
  ]

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Análisis</h1>
          <p className="text-muted-foreground">Insights de ventas y rendimiento del inventario</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mes</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este año</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,750</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,680 ml</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8%</span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2%</span> vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">8 con stock bajo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 por volumen de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topSellingProducts.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sold} ml vendidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <Progress value={product.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Categoría</CardTitle>
            <CardDescription>Distribución de ventas por tipo de fragancia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryPerformance.map((category, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{category.category}</p>
                      <p className="text-sm text-muted-foreground">${category.sales.toLocaleString()} en ventas</p>
                    </div>
                    <Badge variant="outline">{category.percentage}%</Badge>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias Mensuales</CardTitle>
          <CardDescription>Evolución de ventas en los últimos meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {monthlyTrends.map((month, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">{month.month}</div>
                <div className="text-2xl font-bold">${month.sales.toLocaleString()}</div>
                <div className={`text-sm ${month.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {month.growth >= 0 ? "+" : ""}
                  {month.growth}% vs anterior
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
