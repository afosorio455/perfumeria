"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface User {
  id: number
  nombre: string
  email: string
  role: string
  status: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuthStatus = () => {
      const storedUser = localStorage.getItem('perfumestock_user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setUser(userData)
        } catch (error) {
          console.error('Error parsing stored user:', error)
          localStorage.removeItem('perfumestock_user')
        }
      }
      setLoading(false)
    }

    checkAuthStatus()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // Query the users table to find the user
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('status', 'activo')
        .single()

      if (error) {
        return { data: null, error: { message: 'Usuario no encontrado' } }
      }

      if (!users) {
        return { data: null, error: { message: 'Usuario no encontrado' } }
      }

      // In a real application, you should hash the password and compare with password_hash
      // For now, we'll do a simple comparison (you should implement proper password hashing)
      if (users.password_hash !== password) {
        return { data: null, error: { message: 'Contraseña incorrecta' } }
      }

      // Store user data in localStorage
      const userData = {
        id: users.id,
        nombre: users.nombre,
        email: users.email,
        role: users.role,
        status: users.status
      }
      
      localStorage.setItem('perfumestock_user', JSON.stringify(userData))
      setUser(userData)

      return { data: userData, error: null }
    } catch (error) {
      console.error('Error during sign in:', error)
      return { data: null, error: { message: 'Error al iniciar sesión' } }
    }
  }

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Hash the password before storing (you should implement proper password hashing)
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          password_hash: password, // In production, hash this password
          nombre: userData.nombre,
          role: userData.role || 'user',
          status: 'activo'
        })
        .select()
        .single()

      if (error) {
        return { data: null, error }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error during sign up:', error)
      return { data: null, error: { message: 'Error al crear la cuenta' } }
    }
  }

  const signOut = async () => {
    try {
      localStorage.removeItem('perfumestock_user')
      setUser(null)
      return { error: null }
    } catch (error) {
      console.error('Error during sign out:', error)
      return { error: { message: 'Error al cerrar sesión' } }
    }
  }

  const isAuthenticated = () => {
    return user !== null && user.status === 'activo'
  }

  const hasRole = (role: string) => {
    return user?.role === role
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    hasRole
  }
}
