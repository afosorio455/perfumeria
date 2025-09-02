"use client"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Droplets, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"

export function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  return (
    <header className="bg-background shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Droplets className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">PerfumeStock</h1>
          </div>

          <nav className="hidden md:flex space-x-4">
            <Link href="/">
              <Button variant="ghost">Dashboard</Button>
            </Link>
            <Link href="/inventory">
              <Button variant="ghost">Inventario</Button>
            </Link>
            <Link href="/sales">
              <Button variant="ghost">Ventas</Button>
            </Link>
            <Link href="/flasks">
              <Button variant="ghost">Frascos</Button>
            </Link>
            <Link href="/reports">
              <Button variant="ghost">Reportes</Button>
            </Link>
            
            <Link href="/users">
              <Button variant="ghost">Usuarios</Button>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user.nombre}</span>
                <span className="text-xs text-muted-foreground">({user.role})</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
