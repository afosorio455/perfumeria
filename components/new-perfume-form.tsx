"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation';


export function NewPerfumeForm() {
  const router = useRouter()
  const supabase = createClient()
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    initialStock: "",
    minStock: "",
    price: "",
    cost: "",
    supplier: "",
    notes: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí se enviarían los datos a la base de datos
    console.log("Nuevo perfume:", formData)
    // Redireccionar al inventario después de guardar

    const { error } = await supabase
      .from('perfumes')
      .insert({
        name: formData.name,
        brand: formData.brand,
        category: formData.category,
        description: formData.description,
        current_stock: formData.initialStock,
        min_stock: formData.minStock,
        price_per_ml: formData.price,
        cost_per_ml: formData.cost,
        supplier: formData.supplier,
        notes: formData.notes,
        created_by: 5,
      })
      router.push('/inventory')
      console.log("error>",error)
  }

  return (
    <>
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/inventory">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Agregar Nuevo Perfume</h1>
              <p className="text-muted-foreground">Registra una nueva referencia en tu inventario</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información Básica */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Información Básica</CardTitle>
                  <CardDescription>Datos principales del perfume</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Perfume *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="ej. Chanel No. 5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca *</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange("brand", e.target.value)}
                        placeholder="ej. Chanel"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría</Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="floral">Floral</SelectItem>
                        <SelectItem value="woody">Woody</SelectItem>
                        <SelectItem value="oriental">Oriental</SelectItem>
                        <SelectItem value="fresh">Fresh</SelectItem>
                        <SelectItem value="fruity">Fruity</SelectItem>
                        <SelectItem value="gourmand">Gourmand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe las notas y características del perfume..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Información Comercial */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Información Comercial</CardTitle>
                  <CardDescription>Precios y costos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Precio de Venta (por ml) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => handleInputChange("price", e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cost">Costo (por ml)</Label>
                      <Input
                        id="cost"
                        type="number"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => handleInputChange("cost", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="supplier">Proveedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange("supplier", e.target.value)}
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Inventario */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Control de Inventario</CardTitle>
                  <CardDescription>Stock inicial y configuración</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="initialStock">Stock Inicial (ml) *</Label>
                    <Input
                      id="initialStock"
                      type="number"
                      value={formData.initialStock}
                      onChange={(e) => handleInputChange("initialStock", e.target.value)}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minStock">Stock Mínimo (ml) *</Label>
                    <Input
                      id="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={(e) => handleInputChange("minStock", e.target.value)}
                      placeholder="0"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Se generará una alerta cuando el stock esté por debajo de este valor
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Notas internas sobre el producto..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <div className="mt-6 space-y-3">
                <Button type="submit" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Perfume
                </Button>
                <Link href="/inventory">
                  <Button variant="outline" className="w-full">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  )
}
