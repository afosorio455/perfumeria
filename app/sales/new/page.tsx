"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Plus, Trash2, ShoppingCart, Calculator } from "lucide-react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { createClient } from "@/lib/supabase/client"

interface SaleItem {
  id: string
  perfumeId: number
  perfumeName: string
  perfumeBrand: string
  bottleType: string
  milliliters: number
  isRefill: boolean
  unitPrice: number
  quantity: number
  subtotal: number
  availableStock: number
  saleId?:number
}

export default function NewSalePage() {
  const supabase = createClient()
  const [perfumes, setPerfumes] = useState<any[]>([])

  useEffect(() => {
    fetchPerfumes()
  }, [])

  const fetchPerfumes = async () => {
    try {
      const { data: perfumesQuery } = await supabase
        .from("perfumes")
        .select("id, name, brand, current_stock, price_per_ml")
        .eq("status", "activo")

      console.log("perfumes>", perfumesQuery)
      setPerfumes(perfumesQuery || [])
    } catch (error) {
      console.error("Error fetching perfumes:", error)
    }

  }


  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    contact: "",
    email: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("")
  const [notes, setNotes] = useState("")
  const [currentItem, setCurrentItem] = useState({
    perfumeId: "",
    bottleType: "",
    milliliters: "",
    isRefill: false,
    quantity: "1",
  })

  // Datos de ejemplo de perfumes disponibles
  const availablePerfumes = [
    { id: 1, name: "Chanel No. 5", brand: "Chanel", stock: 250, pricePerMl: 5.0 },
    { id: 2, name: "Dior Sauvage", brand: "Dior", stock: 180, pricePerMl: 4.5 },
    { id: 3, name: "Creed Aventus", brand: "Creed", stock: 25, pricePerMl: 8.0 },
    { id: 4, name: "Tom Ford Black Orchid", brand: "Tom Ford", stock: 120, pricePerMl: 6.0 },
  ]

  const bottleTypes = [
    { value: "atomizador", label: "Atomizador" },
    { value: "roll-on", label: "Roll-on" },
    { value: "spray", label: "Spray" },
    { value: "gotero", label: "Gotero" },
    { value: "crema", label: "Crema" },
  ]

  const commonSizes = [5, 10, 15, 20, 25, 30, 50, 100]

  const calculateItemPrice = () => {
    const perfume = perfumes.find((p) => p.id === Number.parseInt(currentItem.perfumeId))
    if (!perfume || !currentItem.milliliters) return 0

    const basePrice = perfume.price_per_ml * Number.parseInt(currentItem.milliliters)
    // Descuento del 10% para recargas
    const discount = currentItem.isRefill ? 0.1 : 0
    return basePrice * (1 - discount)
  }

  const addItemToSale = () => {
    const perfume = perfumes.find((p) => p.id === Number.parseInt(currentItem.perfumeId))
    if (!perfume || !currentItem.bottleType || !currentItem.milliliters) return

    const unitPrice = calculateItemPrice()
    const quantity = Number.parseInt(currentItem.quantity)
    const totalMl = Number.parseInt(currentItem.milliliters) * quantity

    if (totalMl > perfume.stock) {
      alert(`Stock insuficiente. Disponible: ${perfume.stock} ml`)
      return
    }

    const newItem: SaleItem = {
      id: Date.now().toString(),
      perfumeId: perfume.id,
      perfumeName: perfume.name,
      perfumeBrand: perfume.brand,
      bottleType: currentItem.bottleType,
      milliliters: Number.parseInt(currentItem.milliliters),
      isRefill: currentItem.isRefill,
      unitPrice: unitPrice,
      quantity: quantity,
      subtotal: unitPrice * quantity,
      availableStock: perfume.stock,
    }

    setSaleItems([...saleItems, newItem])
    setCurrentItem({
      perfumeId: "",
      bottleType: "",
      milliliters: "",
      isRefill: false,
      quantity: "1",
    })
  }

  const removeItem = (itemId: string) => {
    setSaleItems(saleItems.filter((item) => item.id !== itemId))
  }

  const getTotalAmount = () => {
    return saleItems.reduce((total, item) => total + item.subtotal, 0)
  }

  const getTotalItems = () => {
    return saleItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalMilliliters = () => {
    return saleItems.reduce((total, item) => total + item.milliliters * item.quantity, 0)
  }

  const handleSubmitSale = async () => {
    if (saleItems.length === 0) {
      alert("Debe agregar al menos un producto a la venta")
      return
    }

    const saleData = {
      items: saleItems,
      customer: customerInfo,
      paymentMethod,
      notes,
      totalAmount: getTotalAmount(),
      totalItems: getTotalItems(),
      totalMilliliters: getTotalMilliliters(),
    }

    console.log("Venta registrada:", saleData)
    // Aquí se enviarían los datos a la base de datos
    alert("Venta registrada exitosamente")
    
      
    const { data, error } = await supabase
      .from("sales")
      .insert({
        sale_date: new Date().toISOString(),
        total_amount: saleData.totalAmount,
        total_items: saleData.totalItems,
        customer_name: saleData.customer.name,
        customer_contact: saleData.customer.contact,
        payment_method: saleData.paymentMethod,
        notes: saleData.notes,
        created_by: 5
      }).select('id').single()

      console.log("data: ", data)

      const dataTrasformSaleDetails = saleItems.map(saleitem => ({
        sale_id: data?.id,
        perfume_id: saleitem.perfumeId,
        quantity: saleitem.quantity,
        unit_price: saleitem.unitPrice,
        subtotal: saleitem.subtotal,
        is_refill: saleitem.isRefill,
        milliliter: saleitem.milliliters,
      }))

      console.log("saleItems 1: ", saleItems)
      console.log("saleItems 2: ", dataTrasformSaleDetails)

      const { error: errorSalesDetails } = await supabase
        .from('sale_details')
        .insert(dataTrasformSaleDetails)

    if (error) {
      console.error("Error al registrar la venta:", error)
    }

  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <header className="bg-background shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/sales">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Nueva Venta</h1>
              <p className="text-muted-foreground">Registra una nueva transacción de venta</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de Producto */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Producto</CardTitle>
                <CardDescription>Selecciona el perfume y especifica los detalles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="perfume">Perfume *</Label>
                    <Select
                      value={currentItem.perfumeId}
                      onValueChange={(value) => setCurrentItem({ ...currentItem, perfumeId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un perfume" />
                      </SelectTrigger>
                      <SelectContent>
                        {perfumes.map((perfume) => (
                          <SelectItem key={perfume.id} value={perfume.id.toString()}>
                            <div className="flex justify-between items-center w-full">
                              <span>
                                {perfume.name} - {perfume.current_stock}
                              </span>
                              <Badge variant="outline" className="ml-2">
                                {perfume.stock} ml
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bottleType">Tipo de Frasco *</Label>
                    <Select
                      value={currentItem.bottleType}
                      onValueChange={(value) => setCurrentItem({ ...currentItem, bottleType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {bottleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="milliliters">Mililitros *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="milliliters"
                        type="number"
                        value={currentItem.milliliters}
                        onChange={(e) => setCurrentItem({ ...currentItem, milliliters: e.target.value })}
                        placeholder="ml"
                        min="1"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {commonSizes.map((size) => (
                        <Button
                          key={size}
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentItem({ ...currentItem, milliliters: size.toString() })}
                          className="h-6 px-2 text-xs"
                        >
                          {size}ml
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Cantidad</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={currentItem.quantity}
                      onChange={(e) => setCurrentItem({ ...currentItem, quantity: e.target.value })}
                      min="1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Precio Unitario</Label>
                    <div className="flex items-center space-x-2 p-2 bg-muted rounded">
                      <Calculator className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">${calculateItemPrice().toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRefill"
                    checked={currentItem.isRefill}
                    onCheckedChange={(checked) => setCurrentItem({ ...currentItem, isRefill: checked as boolean })}
                  />
                  <Label htmlFor="isRefill" className="text-sm">
                    Es recarga (10% descuento)
                  </Label>
                </div>

                <Button
                  onClick={addItemToSale}
                  disabled={!currentItem.perfumeId || !currentItem.bottleType || !currentItem.milliliters}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar a la Venta
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Productos */}
            {saleItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Productos en la Venta</CardTitle>
                  <CardDescription>{saleItems.length} productos agregados</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Producto</TableHead>
                        <TableHead>Tipo/ml</TableHead>
                        <TableHead>Cant.</TableHead>
                        <TableHead>Precio</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {saleItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.perfumeName}</div>
                              <div className="text-sm text-muted-foreground">{item.perfumeBrand}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.bottleType}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.milliliters} ml
                                {item.isRefill && (
                                  <Badge variant="secondary" className="ml-1 text-xs">
                                    Recarga
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                          <TableCell className="font-medium">${item.subtotal.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumen y Cliente */}
          <div className="space-y-6">
            {/* Resumen de Venta */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen de Venta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total de productos:</span>
                    <span className="font-medium">{getTotalItems()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total mililitros:</span>
                    <span className="font-medium">{getTotalMilliliters()} ml</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total a pagar:</span>
                    <span>${getTotalAmount().toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Información del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nombre</Label>
                  <Input
                    id="customerName"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Nombre del cliente"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerContact">Teléfono</Label>
                  <Input
                    id="customerContact"
                    value={customerInfo.contact}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, contact: e.target.value })}
                    placeholder="Número de teléfono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email (opcional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Método de Pago */}
            <Card>
              <CardHeader>
                <CardTitle>Método de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                    <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                    <SelectItem value="nequi">Nequi</SelectItem>
                    <SelectItem value="daviplata">Daviplata</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            <div className="space-y-3">
              <Button onClick={handleSubmitSale} disabled={saleItems.length === 0} className="w-full" size="lg">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Registrar Venta
              </Button>
              <Link href="/sales">
                <Button variant="outline" className="w-full">
                  Cancelar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
