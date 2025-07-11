"use client"
import { Navbar } from "@/components/navbar"
import { NewPerfumeForm } from "@/components/new-perfume-form"

export default function NewPerfumePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <NewPerfumeForm />
    </div>
  )
}
