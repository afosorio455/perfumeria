"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Beaker } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function AlcoholConsumptionForm() {
  const [formData, setFormData] = useState({
    alcohol_id: "",
    flask_id: "",
    perfume_id: "",
    batch_reference: "",
    quantity_used_ml: "",
    purpose: "",
    consumption_date: new Date().toISOString().split("T")[0],
    operator_notes: "",
  })
  const [alcoholTypes, setAlcoholTypes] = useState([])
  const [flasks, setFlasks] = useState([])
  const [perfumes, setPerfumes] = useState([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch alcohol types
      const { data: alcoholData } = await supabase
        .from("alcohol_inventory")
        .select("*")
        .eq("status", "active")
        .order("name")

      // Fetch flasks
      const { data: flasksData } = await supabase.from("flask_inventory_summary").select("*").order("reference_id")

      // Fetch perfumes
      const { data: perfumesData } = await supabase
        .from("perfumes")
        .select("id, name, brand")
        .eq("status", "activo")
        .order("name")

      setAlcoholTypes(alcoholData || [])
      setFlasks(flasksData || [])
      setPerfumes(perfumesData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const consumptionData = {
        alcohol_id: Number.parseInt(formData.alcohol_id),
        flask_id: formData.flask_id ? Number.parseInt(formData.flask_id) : null,
        perfume_id: formData.perfume_id ? Number.parseInt(formData.perfume_id) : null,
        batch_reference: formData.batch_reference,
        quantity_used_ml: Number.parseInt(formData.quantity_used_ml),
        purpose: formData.purpose,
        consumption_date: formData.consumption_date,
        operator_notes: formData.operator_notes,
      }

      const { error } = await supabase.from("alcohol_consumption").insert([consumptionData])

      if (error) throw error

      alert("Consumo de alcohol registrado exitosamente")
      // Reset form
      setFormData({
        alcohol_id: "",
        flask_id: "",
        perfume_id: "",
        batch_reference: "",
        quantity_used_ml: "",
        purpose: "",
        consumption_date: new Date().toISOString().split("T")[0],
        operator_notes: "",
      })
    } catch (error) {
      console.error("Error registering consumption:", error)
      alert("Error al registrar el consumo")
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
              <h1 className="text-2xl font-bold">Registrar Consumo de Alcohol</h1>
              <p className="text-muted-foreground">Documenta el uso de alcohol en la preparación</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información del Consumo */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Beaker className="h-5 w-5" />
                    <span>Detalles del Consumo</span>
                  </CardTitle>
                  <CardDescription>Información sobre el uso de alcohol</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="alcohol_id">Tipo de Alcohol *</Label>
                      <Select
                        value={formData.alcohol_id}
                        onValueChange={(value) => handleInputChange("alcohol_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el alcohol" />
                        </SelectTrigger>
                        <SelectContent>
                          {alcoholTypes.map((alcohol) => (
                            <SelectItem key={alcohol.id} value={alcohol.id.toString()}>
                              {alcohol.name} ({alcohol.concentration_percentage}%)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity_used_ml">Cantidad Usada (ml) *</Label>
                      <Input
                        id="quantity_used_ml"
                        type="number"
                        value={formData.quantity_used_ml}
                        onChange={(e) => handleInputChange("quantity_used_ml", e.target.value)}
                        placeholder="0"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Propósito *</Label>
                      <Select value={formData.purpose} onValueChange={(value) => handleInputChange("purpose", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el propósito" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dilution">Dilución</SelectItem>
                          <SelectItem value="cleaning">Limpieza</SelectItem>
                          <SelectItem value="preparation">Preparación</SelectItem>
                          <SelectItem value="sterilization">Esterilización</SelectItem>
                          <SelectItem value="mixing">Mezcla</SelectItem>
                          <SelectItem value="other">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consumption_date">Fecha de Consumo *</Label>
                      <Input
                        id="consumption_date"
                        type="date"
                        value={formData.consumption_date}
                        onChange={(e) => handleInputChange("consumption_date", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch_reference">Referencia de Lote</Label>
                    <Input
                      id="batch_reference"
                      value={formData.batch_reference}
                      onChange={(e) => handleInputChange("batch_reference", e.target.value)}
                      placeholder="ej. BATCH-2024-001"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="flask_id">Frasco Relacionado (Opcional)</Label>
                      <Select value={formData.flask_id} onValueChange={(value) => handleInputChange("flask_id", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un frasco" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          {flasks.map((flask) => (
                            <SelectItem key={flask.id} value={flask.id.toString()}>
                              {flask.reference_id} - {flask.flask_type_name} ({flask.size_ml}ml)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="perfume_id">Perfume Relacionado (Opcional)</Label>
                      <Select
                        value={formData.perfume_id}
                        onValueChange={(value) => handleInputChange("perfume_id", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un perfume" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Ninguno</SelectItem>
                          {perfumes.map((perfume) => (
                            <SelectItem key={perfume.id} value={perfume.id.toString()}>
                              {perfume.name} - {perfume.brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operator_notes">Notas del Operador</Label>
                    <Textarea
                      id="operator_notes"
                      value={formData.operator_notes}
                      onChange={(e) => handleInputChange("operator_notes", e.target.value)}
                      placeholder="Observaciones sobre el proceso, condiciones, etc..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Resumen */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Resumen</CardTitle>
                  <CardDescription>Información del registro</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.alcohol_id && formData.alcohol_id !== "none" && (
                    <div className="p-3 bg-muted rounded-lg">
                      <Label className="text-sm font-medium">Alcohol Seleccionado</Label>
                      <div className="text-sm">
                        {alcoholTypes.find((a) => a.id.toString() === formData.alcohol_id)?.name}
                      </div>
                    </div>
                  )}

                  {formData.quantity_used_ml && (
                    <div className="p-3 bg-muted rounded-lg">
                      <Label className="text-sm font-medium">Cantidad</Label>
                      <div className="text-lg font-bold">{formData.quantity_used_ml} ml</div>
                    </div>
                  )}

                  {formData.purpose && formData.purpose !== "none" && (
                    <div className="p-3 bg-muted rounded-lg">
                      <Label className="text-sm font-medium">Propósito</Label>
                      <div className="text-sm capitalize">{formData.purpose}</div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <div className="mt-6 space-y-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Registrando..." : "Registrar Consumo"}
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
