import { Navbar } from "@/components/navbar"
import { SalesContent } from "@/components/sales-content"

export default function SalesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SalesContent />
    </div>
  )
}
