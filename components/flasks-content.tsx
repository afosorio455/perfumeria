"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  Package,
  Beaker,
  FlaskConical,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function FlasksContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [flasks, setFlasks] = useState([])
  const [alcoholInventory, setAlcoholInventory] = useState([])
  const [flaskTypes, setFlaskTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFlasks: 0,
    lowStockFlasks: 0,
    totalAlcohol: 0,
    lowStockAlcohol: 0,
    totalValue: 0,
  })
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch flasks with types
      const { data: flasksData } = await supabase.from("flask_inventory_summary").select("*").order("reference_id")

      // Fetch alcohol inventory
      const { data: alcoholData } = await supabase
        .from("alcohol_inventory")
        .select("*")
        .eq("status", "active")
        .order("name")

      // Fetch flask types
      const { data: typesData } = await supabase.from("flask_types").select("*").eq("is_active", true).order("name")

      setFlasks(flasksData || [])
      setAlcoholInventory(alcoholData || [])
      setFlaskTypes(typesData || [])

      // Calculate stats
      const totalFlasks = flasksData?.reduce((sum, f) => sum + f.current_stock, 0) || 0
      const lowStockFlasks = flasksData?.filter((f) => f.stock_status === "low").length || 0
      const totalAlcohol = alcoholData?.reduce((sum, a) => sum + a.current_stock_ml, 0) || 0
      const lowStockAlcohol = alcoholData?.filter((a) => a.current_stock_ml <= a.min_stock_ml).length || 0
      const totalValue = flasksData?.reduce((sum, f) => sum + (f.total_value || 0), 0) || 0

      setStats({
        totalFlasks,
        lowStockFlasks,
        totalAlcohol,
        lowStockAlcohol,
        totalValue,
      })
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFlasks = flasks.filter(
    (flask) =>
      flask.reference_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flask.flask_type_name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredAlcohol = alcoholInventory.filter(
    (alcohol) =>
      alcohol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alcohol.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "destructive"
      case "medium":
        return "secondary"
      case "good":
        return "default"
      default:
        return "outline"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "luxury":
        return "default"
      case "premium":
        return "secondary"
      case "standard":
        return "outline"
      case "generic":
        return "outline"
      default:
        return "outline"
    }
  }

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="bg-muted h-8 w-64 mb-4 rounded"></div>
          <div className="bg-muted h-64 rounded"></div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Frascos y Alcohol</h1>
          <p className="text-muted-foreground">Control de inventario de frascos y consumo de alcohol</p>
        </div>
        <div className="flex gap-2">
          <Link href="/flasks/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Frasco
            </Button>
          </Link>
          <Link href="/flasks/alcohol/new">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Alcohol
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Frascos</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlasks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unidades en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowStockFlasks}</div>
            <p className="text-xs text-muted-foreground">Frascos por reponer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alcohol</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.totalAlcohol / 1000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">Disponible</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alcohol Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.lowStockAlcohol}</div>
            <p className="text-xs text-muted-foreground">Tipos por reponer</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Inventario frascos</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar frascos o alcohol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="flasks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="flasks">Frascos</TabsTrigger>
          <TabsTrigger value="alcohol">Alcohol</TabsTrigger>
          <TabsTrigger value="types">Tipos de Frasco</TabsTrigger>
          <TabsTrigger value="consumption">Consumo</TabsTrigger>
        </TabsList>

        {/* Flasks Tab */}
        <TabsContent value="flasks">
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Frascos</CardTitle>
              <CardDescription>{filteredFlasks.length} frascos encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlasks.map((flask) => (
                    <TableRow key={flask.id}>
                      <TableCell>
                        <div className="font-medium">{flask.reference_id}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{flask.flask_type_name}</div>
                          <Badge variant={getCategoryColor(flask.category)} className="text-xs">
                            {flask.category}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>{flask.size_ml} ml</TableCell>
                      <TableCell>
                        <div className="capitalize">{flask.material}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{flask.current_stock}</span>
                          {flask.stock_status === "low" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                          {flask.stock_status === "medium" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground">Mín: {flask.min_stock}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">${flask.total_value?.toFixed(2) || "0.00"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{flask.location || "N/A"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStockStatusColor(flask.stock_status)}>{flask.stock_status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Package className="mr-2 h-4 w-4" />
                              Movimientos
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alcohol Tab */}
        <TabsContent value="alcohol">
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Alcohol</CardTitle>
              <CardDescription>{filteredAlcohol.length} tipos de alcohol encontrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Concentración</TableHead>
                    <TableHead>Stock (L)</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlcohol.map((alcohol) => (
                    <TableRow key={alcohol.id}>
                      <TableCell>
                        <div className="font-medium">{alcohol.name}</div>
                        <div className="text-sm text-muted-foreground">{alcohol.supplier}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {alcohol.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{alcohol.concentration_percentage}%</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{(alcohol.current_stock_ml / 1000).toFixed(1)}L</span>
                          {alcohol.current_stock_ml <= alcohol.min_stock_ml && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Mín: {(alcohol.min_stock_ml / 1000).toFixed(1)}L
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{alcohol.batch_number}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {alcohol.expiry_date ? new Date(alcohol.expiry_date).toLocaleDateString() : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{alcohol.storage_location}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Beaker className="mr-2 h-4 w-4" />
                              Registrar Consumo
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flask Types Tab */}
        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Tipos de Frasco</CardTitle>
              <CardDescription>{flaskTypes.length} tipos configurados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaskTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>
                        <div className="font-medium">{type.name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getCategoryColor(type.category)}>{type.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={type.is_active ? "default" : "secondary"}>
                          {type.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver Frascos
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consumption Tab */}
        <TabsContent value="consumption">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Consumo Reciente de Alcohol</CardTitle>
                <CardDescription>Últimos registros de uso</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    <Beaker className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay registros de consumo recientes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lotes en Preparación</CardTitle>
                <CardDescription>Procesos activos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-muted-foreground">
                    <FlaskConical className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No hay lotes en preparación</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
