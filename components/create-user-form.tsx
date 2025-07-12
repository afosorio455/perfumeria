"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


export function CreateUserForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "vendedor",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

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

    </form>
  )
}
