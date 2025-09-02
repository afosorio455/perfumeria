"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/lib/supabase/client"
import { Plus, Loader2 } from "lucide-react"

export function CreateUserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "vendedor",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    // Validaciones
    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .insert({
          name: formData.name,
          email: formData.email,
          password_hash: formData.password, // En producción, hashear la contraseña
          role: formData.role,
          status: 'activo'
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') { // Código de error para unique constraint
          setError("El email ya está registrado")
        } else {
          setError(error.message || "Error al crear el usuario")
        }
      } else {
        setSuccess("Usuario creado exitosamente")
        // Limpiar formulario
        setFormData({
          name: "",
          email: "",
          password: "",
          role: "vendedor",
        })
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setSuccess(""), 3000)
      }
    } catch (error) {
      console.error('Error al crear usuario:', error)
      setError("Error inesperado al crear el usuario")
    }

    setLoading(false)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          placeholder="Nombre del usuario"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="usuario@empresa.com"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Rol</Label>
        <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vendedor">Vendedor</SelectItem>
            <SelectItem value="supervisor">Supervisor</SelectItem>
            <SelectItem value="administrador">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña Temporal</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          placeholder="Mínimo 6 caracteres"
          required
        />
        <p className="text-xs text-muted-foreground">
          El usuario podrá cambiar esta contraseña después del primer inicio de sesión
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Creando usuario...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Crear Usuario
          </>
        )}
      </Button>
    </form>
  )
}
