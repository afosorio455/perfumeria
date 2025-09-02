"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: string
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, loading, isAuthenticated, hasRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) {
        router.push("/login")
      } else if (requiredRole && !hasRole(requiredRole)) {
        // Redirigir si el usuario no tiene el rol requerido
        router.push("/")
      }
    }
  }, [user, loading, router, requiredRole])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated()) {
    return null
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return null
  }

  return <>{children}</>
}
