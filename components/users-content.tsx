"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, UserPlus } from "lucide-react"
import { CreateUserForm } from "./create-user-form"
import { UsersList } from "./users-list"

export function UsersContent() {
  const [activeTab, setActiveTab] = useState("list")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra los usuarios del sistema y sus permisos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Lista de Usuarios</span>
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4" />
            <span>Crear Usuario</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                Gestiona los usuarios existentes, cambia roles y estados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UsersList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crear Nuevo Usuario</CardTitle>
              <CardDescription>
                Agrega nuevos usuarios al sistema con roles y permisos específicos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateUserForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setActiveTab("create")}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Usuario</span>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab("list")}
          className="flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Ver Usuarios</span>
        </Button>
      </div>
    </div>
  )
}
