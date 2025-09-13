"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Download, Calendar, Loader2 } from "lucide-react"

export function ReportsContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([])
  const [categoryPerformance, setCategoryPerformance] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])

  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true)
      setError(null)
      const supabase = createClient()

      try {
        // Fetch all sales data from the detailed view
        const { data: salesData, error: salesError } = await supabase
          .from("sales_detailed_view")
          .select("*")
          .order("sale_date", { ascending: false })

        if (salesError) {
          throw salesError
        }

        if (!salesData || salesData.length === 0) {
          setSummary({
            totalRevenue: 0,
            revenueGrowth: 0,
            totalSoldMl: 0,
            soldMlGrowth: 0,
            avgMargin: 0,
            activeProducts: 0,
            lowStockProducts: 0,
          })
          setLoading(false)
          return
        }

        // Process data
        const now = new Date()
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

        const salesThisMonth = salesData.filter(d => new Date(d.sale_date) >= thisMonthStart)
        const salesLastMonth = salesData.filter(d => new Date(d.sale_date) >= lastMonthStart && new Date(d.sale_date) <= lastMonthEnd)

        const totalRevenueThisMonth = salesThisMonth.reduce((acc, curr) => acc + curr.subtotal, 0)
        const totalRevenueLastMonth = salesLastMonth.reduce((acc, curr) => acc + curr.subtotal, 0)
        const revenueGrowth = totalRevenueLastMonth > 0 ? ((totalRevenueThisMonth - totalRevenueLastMonth) / totalRevenueLastMonth) * 100 : totalRevenueThisMonth > 0 ? 100 : 0

        const totalSoldMlThisMonth = salesThisMonth.reduce((acc, curr) => acc + (curr.milliliters * curr.quantity), 0)
        const totalSoldMlLastMonth = salesLastMonth.reduce((acc, curr) => acc + (curr.milliliters * curr.quantity), 0)
        const soldMlGrowth = totalSoldMlLastMonth > 0 ? ((totalSoldMlThisMonth - totalSoldMlLastMonth) / totalSoldMlLastMonth) * 100 : totalSoldMlThisMonth > 0 ? 100 : 0

        // Fetch perfume data for margin and stock
        const { data: perfumes, error: perfumesError } = await supabase.from('perfumes').select('price_per_ml, cost_per_ml, current_stock, min_stock, status')
        if (perfumesError) throw perfumesError;

        const activeProducts = perfumes?.filter(p => p.status === 'activo').length || 0
        const lowStockProducts = perfumes?.filter(p => p.current_stock < p.min_stock).length || 0

        const margins = perfumes?.filter(p => p.price_per_ml && p.cost_per_ml && p.price_per_ml > 0).map(p => ((p.price_per_ml - p.cost_per_ml) / p.price_per_ml) * 100)
        const avgMargin = margins && margins.length > 0 ? margins.reduce((acc, curr) => acc + curr, 0) / margins.length : 0

        setSummary({
          totalRevenue: totalRevenueThisMonth,
          revenueGrowth,
          totalSoldMl: totalSoldMlThisMonth,
          soldMlGrowth,
          avgMargin,
          activeProducts,
          lowStockProducts,
        })

        // Top Selling Products
        const productsMap = new Map()
        salesData.forEach(sale => {
          const existing = productsMap.get(sale.perfume_name) || { name: sale.perfume_name, sold: 0, revenue: 0 }
          existing.sold += (sale.milliliters * sale.quantity)
          existing.revenue += sale.subtotal
          productsMap.set(sale.perfume_name, existing)
        })
        const topProducts = Array.from(productsMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5)
        const maxRevenue = topProducts.length > 0 ? topProducts[0].revenue : 0
        setTopSellingProducts(topProducts.map(p => ({ ...p, percentage: maxRevenue > 0 ? (p.revenue / maxRevenue) * 100 : 0 })))

        // Category Performance
        const categoryMap = new Map()
        salesData.forEach(sale => {
          const category = sale.perfume_category || 'Sin Categoría'
          const existing = categoryMap.get(category) || { category, sales: 0 }
          existing.sales += sale.subtotal
          categoryMap.set(category, existing)
        })
        const categoryList = Array.from(categoryMap.values()).sort((a, b) => b.sales - a.sales)
        const totalCategorySales = categoryList.reduce((acc, curr) => acc + curr.sales, 0)
        setCategoryPerformance(categoryList.map(c => ({...c, percentage: totalCategorySales > 0 ? (c.sales / totalCategorySales) * 100 : 0})))

        // Monthly Trends (last 4 months)
        const trendsMap = new Map()
        for (let i = 0; i < 4; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const monthName = d.toLocaleString('es-ES', { month: 'long' })
          trendsMap.set(monthName, { month: monthName.charAt(0).toUpperCase() + monthName.slice(1), sales: 0, growth: 0 })
        }

        salesData.forEach(sale => {
            const saleDate = new Date(sale.sale_date);
            const monthName = saleDate.toLocaleString('es-ES', { month: 'long' });
            const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

            if (trendsMap.has(capitalizedMonthName)) {
                trendsMap.get(capitalizedMonthName).sales += sale.subtotal;
            }
        });

        const trendsList = Array.from(trendsMap.values());

        for (let i = 0; i < trendsList.length - 1; i++) {
            const currentMonthSales = trendsList[i].sales;
            const previousMonthSales = trendsList[i+1].sales;
            const growth = previousMonthSales > 0 ? ((currentMonthSales - previousMonthSales) / previousMonthSales) * 100 : currentMonthSales > 0 ? 100 : 0;
            trendsList[i].growth = growth;
        }


        setMonthlyTrends(trendsList);

      } catch (err: any) {
        console.error("Error fetching reports data:", err)
        setError("No se pudieron cargar los datos de los reportes. Por favor, intente de nuevo más tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchReportsData()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-16 w-16 animate-spin" />
        <p className="ml-4 text-lg">Cargando reportes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-80px)]">
        <Card className="w-96 bg-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

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
            <div className="text-2xl font-bold">${summary?.totalRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2}) || '0.00'}</div>
            <p className={`text-xs ${summary?.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary?.revenueGrowth >= 0 ? '+' : ''}{summary?.revenueGrowth.toFixed(2) || '0.00'}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unidades Vendidas</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalSoldMl.toLocaleString() || '0'} ml</div>
             <p className={`text-xs ${summary?.soldMlGrowth >= 0 ? "text-green-600" : "text-red-600"}`}>
              {summary?.soldMlGrowth >= 0 ? '+' : ''}{summary?.soldMlGrowth.toFixed(2) || '0.00'}% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.avgMargin.toFixed(2) || '0.00'}%</div>
            <p className="text-xs text-muted-foreground">
              Promedio de todos los productos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Activos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeProducts || '0'}</div>
            <p className="text-xs text-muted-foreground">{summary?.lowStockProducts || '0'} con stock bajo</p>
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
                        <p className="text-sm text-muted-foreground">{product.sold.toLocaleString()} ml vendidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${product.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </div>
                  </div>
                  <Progress value={product.percentage} className="h-2" />
                </div>
              ))}
               {topSellingProducts.length === 0 && <p className="text-muted-foreground text-center">No hay datos de ventas para mostrar.</p>}
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
                      <p className="text-sm text-muted-foreground">${category.sales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2})} en ventas</p>
                    </div>
                    <Badge variant="outline">{category.percentage.toFixed(2)}%</Badge>
                  </div>
                  <Progress value={category.percentage} className="h-2" />
                </div>
              ))}
               {categoryPerformance.length === 0 && <p className="text-muted-foreground text-center">No hay datos de categorías para mostrar.</p>}
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
                <div className="text-2xl font-bold">${month.sales.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                <div className={`text-sm ${month.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {index < monthlyTrends.length -1 ? (
                    <>
                      {month.growth >= 0 ? "+" : ""}
                      {month.growth.toFixed(2)}% vs anterior
                    </>
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </div>
              </div>
            ))}
          </div>
           {monthlyTrends.every(m => m.sales === 0) && <p className="text-muted-foreground text-center pt-4">No hay datos de tendencias para mostrar.</p>}
        </CardContent>
      </Card>
    </main>
  )
}
