"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function InventoryContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [perfumes, setPerfumes] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPerfumes()
  }, [])

  const fetchPerfumes = async () => {
    try {
      const { data, error } = await supabase
        .from("perfumes")
        .select(`
          *
        `)
        // .eq("status", "activo")
        // .order("created_at", { ascending: false })

      if (error) throw error
      setPerfumes(data || [])
    } catch (error) {
      console.error("Error fetching perfumes:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPerfumes = perfumes.filter(
    (perfume: any) =>
      perfume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perfume.brand.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock <= minStock * 0.5) return { status: "critical", color: "destructive" }
    if (stock <= minStock) return { status: "low", color: "secondary" }
    return { status: "good", color: "default" }
  }

  const handleDelete = async (id: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este perfume?")) {
      try {
        const { error } = await supabase.from("perfumes").update({ status: "inactivo" }).eq("id", id)

        if (error) throw error
        fetchPerfumes() // Refresh the list
      } catch (error) {
        console.error("Error deleting perfume:", error)
        alert("Error al eliminar el perfume")
      }
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
          <h1 className="text-2xl font-bold">Inventario de Perfumes</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de fragancias</p>
        </div>
        <Link href="/inventory/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Perfume
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Filtrar por Categoría</Button>
              <Button variant="outline">Filtrar por Stock</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Perfumes</CardTitle>
          <CardDescription>{filteredPerfumes.length} perfumes encontrados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfume</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Stock (ml)</TableHead>
                <TableHead>Precio/ml</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead>Creado por</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPerfumes.map((perfume : any) => {
                const stockStatus = getStockStatus(perfume.current_stock, perfume.min_stock)
                return (
                  <TableRow key={perfume.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{perfume.name}</div>
                        <div className="text-sm text-muted-foreground">{perfume.brand}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{perfume.category || "Sin categoría"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{perfume.current_stock}</span>
                        {stockStatus.status === "critical" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                        {stockStatus.status === "low" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                      </div>
                      <div className="text-sm text-muted-foreground">Mín: {perfume.min_stock} ml</div>
                    </TableCell>
                    <TableCell>
                      <div>${perfume.price_per_ml?.toFixed(2) || "0.00"}</div>
                      <div className="text-sm text-muted-foreground">
                        Costo: ${perfume.cost_per_ml?.toFixed(2) || "0.00"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{new Date(perfume.updated_at).toLocaleDateString()}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{perfume.profiles?.name || "Sistema"}</div>
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
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(perfume.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </main>
  )
}
