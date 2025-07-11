"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, FlaskConical, Beaker, Package, TrendingDown, RefreshCw } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function InventoryAlerts() {
  const [alerts, setAlerts] = useState({
    lowStockFlasks: [],
    lowStockAlcohol: [],
    outOfStockFlasks: [],
    outOfStockAlcohol: [],
    expiringSoon: [],
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    try {
      // Fetch low stock flasks
      const { data: lowFlasks } = await supabase
        .from("flask_inventory_summary")
        .select("*")
        .eq("stock_status", "low")
        .order("current_stock")

      // Fetch out of stock flasks
      const { data: outFlasks } = await supabase.from("flask_inventory_summary").select("*").eq("current_stock", 0)

      // Fetch low stock alcohol
      const { data: lowAlcohol } = await supabase
        .from("alcohol_inventory")
        .select("*")
        .filter("current_stock_ml", "lte", supabase.raw("min_stock_ml"))
        .eq("status", "active")
        .order("current_stock_ml")

      // Fetch out of stock alcohol
      const { data: outAlcohol } = await supabase
        .from("alcohol_inventory")
        .select("*")
        .eq("current_stock_ml", 0)
        .eq("status", "active")

      // Fetch expiring alcohol (within 30 days)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const { data: expiring } = await supabase
        .from("alcohol_inventory")
        .select("*")
        .lte("expiry_date", thirtyDaysFromNow.toISOString().split("T")[0])
        .eq("status", "active")
        .order("expiry_date")

      setAlerts({
        lowStockFlasks: lowFlasks || [],
        lowStockAlcohol: lowAlcohol || [],
        outOfStockFlasks: outFlasks || [],
        outOfStockAlcohol: outAlcohol || [],
        expiringSoon: expiring || [],
      })
    } catch (error) {
      console.error("Error fetching alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalAlerts = () => {
    return (
      alerts.lowStockFlasks.length +
      alerts.lowStockAlcohol.length +
      alerts.outOfStockFlasks.length +
      alerts.outOfStockAlcohol.length +
      alerts.expiringSoon.length
    )
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalAlerts = getTotalAlerts()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <span>Alertas de Inventario</span>
            {totalAlerts > 0 && (
              <Badge variant="destructive" className="ml-2">
                {totalAlerts}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Monitoreo automático de stock y vencimientos</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAlerts}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalAlerts === 0 ? (
          <Alert>
            <Package className="h-4 w-4" />
            <AlertDescription>
              ✅ No hay alertas de inventario. Todos los productos tienen stock adecuado.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {/* Out of Stock Alerts */}
            {alerts.outOfStockFlasks.length > 0 && (
              <Alert variant="destructive">
                <FlaskConical className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sin stock:</strong> {alerts.outOfStockFlasks.length} tipos de frascos agotados
                  <div className="mt-2 space-y-1">
                    {alerts.outOfStockFlasks.slice(0, 3).map((flask) => (
                      <div key={flask.id} className="text-sm">
                        • {flask.reference_id} - {flask.flask_type_name}
                      </div>
                    ))}
                    {alerts.outOfStockFlasks.length > 3 && (
                      <div className="text-sm">... y {alerts.outOfStockFlasks.length - 3} más</div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {alerts.outOfStockAlcohol.length > 0 && (
              <Alert variant="destructive">
                <Beaker className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sin alcohol:</strong> {alerts.outOfStockAlcohol.length} tipos agotados
                  <div className="mt-2 space-y-1">
                    {alerts.outOfStockAlcohol.slice(0, 3).map((alcohol) => (
                      <div key={alcohol.id} className="text-sm">
                        • {alcohol.name} ({alcohol.type})
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Low Stock Alerts */}
            {alerts.lowStockFlasks.length > 0 && (
              <Alert>
                <TrendingDown className="h-4 w-4" />
                <AlertDescription>
                  <strong>Stock bajo:</strong> {alerts.lowStockFlasks.length} tipos de frascos
                  <div className="mt-2 space-y-1">
                    {alerts.lowStockFlasks.slice(0, 3).map((flask) => (
                      <div key={flask.id} className="text-sm flex justify-between">
                        <span>• {flask.reference_id}</span>
                        <span>{flask.current_stock} unidades</span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {alerts.lowStockAlcohol.length > 0 && (
              <Alert>
                <TrendingDown className="h-4 w-4" />
                <AlertDescription>
                  <strong>Alcohol bajo:</strong> {alerts.lowStockAlcohol.length} tipos
                  <div className="mt-2 space-y-1">
                    {alerts.lowStockAlcohol.slice(0, 3).map((alcohol) => (
                      <div key={alcohol.id} className="text-sm flex justify-between">
                        <span>• {alcohol.name}</span>
                        <span>{(alcohol.current_stock_ml / 1000).toFixed(1)}L</span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Expiring Soon */}
            {alerts.expiringSoon.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Próximos a vencer:</strong> {alerts.expiringSoon.length} productos
                  <div className="mt-2 space-y-1">
                    {alerts.expiringSoon.slice(0, 3).map((alcohol) => (
                      <div key={alcohol.id} className="text-sm flex justify-between">
                        <span>• {alcohol.name}</span>
                        <span>{new Date(alcohol.expiry_date).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
