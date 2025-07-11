"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Beaker, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function NewAlcoholForm() {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    concentration_percentage: "",
    supplier: "",
    batch_number: "",
    current_stock_ml: "",
    min_stock_ml: "",
    cost_per_ml: "",
    expiry_date: "",
    storage_location: "",
    safety_notes: "",
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const alcoholData = {
        name: formData.name,
        type: formData.type,
        concentration_percentage: Number.parseFloat(formData.concentration_percentage) || null,
        supplier: formData.supplier,
        batch_number: formData.batch_number,
        current_stock_ml: Number.parseInt(formData.current_stock_ml) || 0,
        min_stock_ml: Number.parseInt(formData.min_stock_ml) || 0,
        cost_per_ml: Number.parseFloat(formData.cost_per_ml) || null,
        expiry_date: formData.expiry_date || null,
        storage_location: formData.storage_location,
        safety_notes: formData.safety_notes,
      }

      const { error } = await supabase.from("alcohol_inventory").insert([alcoholData])

      if (error) throw error

      alert("Alcohol agregado exitosamente")
      // Redirect to flasks page
      window.location.href = "/flasks"
    } catch (error) {
      console.error("Error creating alcohol:", error)
      alert("Error al agregar el alcohol")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/flasks">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Agregar Nuevo Alcohol</h1>
              <p className="text-muted-foreground">Registra un nuevo tipo de alcohol en el inventario</p>
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
                  <CardTitle className="flex items-center space-x-2">
                    <Beaker className="h-5 w-5" />
                    <span>Información del Alcohol</span>
                  </CardTitle>
                  <CardDescription>Datos principales del alcohol/solvente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Producto *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="ej. Etanol 96%"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Tipo de Alcohol *</Label>
                      <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ethanol">Etanol</SelectItem>
                          <SelectItem value="isopropyl">Alcohol Isopropílico</SelectItem>
                          <SelectItem value="denatured">Alcohol Desnaturalizado</SelectItem>
                          <SelectItem value="methanol">Metanol</SelectItem>
                          <SelectItem value="perfume_grade">Grado Perfumería</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="concentration_percentage">Concentración (%)</Label>
                      <Input
                        id="concentration_percentage"
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.concentration_percentage}
                        onChange={(e) => handleInputChange("concentration_percentage", e.target.value)}
                        placeholder="ej. 96.0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batch_number">Número de Lote</Label>
                      <Input
                        id="batch_number"
                        value={formData.batch_number}
                        onChange={(e) => handleInputChange("batch_number", e.target.value)}
                        placeholder="ej. ETH-2024-001"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Proveedor</Label>
                      <Input
                        id="supplier"
                        value={formData.supplier}
                        onChange={(e) => handleInputChange("supplier", e.target.value)}
                        placeholder="Nombre del proveedor"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cost_per_ml">Costo por ml</Label>
                      <Input
                        id="cost_per_ml"
                        type="number"
                        step="0.0001"
                        value={formData.cost_per_ml}
                        onChange={(e) => handleInputChange("cost_per_ml", e.target.value)}
                        placeholder="0.0000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry_date">Fecha de Vencimiento</Label>
                      <Input
                        id="expiry_date"
                        type="date"
                        value={formData.expiry_date}
                        onChange={(e) => handleInputChange("expiry_date", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storage_location">Ubicación de Almacenamiento</Label>
                      <Input
                        id="storage_location"
                        value={formData.storage_location}
                        onChange={(e) => handleInputChange("storage_location", e.target.value)}
                        placeholder="ej. Almacén Químicos - Zona A"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="safety_notes" className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Notas de Seguridad</span>
                    </Label>
                    <Textarea
                      id="safety_notes"
                      value={formData.safety_notes}
                      onChange={(e) => handleInputChange("safety_notes", e.target.value)}
                      placeholder="Precauciones de seguridad, manejo y almacenamiento..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control de Stock */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Control de Stock</CardTitle>
                  <CardDescription>Configuración de inventario</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_stock_ml">Stock Inicial (ml)</Label>
                    <Input
                      id="current_stock_ml"
                      type="number"
                      value={formData.current_stock_ml}
                      onChange={(e) => handleInputChange("current_stock_ml", e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                    <p className="text-sm text-muted-foreground">Cantidad inicial en mililitros</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_stock_ml">Stock Mínimo (ml) *</Label>
                    <Input
                      id="min_stock_ml"
                      type="number"
                      value={formData.min_stock_ml}
                      onChange={(e) => handleInputChange("min_stock_ml", e.target.value)}
                      placeholder="0"
                      min="0"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Alerta cuando el stock esté por debajo de este valor
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Precauciones de Seguridad</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Asegúrate de seguir todas las normas de seguridad para el manejo y almacenamiento de productos
                          químicos.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <div className="mt-6 space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Alcohol"}
                </Button>
                <Link href="/flasks">
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
