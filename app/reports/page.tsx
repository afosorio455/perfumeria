"use client"
import { Navbar } from "@/components/navbar"
import { ReportsContent } from "@/components/reports-content"

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ReportsContent />
    </div>
  )
}
