"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, TrendingUp, DollarSign, Package } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"


export function SalesContent() {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPeriod, setFilterPeriod] = useState("all")
  const [sales, setSales] = useState<any[]>([])
  useEffect(() => {
    fetchSales()
    // console.log("sales1>", sales)
  }, [])

  const fetchSales = async () => {

    const { data : salesQuery, error } = await supabase.from('sale_details').select(
      `quantity,subtotal,is_refill,milliliter,unit_price,subtotal
      ,perfumes (id, name)
      ,sales (id, sale_date, customer_name )`
    ).limit(50)

    setSales(salesQuery || [])

    console.log('ventas: ',salesQuery)
  }
  // Datos de ejemplo - en producción vendrían de la base de datos
  const sales1 = [
    {
      id: 1,
      date: "2024-01-15",
      time: "14:30",
      perfume: "Chanel No. 5",
      bottleType: "Atomizador",
      quantity: 50,
      unitPrice: 5.0,
      total: 250,
      customer: "Cliente Regular",
      soldBy: "María García",
      type: "venta",
      isRefill: false,
    },
    {
      id: 2,
      date: "2024-01-15",
      time: "11:15",
      perfume: "Dior Sauvage",
      bottleType: "Roll-on",
      quantity: 15,
      unitPrice: 4.0,
      total: 60,
      customer: "Nuevo Cliente",
      soldBy: "Carlos López",
      type: "venta",
      isRefill: true,
    },
  ]

  const filteredSales = sales.filter(
    (sale) =>
      sale.perfumes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sales.customer_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalSales = sales.reduce((sum, sale) => sum + sale.subtotal, 0)
  const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0)
  const salesCount = sales.length

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Ventas y Movimientos</h1>
          <p className="text-muted-foreground">Historial de transacciones y ajustes de inventario</p>
        </div>
        <Link href="/sales/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Venta
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">En el período seleccionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cantidad Vendida</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toLocaleString()} ml</div>
            <p className="text-xs text-muted-foreground">Volumen total vendido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transacciones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesCount}</div>
            <p className="text-xs text-muted-foreground">Ventas realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por perfume o cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los períodos</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>{filteredSales.length} transacciones encontradas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Perfume</TableHead>
                <TableHead>Tipo/ml</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Precio Unit.</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Cliente/Motivo</TableHead>
                {/* <TableHead>Vendedor</TableHead> */}
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{sale.sales.sale_date}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{sale.perfumes.name}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {/* <div className="font-medium">{sale.bottleType || "N/A"}</div> */}
                      <div className="text-sm text-muted-foreground">
                        {Math.abs(sale.milliliter)} ml
                        {sale.is_refill && (
                          <Badge variant="secondary" className="ml-1 text-xs">
                            Recarga
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`font-medium ${sale.quantity < 0 ? "text-red-600" : "text-green-600"}`}>
                      {sale.quantity > 0 ? "+" : ""}
                      {Math.abs(sale.quantity)}
                    </div>
                  </TableCell>
                  <TableCell>{sale.unit_price > 0 ? `$${sale.unit_price.toFixed(2)}` : "-"}</TableCell>
                  <TableCell>
                    <div className="font-medium">{sale.subtotal > 0 ? `$${sale.subtotal.toFixed(2)}` : "-"}</div>
                  </TableCell>
                  <TableCell>{sale.sales.customer_name}</TableCell>
                  {/* <TableCell>{sale.soldBy}</TableCell> */}
                  <TableCell>
                    <Badge variant={"default"}>
                      Venta
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
