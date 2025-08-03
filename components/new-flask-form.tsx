"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, FlaskConical } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function NewFlaskForm() {
  const [formData, setFormData] = useState({
    flask_type_id: "",
    size_ml: "",
    material: "",
    color: "",
    supplier: "",
    cost_per_unit: "",
    current_stock: "",
    min_stock: "",
    max_stock: "",
    location: "",
    notes: "",
  })
  const [flaskTypes, setFlaskTypes] = useState<any[]>([])
  const [loading, setLoading] = useState<any>(false)
  const [generatedReference, setGeneratedReference] = useState<any>("")
  const supabase = createClient()

  useEffect(() => {
    fetchFlaskTypes()
  }, [])

  useEffect(() => {
    if (formData.flask_type_id && formData.size_ml) {
      generateReference()
    }
  }, [formData.flask_type_id, formData.size_ml])

  const fetchFlaskTypes = async () => {
    try {
      const { data } = await supabase.from("flask_types").select("*").eq("is_active", true).order("name")

      setFlaskTypes(data || [])
    } catch (error) {
      console.error("Error fetching flask types:", error)
    }
  }

  const generateReference = async () => {
    if (!formData.flask_type_id || !formData.size_ml) return

    try {
      // const selectedType = flaskTypes.find((t: any) => t.id.toString() === formData.flask_type_id)
      // if (!selectedType) return

      // const { data, error } = await supabase.rpc("generate_flask_reference", {
      //   flask_type_name: selectedType.name,
      //   size_ml: Number.parseInt(formData.size_ml),
      // })

      // if (error) throw error
      // setGeneratedReference(data)
    } catch (error) {
      console.error("Error generating reference:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const flaskData = {
        flask_type_id: Number.parseInt(formData.flask_type_id),
        size_ml: Number.parseInt(formData.size_ml),
        material: formData.material,
        color: formData.color,
        supplier: formData.supplier,
        cost_per_unit: Number.parseFloat(formData.cost_per_unit) || 0,
        current_stock: Number.parseInt(formData.current_stock) || 0,
        min_stock: Number.parseInt(formData.min_stock) || 0,
        max_stock: Number.parseInt(formData.max_stock) || null,
        location: formData.location,
        notes: formData.notes,
      }

      const { error } = await supabase.from("flasks").insert([flaskData])

      if (error) throw error

      // Create initial stock movement if there's initial stock
      if (Number.parseInt(formData.current_stock) > 0) {
        const { data: flaskResult } = await supabase
          .from("flasks")
          .select("id")
          .eq("reference_id", generatedReference)
          .single()

        if (flaskResult) {
          await supabase.from("flask_movements").insert([
            {
              flask_id: flaskResult.id,
              movement_type: "purchase",
              quantity: Number.parseInt(formData.current_stock),
              unit_cost: Number.parseFloat(formData.cost_per_unit) || 0,
              total_cost: Number.parseInt(formData.current_stock) * Number.parseFloat(formData.cost_per_unit) || 0,
              reference_document: "INITIAL_STOCK",
              notes: "Stock inicial del frasco",
            },
          ])
        }
      }

      alert("Frasco creado exitosamente")
      // Redirect to flasks page
      window.location.href = "/flasks"
    } catch (error) {
      console.error("Error creating flask:", error)
      alert("Error al crear el frasco")
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
              <h1 className="text-2xl font-bold">Agregar Nuevo Frasco</h1>
              <p className="text-muted-foreground">Registra un nuevo tipo de frasco en el inventario</p>
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
                    <FlaskConical className="h-5 w-5" />
                    <span>Información del Frasco</span>
                  </CardTitle>
                  <CardDescription>Datos principales del frasco</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {generatedReference && (
                    <div className="p-3 bg-muted rounded-lg">
                      <Label className="text-sm font-medium">Referencia Generada</Label>
                      <div className="text-lg font-mono font-bold">{generatedReference}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flask_type_id">Tipo de Frasco *</Label>
                      <Select
                        value={formData.flask_type_id}
                        onValueChange={(value) => handleInputChange("flask_type_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {flaskTypes.map((type : any) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {type.name} ({type.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size_ml">Tamaño (ml) *</Label>
                      <Input
                        id="size_ml"
                        type="number"
                        value={formData.size_ml}
                        onChange={(e) => handleInputChange("size_ml", e.target.value)}
                        placeholder="ej. 30"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="material">Material</Label>
                      <Select value={formData.material} onValueChange={(value) => handleInputChange("material", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="glass">Vidrio</SelectItem>
                          <SelectItem value="crystal">Cristal</SelectItem>
                          <SelectItem value="plastic">Plástico</SelectItem>
                          <SelectItem value="acrylic">Acrílico</SelectItem>
                          <SelectItem value="metal">Metal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Select value={formData.color} onValueChange={(value) => handleInputChange("color", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clear">Transparente</SelectItem>
                          <SelectItem value="amber">Ámbar</SelectItem>
                          <SelectItem value="black">Negro</SelectItem>
                          <SelectItem value="white">Blanco</SelectItem>
                          <SelectItem value="blue">Azul</SelectItem>
                          <SelectItem value="green">Verde</SelectItem>
                          <SelectItem value="gold">Dorado</SelectItem>
                          <SelectItem value="silver">Plateado</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Label htmlFor="cost_per_unit">Costo por Unidad</Label>
                      <Input
                        id="cost_per_unit"
                        type="number"
                        step="0.01"
                        value={formData.cost_per_unit}
                        onChange={(e) => handleInputChange("cost_per_unit", e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación de Almacenamiento</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="ej. Almacén A-1, Estante 3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas Adicionales</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Observaciones sobre el frasco..."
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
                    <Label htmlFor="current_stock">Stock Inicial</Label>
                    <Input
                      id="current_stock"
                      type="number"
                      value={formData.current_stock}
                      onChange={(e) => handleInputChange("current_stock", e.target.value)}
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min_stock">Stock Mínimo *</Label>
                    <Input
                      id="min_stock"
                      type="number"
                      value={formData.min_stock}
                      onChange={(e) => handleInputChange("min_stock", e.target.value)}
                      placeholder="0"
                      min="0"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Alerta cuando el stock esté por debajo de este valor
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_stock">Stock Máximo</Label>
                    <Input
                      id="max_stock"
                      type="number"
                      value={formData.max_stock}
                      onChange={(e) => handleInputChange("max_stock", e.target.value)}
                      placeholder="Opcional"
                      min="0"
                    />
                    <p className="text-sm text-muted-foreground">Capacidad máxima de almacenamiento</p>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <div className="mt-6 space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Guardando..." : "Guardar Frasco"}
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
